// UsTwo data store.
// Everything the couple creates is an "entry": { id, kind, author: 'A'|'B', data, deleted, updated_at }.
// Entries live in localStorage and, once paired, are mirrored to a Supabase `entries` table
// with realtime updates. Writes are optimistic and queued in an outbox while offline.
// Paired data is end-to-end encrypted (js/crypto.js): the server stores ciphertext only.
(function () {
  const KEY = 'ustwo_v2';
  const LEGACY_KEY = 'ustwo_state';
  const cfg = window.USTWO_CONFIG || {};

  let state = load();
  let sb = null;          // Supabase client, once loaded
  let channel = null;     // realtime channel
  let listeners = [];
  let remoteListeners = [];
  let syncStatus = 'offline'; // offline | connecting | live | error
  let coupleKey = null;   // AES-GCM key shared by the two phones; never leaves this device
  const X = () => window.UsTwoCrypto;
  // Public keys must stay readable so the two phones can find each other's.
  const PLAIN_KINDS = ['pubkey'];
  // Left outside the ciphertext because the database's blind-reveal rule needs it. It's a random id.
  const PLAIN_FIELDS = ['promptKey'];

  function blank() {
    return {
      mode: 'local',        // 'local' (one device, partner switcher) or 'paired'
      activePartner: 'A',   // local mode only
      role: null,           // paired mode: 'A' or 'B'
      coupleId: null,
      pairCode: null,       // shown to partner A until B joins
      keys: null,           // this phone's key pair { publicJwk, privateJwk } (paired mode)
      partnerPub: null,     // partner's public key (JWK)
      entries: {},
      outbox: [],
      ui: { tab: 'daily', deckCategory: 'deep', cardIndex: 0, ritualsTab: 'bucket' }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      return legacy ? migrateLegacy(legacy) : seed();
    } catch (e) {
      console.warn('UsTwo: could not read saved state, starting fresh', e);
      return seed();
    }
  }

  // Convert the original single-file prototype's state into entries.
  function migrateLegacy(old) {
    const s = blank();
    const now = new Date().toISOString();
    const add = (id, kind, author, data) => { s.entries[id] = { id, kind, author, data, deleted: false, updated_at: now }; };
    s.activePartner = old.activePartner === 'B' ? 'B' : 'A';
    if (old.vibeA) add('vibe:A', 'vibe', 'A', { text: String(old.vibeA) });
    if (old.vibeB) add('vibe:B', 'vibe', 'B', { text: String(old.vibeB) });
    const key = 'legacy-' + (old.promptIndex || 0);
    add('prompt:current', 'prompt', 'A', { key, text: window.UsTwoContent.dailyPrompts[old.promptIndex || 0] });
    ['A', 'B'].forEach(p => {
      const ans = old['ans' + p];
      if (ans) {
        add(`answer:${key}:${p}`, 'answer', p, { promptKey: key, text: String(ans) });
        add(`answered:${key}:${p}`, 'answered', p, { promptKey: key });
      }
    });
    (old.notes || []).forEach((n, i) => {
      const author = n.author === 'Partner B' ? 'B' : 'A';
      add(`note:legacy${i}`, 'note', author, { text: String(n.text || '') });
    });
    return s;
  }

  function seed() {
    const s = blank();
    const now = new Date().toISOString();
    const C = window.UsTwoContent;
    const key = uid();
    s.entries['prompt:current'] = { id: 'prompt:current', kind: 'prompt', author: 'A', data: { key, text: C.dailyPrompts[0] }, deleted: false, updated_at: now };
    s.entries['vibe:A'] = { id: 'vibe:A', kind: 'vibe', author: 'A', data: { text: C.vibes[0] }, deleted: false, updated_at: now };
    s.entries['vibe:B'] = { id: 'vibe:B', kind: 'vibe', author: 'B', data: { text: C.vibes[3] }, deleted: false, updated_at: now };
    // Placeholder names for the demo; each partner can change theirs in settings.
    s.entries['profile:A'] = { id: 'profile:A', kind: 'profile', author: 'A', data: { name: 'Alex' }, deleted: false, updated_at: now };
    s.entries['profile:B'] = { id: 'profile:B', kind: 'profile', author: 'B', data: { name: 'Sam' }, deleted: false, updated_at: now };
    s.entries['note:welcome'] = { id: 'note:welcome', kind: 'note', author: 'B', data: { text: 'Still thinking about last night. Come home early.' }, deleted: false, updated_at: new Date(Date.now() - 864e5).toISOString() };
    return s;
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('UsTwo: save failed', e); }
  }

  function emit() { persist(); listeners.forEach(fn => fn()); }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  // ---------- Public read API ----------
  function me() { return state.mode === 'paired' ? state.role : state.activePartner; }
  function get(id) { const e = state.entries[id]; return e && !e.deleted ? e : null; }
  function all(kind) {
    return Object.values(state.entries)
      .filter(e => e.kind === kind && !e.deleted)
      .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  }

  // ---------- Public write API ----------
  function put(id, kind, data, opts) {
    const prev = state.entries[id];
    // In paired mode the server decides the author from the signed-in user; mirror that locally.
    const author = (prev && opts && opts.keepAuthor) ? prev.author : me();
    const entry = { id, kind, author, data, deleted: false, updated_at: new Date().toISOString() };
    state.entries[id] = entry;
    queue(entry);
    emit();
    return entry;
  }

  function remove(id) {
    const prev = state.entries[id];
    if (!prev) return;
    const entry = Object.assign({}, prev, { deleted: true, updated_at: new Date().toISOString() });
    state.entries[id] = entry;
    queue(entry);
    emit();
  }

  function setUi(patch) { Object.assign(state.ui, patch); emit(); }
  function setActivePartner(p) { if (state.mode === 'local') { state.activePartner = p; emit(); } }

  // ---------- Sync ----------
  function isConfigured() { return !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY); }

  function queue(entry) {
    if (state.mode !== 'paired') return;
    state.outbox = state.outbox.filter(e => e.id !== entry.id);
    state.outbox.push(entry);
    flush();
  }

  // ---------- Encryption ----------

  async function ensureKey() {
    if (coupleKey || !state.keys || !state.partnerPub || !state.coupleId) return false;
    coupleKey = await X().deriveCoupleKey(state.keys.privateJwk, state.partnerPub, state.coupleId);
    return true;
  }

  const needsKey = e => !PLAIN_KINDS.includes(e.kind);

  async function seal(e) {
    if (!needsKey(e)) return e.data;
    const out = {};
    PLAIN_FIELDS.forEach(f => { if (e.data && e.data[f] != null) out[f] = e.data[f]; });
    out.enc = await X().encrypt(coupleKey, e.data || {}, e.id);
    return out;
  }

  // Returns the readable data, or undefined when it can't be read yet (no key) or at all (tampered).
  async function open(row) {
    const d = row.data || {};
    if (!d.enc) return d;
    if (!coupleKey) return undefined;
    try { return await X().decrypt(coupleKey, d.enc, row.id); } catch (err) {
      console.warn('UsTwo: could not decrypt', row.id, err);
      return undefined;
    }
  }

  let flushing = false;
  async function flush() {
    if (!sb || !state.coupleId || flushing || !navigator.onLine) return;
    flushing = true;
    try {
      // Public keys go first; everything else waits in the outbox until the couple key exists.
      for (const e of state.outbox.slice()) {
        if (needsKey(e) && !coupleKey) continue;
        const { error } = await sb.from('entries').upsert({
          couple_id: state.coupleId, id: e.id, kind: e.kind, data: await seal(e), deleted: !!e.deleted
        }, { onConflict: 'couple_id,id' });
        if (error) throw error;
        state.outbox = state.outbox.filter(x => x !== e);
        persist();
      }
    } catch (err) {
      console.warn('UsTwo: sync push failed, will retry', err);
      setStatus('error');
    } finally {
      flushing = false;
    }
  }

  function setStatus(s) { syncStatus = s; listeners.forEach(fn => fn()); }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src; el.onload = resolve; el.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(el);
    });
  }

  async function client() {
    if (sb) return sb;
    if (!isConfigured()) throw new Error('Sync is not configured. Add your Supabase URL and anon key to config.js.');
    if (!window.supabase) await loadScript(cfg.SUPABASE_JS_URL);
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data } = await sb.auth.getSession();
    if (!data.session) {
      // Anonymous sign-in must be enabled in Supabase Auth settings.
      const { error } = await sb.auth.signInAnonymously();
      if (error) throw error;
    }
    return sb;
  }

  // Returns true when this row completed the key exchange (so earlier rows can now be read).
  async function mergeRemote(row, fromRealtime) {
    if (row.kind === 'pubkey') {
      if (row.author !== state.role && row.data && row.data.jwk) {
        const changed = JSON.stringify(state.partnerPub) !== JSON.stringify(row.data.jwk);
        if (changed) { state.partnerPub = row.data.jwk; coupleKey = null; }
        return await ensureKey();
      }
      return false;
    }
    // A local edit still waiting to be pushed wins over what the server has.
    if (state.outbox.some(e => e.id === row.id)) return false;
    const data = await open(row);
    if (data === undefined) return false;
    const incoming = { id: row.id, kind: row.kind, author: row.author, data, deleted: !!row.deleted, updated_at: row.updated_at };
    const prev = state.entries[incoming.id];
    state.entries[incoming.id] = incoming;
    if (fromRealtime && incoming.author !== state.role && !incoming.deleted) {
      remoteListeners.forEach(fn => fn(incoming, prev));
    }
    return false;
  }

  async function pull() {
    if (!sb || !state.coupleId) return;
    const { data, error } = await sb.from('entries').select('*').eq('couple_id', state.coupleId);
    if (error) { console.warn('UsTwo: pull failed', error); setStatus('error'); return; }
    // Keys first, so the rest can be decrypted in the same pass.
    const rows = data.slice().sort((a, b) => (a.kind === 'pubkey' ? -1 : 0) - (b.kind === 'pubkey' ? -1 : 0));
    for (const r of rows) await mergeRemote(r, false);
    emit();
    flush();
  }

  async function connect() {
    if (state.mode !== 'paired' || !state.coupleId) return;
    setStatus('connecting');
    try {
      await client();
      await ensureKey();
      // Refresh pairing status (has partner B joined yet?)
      const { data: couple } = await sb.from('couples').select('member_b').eq('id', state.coupleId).maybeSingle();
      if (couple && couple.member_b) state.pairCode = null;
      await pull();
      if (channel) sb.removeChannel(channel);
      channel = sb.channel('couple:' + state.coupleId)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'entries', filter: 'couple_id=eq.' + state.coupleId },
          payload => {
            if (!payload.new || !payload.new.id) return;
            mergeRemote(payload.new, true).then(keyReady => {
              emit();
              // Key exchange just finished: read anything we couldn't before, and send what was waiting.
              if (keyReady) { pull(); flush(); }
            });
          })
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'couples', filter: 'id=eq.' + state.coupleId },
          payload => { if (payload.new && payload.new.member_b) { state.pairCode = null; emit(); } })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') { setStatus('live'); flush(); }
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setStatus('error');
        });
    } catch (err) {
      console.warn('UsTwo: connect failed', err);
      setStatus('error');
      throw err;
    }
  }

  // Partner A: create a couple and get a 6-digit code to share. Existing local entries are uploaded.
  function requireCrypto() {
    if (!X() || !X().available()) throw new Error('Pairing needs a secure connection (HTTPS) so your data can be encrypted.');
  }

  function pubkeyEntry(role, keys) {
    return { id: `pubkey:${role}`, kind: 'pubkey', author: role, data: { jwk: keys.publicJwk }, deleted: false, updated_at: new Date().toISOString() };
  }

  async function createPair() {
    requireCrypto();
    await client();
    const keys = await X().generateKeyPair();
    const { data, error } = await sb.rpc('create_couple');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    state.mode = 'paired'; state.role = 'A'; state.coupleId = row.couple_id; state.pairCode = row.code;
    state.keys = keys; state.partnerPub = null; coupleKey = null;
    // Upload A's existing entries (encrypted, once B has joined). Partner B's demo data stays local-only.
    state.outbox = [pubkeyEntry('A', keys)].concat(Object.values(state.entries).filter(e => e.author === 'A' && !e.id.endsWith(':B')));
    persist();
    await connect();
    return row.code;
  }

  // Partner B: join with the code. Local demo data is replaced by the shared space.
  async function joinPair(code) {
    requireCrypto();
    await client();
    const keys = await X().generateKeyPair();
    const { data, error } = await sb.rpc('join_couple', { p_code: String(code).trim() });
    if (error) throw error;
    const coupleId = Array.isArray(data) ? data[0] : data;
    if (!coupleId) throw new Error('That code is invalid or has expired. Ask your partner for a new one.');
    state.mode = 'paired'; state.role = 'B'; state.coupleId = coupleId; state.pairCode = null;
    state.keys = keys; state.partnerPub = null; coupleKey = null;
    state.entries = {}; state.outbox = [pubkeyEntry('B', keys)];
    persist();
    await connect();
  }

  async function unpair() {
    if (sb && channel) sb.removeChannel(channel);
    channel = null;
    coupleKey = null;
    const fresh = blank();
    fresh.entries = state.entries; // keep a local copy
    fresh.ui = state.ui;
    state = fresh;
    setStatus('offline');
    emit();
  }

  function resetAll() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
    state = seed();
    emit();
  }

  // Data passed to the AI coach: recent answers and notes only, trimmed.
  function historyForCoach() {
    const lines = [];
    all('answer').slice(0, 10).forEach(e => lines.push(`Answer (${e.author}): ${e.data.text}`));
    all('note').slice(0, 10).forEach(e => lines.push(`Love note (${e.author}): ${e.data.text}`));
    all('bucket').slice(0, 10).forEach(e => lines.push(`Bucket list: ${e.data.text}${e.data.done ? ' (done)' : ''}`));
    return lines.join('\n').slice(0, 4000);
  }

  // Code both partners compare in settings; null until both public keys are known.
  async function safetyCode() {
    if (!state.keys || !state.partnerPub || !X()) return null;
    const mine = state.keys.publicJwk;
    return state.role === 'A' ? X().safetyCode(mine, state.partnerPub) : X().safetyCode(state.partnerPub, mine);
  }

  window.addEventListener('online', () => { flush(); pull(); });

  window.UsTwoStore = {
    get state() { return state; },
    get syncStatus() { return syncStatus; },
    get client() { return sb; },
    subscribe(fn) { listeners.push(fn); },
    onRemote(fn) { remoteListeners.push(fn); },
    me, get, all, put, remove, uid, setUi, setActivePartner,
    get encrypted() { return !!coupleKey; },
    isConfigured, connect, createPair, createClientOnly: client, joinPair, unpair, pull, resetAll, historyForCoach, safetyCode
  };
})();
