// UsTwo UI. All user-provided text is rendered with textContent (via `h`), never innerHTML.
(function () {
  const S = window.UsTwoStore;
  const C = window.UsTwoContent;
  const Coach = window.UsTwoCoach;
  const $ = id => document.getElementById(id);

  // ---------- Helpers ----------

  // Safe element builder: h('div', { class: '...', onclick: fn }, 'text', childEl, ...)
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    children.flat().forEach(c => {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return el;
  }

  function fill(el, ...children) { el.replaceChildren(...children.flat().filter(Boolean)); }

  const paired = () => S.state.mode === 'paired';
  const other = p => (p === 'A' ? 'B' : 'A');
  // Names come from each partner's 'profile:<A|B>' entry; set them in the settings sheet.
  function nameOf(p) {
    const e = S.get(`profile:${p}`);
    const n = e && e.data && typeof e.data.name === 'string' ? e.data.name.trim() : '';
    return n || null;
  }
  function who(p) {
    if (!paired()) return nameOf(p) || `Partner ${p}`;
    if (p === S.me()) return 'You';
    return nameOf(p) || 'Your partner';
  }
  // Mid-sentence form: "your partner" rather than "Your partner"; names stay as they are.
  const whoInline = p => { const w = who(p); return w === 'You' || w === 'Your partner' ? w.toLowerCase() : w; };
  const initial = p => (nameOf(p) || p).charAt(0).toUpperCase();

  function ago(iso) {
    if (!iso) return '';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 172800) return 'Yesterday';
    return new Date(iso).toLocaleDateString();
  }

  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((t - yearStart) / 864e5 + 1) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  let toastTimer;
  function toast(msg) {
    $('toastText').textContent = msg;
    $('toast').classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 2600);
  }

  const chip = (active) => active
    ? 'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-600 text-white'
    : 'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700';

  // ---------- Navigation ----------

  // Line icons, built as SVG elements: [tag, attributes] per shape.
  const ICONS = {
    daily: [['path', { d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' }]],
    deck: [['rect', { x: 4, y: 6, width: 12, height: 15, rx: 2 }], ['path', { d: 'M8 3h10a2 2 0 0 1 2 2v13' }]],
    jar: [['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }], ['path', { d: 'M3 7l9 6 9-6' }]],
    spark: [['path', { d: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z' }]],
    coach: [['path', { d: 'M4 5h16v11H9l-5 4z' }]],
    rituals: [['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }], ['path', { d: 'M3 10h18M8 3v4M16 3v4' }]]
  };
  function icon(name) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    ICONS[name].forEach(([tag, attrs]) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      svg.appendChild(el);
    });
    return svg;
  }

  const TABS = [
    ['daily', 'Tonight'],
    ['deck', 'Cards'],
    ['jar', 'Notes'],
    ['spark', 'Spark'],
    ['coach', 'Coach'],
    ['rituals', 'Rituals']
  ];

  function renderNav() {
    const tab = S.state.ui.tab;
    TABS.forEach(([t]) => $(`tab-${t}`).classList.toggle('hidden', t !== tab));
    fill($('navBar'), TABS.map(([t, label]) =>
      h('button', {
        class: 'flex flex-col items-center gap-1 px-1 ' + (t === tab ? 'text-rose-300' : 'text-slate-500 hover:text-slate-200'),
        'aria-current': t === tab ? 'page' : null,
        onclick: () => S.setUi({ tab: t })
      }, icon(t), h('span', { class: 'text-[10px] font-medium tracking-wider uppercase' }, label))
    ));
  }

  // ---------- Header & pulse ----------

  function renderHeader() {
    const isA = S.me() === 'A';
    $('partnerSwitcher').classList.toggle('hidden', paired());
    $('btnPartnerA').className = 'px-3 py-1 rounded-full text-xs font-medium transition ' + (isA ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white');
    $('btnPartnerB').className = 'px-3 py-1 rounded-full text-xs font-medium transition ' + (!isA ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white');
    $('btnPartnerA').textContent = who('A');
    $('btnPartnerB').textContent = who('B');
    $('activePartnerLabel').textContent = paired() ? '' : `As ${who(S.me())}`;

    const labels = {
      offline: paired() ? 'Offline · changes will sync later' : 'Just the two of you',
      connecting: 'Connecting…',
      live: S.state.pairCode ? 'Waiting for your partner to join' : 'Together · in sync',
      error: 'Sync issue · retrying'
    };
    $('syncLabel').textContent = labels[paired() ? S.syncStatus : 'offline'];
  }

  function renderPulse() {
    ['A', 'B'].forEach(p => {
      const v = S.get(`vibe:${p}`);
      $(`vibeLabel${p}`).textContent = who(p);
      $(`status${p}`).textContent = v ? v.data.text : '—';
    });
    const mine = S.get(`vibe:${S.me()}`);
    fill($('vibeButtons'), C.vibes.map(v =>
      h('button', {
        class: 'shrink-0 px-3 py-1.5 rounded-lg border transition ' + (mine && mine.data.text === v ? 'bg-rose-600/30 border-rose-500/60' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'),
        onclick: () => S.put(`vibe:${S.me()}`, 'vibe', { text: v })
      }, v)
    ));
  }

  // ---------- Daily sync (blind reveal) ----------

  function currentPrompt() {
    return S.get('prompt:current') || { data: { key: 'none', text: C.dailyPrompts[0] } };
  }

  function renderDaily() {
    const p = currentPrompt();
    const key = p.data.key;
    $('dailyQuestionText').textContent = `"${p.data.text}"`;

    const me = S.me();
    const mine = S.get(`answer:${key}:${me}`);
    const theirsMarked = S.get(`answered:${key}:${other(me)}`);
    const both = !!(mine && theirsMarked);

    const badge = $('revealStatusBadge');
    badge.textContent = both ? 'Revealed' : 'Sealed until you both answer';
    badge.className = both ? 'text-xs text-teal-300 font-medium' : 'text-xs text-slate-400';
    $('btnLockIn').textContent = mine ? 'Rewrite my answer' : 'Seal my answer';

    ['A', 'B'].forEach(x => {
      $(`ansLabel${x}`).textContent = who(x);
      const disp = $(`ansDisplay${x}`);
      const ans = S.get(`answer:${key}:${x}`);
      const marked = S.get(`answered:${key}:${x}`);
      if (x === me) {
        disp.textContent = ans ? ans.data.text : 'Not written yet';
        disp.className = ans ? 'text-sm text-slate-100' : 'text-sm text-slate-400 italic';
      } else if (both && ans) {
        disp.textContent = ans.data.text;
        disp.className = 'text-sm text-slate-100';
      } else if (both) {
        disp.textContent = 'Unlocking…';
        disp.className = 'text-sm text-slate-400 italic';
      } else {
        disp.textContent = marked ? 'Sealed. Write yours to open it.' : `Waiting for ${whoInline(x)}...`;
        disp.className = 'text-sm text-slate-400 italic';
      }
    });
  }

  function syncDailyInput() {
    const p = currentPrompt();
    const mine = S.get(`answer:${p.data.key}:${S.me()}`);
    $('dailyInput').value = mine ? mine.data.text : '';
  }

  function submitDailyAnswer() {
    const val = $('dailyInput').value.trim();
    if (!val) return;
    const key = currentPrompt().data.key;
    const me = S.me();
    S.put(`answer:${key}:${me}`, 'answer', { promptKey: key, text: val });
    S.put(`answered:${key}:${me}`, 'answered', { promptKey: key });
    // Server only reveals the partner's answer after ours is stored; fetch it now.
    if (paired()) setTimeout(() => S.pull(), 800);
    toast('Sealed');
  }

  function setPrompt(text) {
    S.put('prompt:current', 'prompt', { key: S.uid(), text }, { keepAuthor: true });
    $('dailyInput').value = '';
    fill($('promptSuggestions'));
    $('promptSuggestions').classList.add('hidden');
  }

  function nextPrompt() {
    const list = C.dailyPrompts;
    const i = list.indexOf(currentPrompt().data.text);
    setPrompt(list[(i + 1) % list.length]);
  }

  async function suggestPrompts() {
    const box = $('promptSuggestions');
    box.classList.remove('hidden');
    fill(box, h('p', { class: 'text-xs text-slate-400' }, Coach.aiAvailable() ? 'Writing questions from your history…' : 'Shuffling questions…'));
    try {
      const res = await Coach.generatePrompts();
      fill(box,
        h('p', { class: 'text-xs text-slate-400' }, res.offline ? 'From the built-in pool (AI coach not configured):' : 'Pick one for today:'),
        (res.prompts || []).map(t => h('button', {
          class: 'block w-full text-left text-sm bg-slate-950/70 border border-slate-800 hover:border-rose-500/60 rounded-xl px-3 py-2',
          onclick: () => setPrompt(t)
        }, t)),
        h('button', { class: 'text-xs text-slate-500 hover:text-slate-300', onclick: () => { box.classList.add('hidden'); } }, 'Close')
      );
    } catch (err) {
      fill(box, h('p', { class: 'text-xs text-red-400' }, err.message));
    }
  }

  // ---------- Deck ----------

  function renderDeck() {
    const { deckCategory, cardIndex } = S.state.ui;
    const deck = C.decks[deckCategory] || C.decks.deep;
    $('cardCategoryBadge').textContent = deck.label;
    $('cardText').textContent = `"${deck.cards[cardIndex % deck.cards.length]}"`;
    fill($('deckCategories'), Object.entries(C.decks).map(([k, d]) =>
      h('button', { class: chip(k === deckCategory), onclick: () => S.setUi({ deckCategory: k, cardIndex: 0 }) }, d.label)
    ));
  }

  // ---------- Love jar (XSS fixed: textContent only) ----------

  function renderJar() {
    const notes = S.all('note');
    fill($('jarList'), notes.length ? notes.map(n =>
      h('div', { class: 'bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl' },
        h('div', { class: 'flex justify-between text-xs text-slate-400 mb-1' },
          h('span', { class: 'font-medium text-teal-400' }, who(n.author)),
          h('span', { class: 'flex gap-3' },
            h('span', {}, ago(n.updated_at)),
            n.author === S.me() ? h('button', { class: 'hover:text-red-400', 'aria-label': 'Delete note', onclick: () => S.remove(n.id) }, '×') : null
          )
        ),
        h('p', { class: 'text-sm text-slate-200 whitespace-pre-wrap break-words' }, n.data.text)
      )
    ) : h('p', { class: 'text-sm text-slate-500 text-center py-6' }, 'The jar is empty. Drop the first note!'));
  }

  function addJarNote() {
    const input = $('jarInput');
    const val = input.value.trim();
    if (!val) return;
    S.put(`note:${S.uid()}`, 'note', { text: val });
    input.value = '';
    toast('Note left');
  }

  // ---------- Coach ----------

  function renderCoachMode() {
    const ai = Coach.aiAvailable();
    const b = $('coachModeBadge');
    b.textContent = ai ? 'AI coach' : 'Offline template';
    b.className = 'text-[10px] px-2 py-0.5 rounded-full border ' + (ai ? 'border-violet-500/50 text-violet-300' : 'border-slate-700 text-slate-400');
    $('coachPrivacy').textContent = ai
      ? 'What you type here is sent to your UsTwo server and then to Anthropic\'s Claude API to generate the rewrite. It is not saved in the app.'
      : 'Offline mode: nothing leaves this device. Configure the AI coach (see README) for personalised rewrites.';
  }

  async function translate() {
    const text = $('coachInput').value.trim();
    if (!text) return;
    const out = $('coachResult');
    out.classList.remove('hidden');
    fill(out, h('p', { class: 'text-xs text-slate-400' }, 'Finding the words…'));
    $('btnTranslate').disabled = true;
    try {
      const r = await Coach.translate(text);
      const copy = () => navigator.clipboard.writeText(r.rewrite).then(() => toast('Copied'), () => toast('Copy failed'));
      fill(out,
        r.safety_concern ? h('div', { class: 'bg-amber-950/60 border border-amber-600/50 rounded-xl p-3 text-xs text-amber-200' },
          'It sounds like safety might be part of this. You deserve support: consider talking to someone you trust, or a local domestic-violence or crisis line.') : null,
        h('div', { class: 'bg-violet-950/40 border border-violet-500/30 rounded-xl p-3' },
          h('p', { class: 'text-xs text-violet-300 mb-1' }, r.offline ? 'Fill-in template' : 'Try saying'),
          h('p', { class: 'serif text-base text-white whitespace-pre-wrap' }, r.rewrite)
        ),
        h('div', { class: 'grid grid-cols-2 gap-2 text-xs' },
          h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-2' }, h('p', { class: 'text-slate-400' }, 'Feeling'), h('p', { class: 'text-slate-100' }, r.feeling)),
          h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-2' }, h('p', { class: 'text-slate-400' }, 'Need'), h('p', { class: 'text-slate-100' }, r.need))
        ),
        h('p', { class: 'text-xs text-slate-300' }, h('span', { class: 'text-teal-300' }, 'Tip  '), r.tip),
        (r.extraTips || []).map(t => h('p', { class: 'text-xs text-slate-400' }, '• ', t)),
        h('button', { class: 'w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm', onclick: copy }, 'Copy message')
      );
    } catch (err) {
      fill(out, h('p', { class: 'text-xs text-red-400' }, err.message));
    } finally {
      $('btnTranslate').disabled = false;
    }
  }

  // ---------- Spark (intimacy) ----------
  // One position per night, picked from both partners' moods and heat levels, plus a warm-up.
  // Weekend nights (Fri to Sun) aim for your full heat. Positions you both marked "Want to" come
  // first. Both partners must opt in; either can pass or hide anything, and no reasons are asked.

  const ENERGY = ['rest', 'low', 'medium', 'high'];
  const rank = e => ENERGY.indexOf(e);
  C.spark.positions.forEach(p => { p.kind = 'position'; });

  function dayHash(dateStr) {
    let hash = 0;
    for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return hash;
  }

  // opts: { wanted: Set of ids you both want to try, choose: id picked by hand for tonight }
  function sparkPick(dateStr, vibes, hidden, shuffle, heat, opts) {
    const Sp = C.spark;
    const o = opts || {};
    const wanted = o.wanted || new Set();
    const day = new Date(dateStr + 'T12:00:00').getDay();
    const weekend = day === 5 || day === 6 || day === 0;
    const shared = vibes.map(v => Sp.vibeEnergy[v] || 'medium').reduce((a, b) => (rank(a) <= rank(b) ? a : b));
    const fitsDay = i => i.when === 'any' || i.when === (weekend ? 'weekend' : 'weekday');
    const hash = dayHash(dateStr);
    const at = (list, n) => list[n % list.length];

    if (shared === 'rest') {
      const closeness = Sp.ideas.filter(i => i.kind === 'closeness' && !hidden.has(i.id) && fitsDay(i));
      const pool = closeness.length ? closeness : Sp.ideas.filter(i => i.kind === 'closeness');
      return { idea: at(pool, hash + shuffle), warmup: null, weekend, shared, poolSize: pool.length, mutual: false };
    }

    const chosen = o.choose && Sp.positions.find(p => p.id === o.choose && !hidden.has(p.id));
    let pool = [];
    let idea = chosen || null;
    if (!idea) {
      const fits = Sp.positions.filter(p => !hidden.has(p.id) && fitsDay(p) && rank(p.energy) <= rank(shared) && p.heat <= heat);
      // Weekends aim for your full heat; weeknights can sit one notch lower and go easier on energy.
      const top = Math.max(0, ...fits.map(p => p.heat));
      pool = fits.filter(p => (weekend ? p.heat === top : p.heat >= top - 1));
      if (!weekend) {
        const easy = pool.filter(p => p.energy !== 'high');
        if (easy.length) pool = easy;
      }
      if (!pool.length) pool = Sp.positions.filter(p => !hidden.has(p.id) && p.heat <= heat);
      if (!pool.length) pool = Sp.positions.filter(p => p.heat <= heat);
      const both = pool.filter(p => wanted.has(p.id));
      // First suggestion of the night comes from your shared wish list when it has something that fits.
      idea = both.length && shuffle === 0 ? at(both, hash) : at(pool, hash + shuffle);
    }
    const warmups = Sp.ideas.filter(i => (i.kind === 'tease' || i.kind === 'play') && !hidden.has(i.id) && i.heat <= heat && rank(i.energy) <= rank(shared) && (i.minutes || 0) <= 40 && (i.minutes || 0) > 0);
    const warmup = warmups.length ? at(warmups, hash * 7 + shuffle) : null;
    return { idea, warmup, weekend, shared, poolSize: Math.max(pool.length, chosen ? 2 : 0), mutual: wanted.has(idea.id) };
  }

  function sparkPref(p) { const e = S.get(`spark_pref:${p}`); return Object.assign({ optIn: false, hidden: [], heat: 2 }, e ? e.data : {}); }

  function setSparkPref(patch) {
    S.put(`spark_pref:${S.me()}`, 'spark_pref', Object.assign({}, sparkPref(S.me()), patch));
  }

  // Each partner's private "positions to try" list: { want: [], maybe: [], no: [] }.
  function wishOf(p) { const e = S.get(`spark_wish:${p}`); return Object.assign({ want: [], maybe: [], no: [] }, e ? e.data : {}); }

  function setWish(id, choice) {
    const w = wishOf(S.me());
    const next = { want: w.want.filter(x => x !== id), maybe: w.maybe.filter(x => x !== id), no: w.no.filter(x => x !== id) };
    if (choice && !(w[choice] || []).includes(id)) next[choice].push(id);
    S.put(`spark_wish:${S.me()}`, 'spark_wish', next);
  }

  const ENERGY_LABEL = { rest: 'resting', low: 'low-key', medium: 'warm', high: 'high' };
  const heatLabel = v => (C.spark.heats.find(x => x.value === v) || {}).label;

  function renderSpark() {
    const me = S.me();
    const them = other(me);
    const mine = sparkPref(me);
    const theirs = sparkPref(them);
    const body = $('sparkBody');

    if (!mine.optIn) {
      fill(body, h('div', { class: 'bg-slate-900 border border-fuchsia-500/30 rounded-2xl p-5 space-y-3' },
        h('h3', { class: 'serif text-2xl text-white' }, 'Spark'),
        h('p', { class: 'text-sm text-slate-300' }, 'A position for tonight, picked from both your moods and how horny you each are. Quick and easy on weeknights, bolder on weekends. Plus a private list where you each mark what you want to try, and only your matches are revealed.'),
        h('ul', { class: 'text-xs text-slate-400 space-y-1 list-disc pl-4' },
          h('li', {}, 'For adults only. It switches on only when both of you turn it on.'),
          h('li', {}, 'Either of you can say "not tonight" or hide anything for good, and no reason is needed.'),
          h('li', {}, 'Everything is written descriptions. There are no images.')),
        h('button', { class: 'w-full py-2.5 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-medium text-sm rounded-xl', onclick: () => setSparkPref({ optIn: true }) },
          paired() ? "I'm 18+ and want Spark on" : `Turn on Spark for ${who(me)} (18+)`)
      ));
      return;
    }
    if (!theirs.optIn) {
      fill(body, h('div', { class: 'bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3' },
        h('h3', { class: 'serif text-xl text-white' }, 'Spark is on for you'),
        h('p', { class: 'text-sm text-slate-300' }, paired()
          ? 'It will start once your partner turns it on too. We don\'t send them a reminder, so bring it up when it feels right.'
          : `Switch to ${who(them)} at the top and turn it on there too.`),
        h('button', { class: 'text-xs text-slate-500 hover:text-slate-300', onclick: () => setSparkPref({ optIn: false }) }, 'Turn Spark off')
      ));
      return;
    }

    const date = todayStr();
    const vibes = ['A', 'B'].map(p => (S.get(`vibe:${p}`) || { data: { text: '' } }).data.text);
    const myWish = wishOf(me);
    const theirWish = wishOf(them);
    const wanted = new Set(myWish.want.filter(id => theirWish.want.includes(id)));
    const hidden = new Set([...(mine.hidden || []), ...(theirs.hidden || []), ...myWish.no, ...theirWish.no]);
    const pickEntry = S.get(`spark_pick:${date}`);
    const shuffle = pickEntry ? pickEntry.data.shuffle || 0 : 0;
    const choose = pickEntry ? pickEntry.data.choose : null;
    const heat = Math.min(mine.heat, theirs.heat);
    const { idea, warmup, weekend, shared, poolSize, mutual } = sparkPick(date, vibes, hidden, shuffle, heat, { wanted, choose });

    const resp = p => { const e = S.get(`spark:${date}:${p}`); return e && e.data.itemId === idea.id ? e.data.choice : null; };
    const myChoice = resp(me);
    const theirChoice = resp(them);
    const done = S.get(`spark_done:${date}`);

    const respond = choice => S.put(`spark:${date}:${me}`, 'spark', { itemId: idea.id, choice });
    const setPick = patch => S.put(`spark_pick:${date}`, 'spark_pick', Object.assign({ shuffle, choose: null }, patch), { keepAuthor: true });

    let status;
    if (done && done.data.itemId === idea.id) {
      status = h('p', { class: 'text-sm text-teal-300' }, 'Saved to your memories');
    } else if (!myChoice) {
      status = h('p', { class: 'text-xs text-slate-400' }, theirChoice ? `${who(them)} has responded. Answer to see where you both are.` : 'Neither answer is shown until you\'ve both responded.');
    } else if (!theirChoice) {
      status = h('p', { class: 'text-xs text-slate-400' }, `You said ${myChoice === 'in' ? '"I\'m in"' : '"not tonight"'}. Waiting for ${whoInline(them)}.`);
    } else if (myChoice === 'in' && theirChoice === 'in') {
      status = h('div', { class: 'space-y-2' },
        h('p', { class: 'text-sm text-fuchsia-200 font-medium' }, 'You both said yes.'),
        h('button', { class: 'w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm',
          onclick: () => S.put(`spark_done:${date}`, 'spark_done', { itemId: idea.id, title: idea.title }) }, 'We did it, save the memory'));
    } else {
      status = h('p', { class: 'text-sm text-slate-300' }, 'Not tonight, and that\'s completely fine. A cuddle or an early night counts too.');
    }

    const isPosition = idea.kind === 'position';
    const card = h('div', { class: 'bg-gradient-to-br from-fuchsia-950/50 via-slate-900 to-slate-900 border border-fuchsia-500/30 rounded-3xl p-6 space-y-4 shadow-xl' },
      h('div', { class: 'flex justify-between items-baseline gap-2' },
        h('span', { class: 'eyebrow font-semibold text-fuchsia-300' }, isPosition ? `Tonight's position · ${heatLabel(idea.heat)}` : 'Tonight · Closeness'),
        mutual ? h('span', { class: 'text-[11px] text-teal-300' }, 'You both want this') : null),
      h('h3', { class: 'serif text-3xl text-white leading-tight' }, idea.title),
      h('p', { class: 'text-sm text-slate-200 leading-relaxed' }, idea.desc),
      isPosition ? h('ol', { class: 'space-y-1.5 text-sm text-slate-300' }, idea.how.map((step, i) =>
        h('li', { class: 'flex gap-3' }, h('span', { class: 'serif text-fuchsia-300 w-4 shrink-0' }, String(i + 1)), h('span', {}, step)))) : null,
      isPosition ? h('div', { class: 'grid grid-cols-2 gap-2' }, idea.roles.map(([label, text]) =>
        h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-3' },
          h('p', { class: 'eyebrow text-slate-400 mb-1' }, label),
          h('p', { class: 'text-xs text-slate-200 leading-relaxed' }, text)))) : null,
      isPosition && idea.tip ? h('p', { class: 'text-xs text-slate-300' }, h('span', { class: 'text-teal-300' }, 'Make it better  '), idea.tip) : null,
      warmup ? h('div', { class: 'border-t border-fuchsia-500/20 pt-3' },
        h('p', { class: 'eyebrow text-slate-400 mb-1' }, 'Warm up first'),
        h('p', { class: 'text-sm text-white' }, warmup.title),
        h('p', { class: 'text-xs text-slate-400 leading-relaxed' }, warmup.desc)) : null,
      shared === 'rest' ? h('p', { class: 'text-xs text-amber-300' }, 'One of you is running on empty, so tonight is about closeness only.') : null,
      h('div', { class: 'grid grid-cols-2 gap-2' },
        h('button', { class: 'py-2.5 rounded-xl text-sm font-medium ' + (myChoice === 'in' ? 'bg-fuchsia-600 text-white ring-2 ring-fuchsia-300' : 'bg-fuchsia-700/80 hover:bg-fuchsia-600 text-white'), onclick: () => respond('in') }, "I'm in"),
        h('button', { class: 'py-2.5 rounded-xl text-sm font-medium ' + (myChoice === 'pass' ? 'bg-slate-600 text-white ring-2 ring-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'), onclick: () => respond('pass') }, 'Not tonight')),
      status,
      h('div', { class: 'flex justify-between text-xs pt-1' },
        poolSize > 1 ? h('button', { class: 'text-slate-300 hover:text-white', onclick: () => setPick({ shuffle: shuffle + 1, choose: null }) }, 'Roll again') : h('span', {}),
        h('button', { class: 'text-slate-500 hover:text-red-300', onclick: () => setSparkPref({ hidden: [...new Set([...(mine.hidden || []), idea.id])] }) }, 'Not for us, hide it'))
    );

    const myHeat = C.spark.heats.find(x => x.value === mine.heat);
    const heatPicker = h('div', { class: 'bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2' },
      h('p', { class: 'text-xs text-slate-300' }, paired() ? 'How horny are you tonight?' : `How horny is ${who(me)} tonight?`),
      h('div', { class: 'grid grid-cols-3 gap-2' }, C.spark.heats.map(x =>
        h('button', {
          class: 'rounded-xl px-2 py-2 text-xs border transition ' + (mine.heat === x.value ? 'bg-fuchsia-700 border-fuchsia-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-fuchsia-500/50'),
          title: x.hint, onclick: () => setSparkPref({ heat: x.value })
        }, x.label))),
      h('p', { class: 'text-[11px] text-slate-400' }, myHeat ? myHeat.hint + '.' : ''),
      h('p', { class: 'text-[11px] text-slate-500' }, 'Tonight uses the lower of your two levels, so nobody is pushed past where they want to go. Your partner only sees the result.'));

    // Positions to try: each partner marks privately; only mutual "Want to" is revealed.
    const level = S.state.ui.sparkLevel || mine.heat;
    const matches = C.spark.positions.filter(p => wanted.has(p.id));
    const mark = (p, choice, label) => {
      const on = (myWish[choice] || []).includes(p.id);
      return h('button', {
        class: 'px-2.5 py-1 rounded-lg text-[11px] border transition ' + (on ? (choice === 'no' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-fuchsia-700 border-fuchsia-400 text-white') : 'border-slate-700 text-slate-400 hover:text-slate-200'),
        'aria-pressed': on ? 'true' : 'false',
        onclick: () => setWish(p.id, on ? null : choice)
      }, label);
    };
    const library = h('div', { class: 'space-y-3' },
      h('div', {},
        h('h4', { class: 'eyebrow font-semibold text-slate-400' }, 'Positions to try'),
        h('p', { class: 'text-[11px] text-slate-500 mt-1' }, `Mark each one privately. ${paired() ? 'Your partner' : who(them)} only sees a position when you've both said "Want to". "Not for me" keeps it out of tonight's picks without telling them why.`)),
      matches.length ? h('div', { class: 'bg-slate-900 border border-teal-500/30 rounded-2xl p-3 space-y-2' },
        h('p', { class: 'text-xs text-teal-300' }, `You both want to try ${matches.length === 1 ? 'this' : 'these'}`),
        matches.map(p => h('div', { class: 'flex justify-between items-center gap-2' },
          h('span', { class: 'text-sm text-slate-100' }, p.title),
          p.id === idea.id ? h('span', { class: 'text-[11px] text-slate-500' }, 'Tonight') :
            h('button', { class: 'text-[11px] px-2.5 py-1 rounded-lg bg-fuchsia-700 hover:bg-fuchsia-600 text-white', onclick: () => setPick({ choose: p.id }) }, 'Make it tonight')))) : null,
      h('div', { class: 'flex gap-2' }, C.spark.heats.map(x =>
        h('button', { class: chip(level === x.value), onclick: () => S.setUi({ sparkLevel: x.value }) }, x.label))),
      h('div', { class: 'space-y-2' }, C.spark.positions.filter(p => p.heat === level).map(p =>
        h('div', { class: 'bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2' },
          h('details', {},
            h('summary', { class: 'cursor-pointer list-none' },
              h('p', { class: 'text-sm text-slate-100' }, p.title),
              h('p', { class: 'text-xs text-slate-400' }, p.desc)),
            h('ol', { class: 'mt-2 space-y-1 text-xs text-slate-300 list-decimal pl-4' }, p.how.map(step => h('li', {}, step)))),
          h('div', { class: 'flex gap-2' }, mark(p, 'want', 'Want to'), mark(p, 'maybe', 'Maybe'), mark(p, 'no', 'Not for me'))))));

    const memories = S.all('spark_done').slice(0, 8);
    fill(body,
      h('div', { class: 'flex flex-wrap gap-2 text-[11px]' },
        h('span', { class: 'px-2 py-0.5 rounded-full border border-fuchsia-500/40 text-fuchsia-200' }, weekend ? 'Weekend night' : 'Weeknight'),
        h('span', { class: 'px-2 py-0.5 rounded-full border border-fuchsia-500/40 text-fuchsia-200' }, `Level: ${heatLabel(heat)}`),
        h('span', { class: 'px-2 py-0.5 rounded-full border border-slate-700 text-slate-300' }, `Shared energy: ${ENERGY_LABEL[shared]}`),
        h('span', { class: 'px-2 py-0.5 rounded-full border border-slate-700 text-slate-400' }, `Your moods: ${vibes.filter(Boolean).join(' + ') || 'not set'}`)),
      card,
      heatPicker,
      h('p', { class: 'text-[11px] text-slate-500' }, 'Change tonight\'s pick by changing your mood at the top. Go slow, keep checking in, and stop whenever either of you wants to.'),
      library,
      h('div', {},
        h('h4', { class: 'eyebrow font-semibold text-slate-400 mb-2' }, 'Our memories'),
        memories.length ? h('div', { class: 'space-y-2' }, memories.map(m =>
          h('div', { class: 'bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 flex justify-between text-sm' },
            h('span', { class: 'text-slate-200' }, m.data.title),
            h('span', { class: 'text-xs text-slate-500' }, new Date(m.id.split(':')[1] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })))))
          : h('p', { class: 'text-xs text-slate-500' }, 'Positions you both enjoyed will be saved here.')),
      h('div', { class: 'flex justify-between text-xs text-slate-500 border-t border-slate-800 pt-3' },
        (mine.hidden || []).length ? h('button', { class: 'hover:text-slate-300', onclick: () => setSparkPref({ hidden: [] }) }, `Unhide ${(mine.hidden || []).length} you hid`) : h('span', {}),
        h('button', { class: 'hover:text-slate-300', onclick: () => setSparkPref({ optIn: false }) }, 'Turn Spark off'))
    );
  }

  // ---------- Rituals ----------

  const RITUALS = [['bucket', 'Plans & dates'], ['checkin', 'Weekly check-in'], ['challenges', 'Challenges']];

  function renderRituals() {
    const rt = S.state.ui.ritualsTab || 'bucket';
    fill($('ritualTabs'), RITUALS.map(([k, label]) => h('button', { class: chip(k === rt), onclick: () => S.setUi({ ritualsTab: k }) }, label)));
    RITUALS.forEach(([k]) => $(`ritual-${k}`).classList.toggle('hidden', k !== rt));
    renderBucket();
    renderCheckin();
    renderChallenges();
  }

  // Bucket list + date planner
  function addBucket(text) {
    const t = (text || '').trim();
    if (!t) return;
    S.put(`bucket:${S.uid()}`, 'bucket', { text: t, done: false, plannedFor: null });
  }

  function updateBucket(e, patch) { S.put(e.id, 'bucket', Object.assign({}, e.data, patch), { keepAuthor: true }); }

  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }

  function downloadIcs(e) {
    const d = e.data.plannedFor.replace(/-/g, '');
    const next = new Date(e.data.plannedFor + 'T00:00:00');
    next.setDate(next.getDate() + 1);
    const end = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UsTwo//Date Planner//EN',
      'BEGIN:VEVENT', `UID:${e.id.replace(/[^\w-]/g, '')}@ustwo`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${icsEscape('UsTwo date: ' + e.data.text)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = h('a', { href: url, download: 'ustwo-date.ics' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function bucketRow(e) {
    const dateInput = h('input', {
      type: 'date', value: e.data.plannedFor || '', min: todayStr(),
      class: 'bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200',
      onchange: ev => updateBucket(e, { plannedFor: ev.target.value || null })
    });
    return h('div', { class: 'bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3' },
      h('input', { type: 'checkbox', class: 'mt-1 accent-rose-500', checked: e.data.done, 'aria-label': 'Done', onchange: ev => updateBucket(e, { done: ev.target.checked }) }),
      h('div', { class: 'flex-1 min-w-0' },
        h('p', { class: 'text-sm break-words ' + (e.data.done ? 'line-through text-slate-500' : 'text-slate-100') }, e.data.text),
        h('div', { class: 'flex flex-wrap items-center gap-2 mt-2' },
          h('span', { class: 'text-[11px] text-slate-500' }, `Added by ${whoInline(e.author)}`),
          dateInput,
          e.data.plannedFor ? h('button', { class: 'text-[11px] text-rose-300 hover:underline', onclick: () => downloadIcs(e) }, 'Add to calendar') : null
        )
      ),
      h('button', { class: 'text-xs text-slate-500 hover:text-red-400', 'aria-label': 'Remove', onclick: () => S.remove(e.id) }, '×')
    );
  }

  function renderBucket() {
    const items = S.all('bucket');
    const today = todayStr();
    const upcoming = items.filter(e => e.data.plannedFor && e.data.plannedFor >= today && !e.data.done)
      .sort((a, b) => a.data.plannedFor.localeCompare(b.data.plannedFor));
    const rest = items.filter(e => !upcoming.includes(e));
    fill($('upcomingDates'), upcoming.length ? upcoming.map(e =>
      h('div', { class: 'bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 flex justify-between items-center gap-2' },
        h('div', { class: 'min-w-0' },
          h('p', { class: 'text-xs text-rose-300' }, new Date(e.data.plannedFor + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
          h('p', { class: 'text-sm text-white break-words' }, e.data.text)),
        h('button', { class: 'shrink-0 text-xs text-rose-300 hover:underline', onclick: () => downloadIcs(e) }, 'Add to calendar')
      )) : h('p', { class: 'text-xs text-slate-500' }, 'Nothing planned yet. Pick a date on any bucket list item.'));
    fill($('bucketList'), rest.length ? rest.map(bucketRow) : h('p', { class: 'text-xs text-slate-500' }, 'Add your first shared dream above.'));
    fill($('dateIdeas'), C.dateIdeas.map(t => h('button', { class: 'shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700', onclick: () => addBucket(t) }, '+ ' + t)));
  }

  // Weekly check-in
  let checkinWeekShown = null;
  function renderCheckin() {
    const week = isoWeek(new Date());
    $('checkinWeek').textContent = week;
    const me = S.me();
    const mine = S.get(`checkin:${week}:${me}`);
    // Only rebuild the form when the week or acting partner changes, so typing isn't interrupted.
    const formKey = week + me + (mine ? mine.updated_at : '');
    if (checkinWeekShown !== formKey) {
      checkinWeekShown = formKey;
      fill($('checkinForm'), C.checkinTemplate.map(f =>
        h('label', { class: 'block' },
          h('span', { class: 'text-xs font-medium text-slate-300' }, f.label),
          h('textarea', { rows: '2', maxlength: '1000', 'data-key': f.key, placeholder: f.hint, class: 'mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500' }, mine ? (mine.data[f.key] || '') : '')
        )
      ));
    }
    const theirs = S.get(`checkin:${week}:${other(me)}`);
    fill($('checkinPartner'), theirs ? checkinCard(theirs, `${who(theirs.author)} this week`) :
      h('p', { class: 'text-xs text-slate-500' }, `${who(other(me))} hasn't filled in this week's check-in yet.`));
    const past = S.all('checkin').filter(e => !e.id.startsWith(`checkin:${week}:`)).slice(0, 8);
    fill($('checkinHistory'), past.length ? past.map(e => {
      const wk = e.id.split(':')[1];
      return h('details', { class: 'bg-slate-900/80 border border-slate-800 rounded-xl p-3' },
        h('summary', { class: 'text-xs text-slate-300 cursor-pointer' }, `${wk} · ${who(e.author)}`),
        checkinCard(e, null));
    }) : h('p', { class: 'text-xs text-slate-500' }, 'Your past check-ins will appear here.'));
  }

  function checkinCard(e, title) {
    return h('div', { class: title ? 'bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2' : 'mt-2 space-y-2' },
      title ? h('h4', { class: 'text-sm font-semibold text-teal-300' }, title) : null,
      C.checkinTemplate.filter(f => e.data[f.key]).map(f =>
        h('div', {}, h('p', { class: 'text-[11px] text-slate-400' }, f.label), h('p', { class: 'text-sm text-slate-200 whitespace-pre-wrap break-words' }, e.data[f.key])))
    );
  }

  function saveCheckin() {
    const data = {};
    $('checkinForm').querySelectorAll('textarea').forEach(t => { const v = t.value.trim(); if (v) data[t.dataset.key] = v; });
    if (!Object.keys(data).length) return toast('Write at least one answer first');
    S.put(`checkin:${isoWeek(new Date())}:${S.me()}`, 'checkin', data);
    toast('Check-in saved');
  }

  // Intimacy challenges
  function renderChallenges() {
    const active = S.get('challenge:current');
    const def = active && C.challenges.find(c => c.id === active.data.challengeId);
    if (def) {
      const dayIdx = Math.min(def.days - 1, Math.floor((Date.now() - new Date(active.data.startedAt).getTime()) / 864e5));
      const progress = p => {
        const e = S.get(`challenge_progress:${p}`);
        return e && e.data.challengeId === def.id && e.data.startedAt === active.data.startedAt ? e.data.done : [];
      };
      const me = S.me();
      const toggle = i => {
        const done = progress(me).slice();
        const at = done.indexOf(i);
        if (at >= 0) done.splice(at, 1); else done.push(i);
        S.put(`challenge_progress:${me}`, 'challenge_progress', { challengeId: def.id, startedAt: active.data.startedAt, done });
      };
      fill($('activeChallenge'), h('div', { class: 'bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-4' },
        h('div', { class: 'flex justify-between items-baseline mb-3' },
          h('h3', { class: 'text-sm font-semibold text-white' }, def.title),
          h('span', { class: 'text-xs text-orange-300' }, `Day ${dayIdx + 1} of ${def.days}`)),
        h('div', { class: 'space-y-2' }, def.steps.map((step, i) => {
          const mark = p => progress(p).includes(i);
          return h('div', { class: 'flex items-center gap-3 rounded-xl p-2 ' + (i === dayIdx ? 'bg-orange-500/10 border border-orange-500/30' : 'border border-transparent') + (i > dayIdx ? ' opacity-50' : '') },
            h('span', { class: 'text-xs text-slate-400 w-10 shrink-0' }, `Day ${i + 1}`),
            h('p', { class: 'flex-1 text-sm text-slate-200' }, step),
            h('span', { class: 'flex gap-1 shrink-0' }, ['A', 'B'].map(p => {
              const isMe = p === me;
              return h('button', {
                class: 'w-7 h-7 rounded-full text-[10px] border ' + (mark(p) ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-700 text-slate-500') + (isMe ? ' hover:border-orange-400' : ' cursor-default'),
                title: `${who(p)}${mark(p) ? ' did this' : ''}`,
                disabled: !isMe || i > dayIdx,
                onclick: () => toggle(i)
              }, isMe && paired() ? 'Me' : initial(p));
            }))
          );
        })),
        h('button', { class: 'mt-3 text-xs text-slate-500 hover:text-slate-300', onclick: () => S.remove('challenge:current') }, 'End challenge')
      ));
    } else {
      fill($('activeChallenge'), h('p', { class: 'text-xs text-slate-400' }, 'Pick a challenge to do together. Each of you ticks off your own days.'));
    }
    fill($('challengeList'), C.challenges.filter(c => !def || c.id !== def.id).map(c =>
      h('div', { class: 'bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex justify-between items-center gap-3' },
        h('div', {}, h('p', { class: 'text-sm text-slate-100' }, c.title), h('p', { class: 'text-xs text-slate-500' }, `Starts with: ${c.steps[0]}`)),
        h('button', { class: 'shrink-0 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium',
          onclick: () => S.put('challenge:current', 'challenge', { challengeId: c.id, startedAt: new Date().toISOString() }, { keepAuthor: true }) }, def ? 'Switch' : 'Start')
      )
    ));
  }

  // ---------- Pairing & settings sheet ----------

  function openSheet() { renderSheet(); $('sheet').classList.remove('hidden'); }
  function closeSheet() { $('sheet').classList.add('hidden'); }

  const btn = (label, onclick, tone) => h('button', {
    class: 'w-full py-2.5 rounded-xl text-sm font-medium transition ' + (tone === 'ghost' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : tone === 'danger' ? 'bg-red-900/40 hover:bg-red-900/60 text-red-200' : 'bg-rose-600 hover:bg-rose-500 text-white'),
    onclick
  }, label);

  function renderSheet() {
    const body = $('sheetBody');
    const parts = [];
    const errorLine = h('p', { class: 'text-xs text-red-400 hidden' });
    const fail = err => { errorLine.textContent = err.message || String(err); errorLine.classList.remove('hidden'); };

    // Names. Paired: each of you sets your own. Demo: both are editable here.
    const nameField = p => h('input', {
      maxlength: '24', placeholder: paired() ? 'Your first name' : `Name for partner ${p}`, value: nameOf(p) || '',
      'aria-label': paired() ? 'Your name' : `Name for partner ${p}`,
      class: 'w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-500',
      onchange: e => {
        const name = e.target.value.trim().slice(0, 24);
        if (name) S.put(`profile:${p}`, 'profile', { name }); else S.remove(`profile:${p}`);
      }
    });
    parts.push(h('div', { class: 'space-y-2' },
      h('p', { class: 'font-medium' }, paired() ? 'Your name' : 'Your names'),
      paired()
        ? h('div', { class: 'space-y-1' }, nameField(S.me()),
            h('p', { class: 'text-xs text-slate-400' }, nameOf(other(S.me())) ? `Your partner goes by ${nameOf(other(S.me()))}.` : 'Your partner sets their own name on their phone.'))
        : h('div', { class: 'grid grid-cols-2 gap-2' }, nameField('A'), nameField('B'))));

    if (!S.isConfigured()) {
      parts.push(h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-300 space-y-1' },
        h('p', { class: 'font-medium' }, 'Single-device demo mode'),
        h('p', { class: 'text-xs text-slate-400' }, 'Everything is saved in this browser only. To sync two phones, add your Supabase URL and anon key to config.js (see README.md).')));
    } else if (!paired()) {
      const codeInput = h('input', { inputmode: 'numeric', maxlength: '6', placeholder: '123456', class: 'flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-lg tracking-[0.4em] text-center focus:outline-none focus:border-rose-500' });
      parts.push(
        h('div', { class: 'border-t border-slate-800 pt-4 space-y-2' },
          h('p', { class: 'font-medium' }, 'Start a shared space'),
          h('p', { class: 'text-xs text-slate-400' }, "You'll get a 6-digit code (valid 24 hours) for your partner. Your current answers and notes come with you."),
          btn('Create pairing code', async () => {
            try { const code = await S.createPair(); renderSheet(); toast(`Your code: ${code}`); } catch (e) { fail(e); }
          })),
        h('div', { class: 'border-t border-slate-800 pt-4 space-y-2' },
          h('p', { class: 'font-medium' }, 'Join your partner'),
          h('p', { class: 'text-xs text-slate-400' }, 'Enter the code from their phone. This replaces the demo data on this device.'),
          h('div', { class: 'flex gap-2' }, codeInput,
            h('button', { class: 'px-4 bg-teal-600 hover:bg-teal-500 rounded-xl text-sm font-medium', onclick: async () => {
              if (!/^\d{6}$/.test(codeInput.value.trim())) return fail(new Error('Enter the 6-digit code'));
              try { await S.joinPair(codeInput.value); syncDailyInput(); renderSheet(); toast("You're connected"); } catch (e) { fail(e); }
            } }, 'Join'))));
    } else {
      parts.push(h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1' },
        h('p', { class: 'font-medium' }, S.state.pairCode ? 'Waiting for your partner' : 'Connected'),
        S.state.pairCode ? h('p', { class: 'text-3xl tracking-[0.3em] text-center text-rose-300 py-2 font-semibold' }, S.state.pairCode) : null,
        S.state.pairCode ? h('p', { class: 'text-xs text-slate-400' }, 'Ask your partner to open UsTwo, tap the two circles at the top, and enter this code.') : null,
        h('p', { class: 'text-xs text-slate-400' }, `Sync status: ${S.syncStatus}`)));
      parts.push(btn('Unpair this device', () => { if (confirmInline()) { S.unpair(); renderSheet(); } }, 'danger'));
    }

    // Notifications
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    parts.push(h('div', { class: 'border-t border-slate-800 pt-4 space-y-2' },
      h('p', { class: 'font-medium' }, 'Notifications'),
      h('p', { class: 'text-xs text-slate-400' },
        perm === 'unsupported' ? 'This browser does not support notifications.' :
        perm === 'granted' ? 'On. You\'ll get a gentle nudge when your partner answers, leaves a note, or changes their mood while UsTwo is open in the background.' :
        perm === 'denied' ? 'Blocked in browser settings.' :
        'Get a nudge when your partner answers or drops a note. Message text is never shown on the lock screen.'),
      perm === 'default' ? btn('Enable notifications', async () => { await Notification.requestPermission(); renderSheet(); }, 'ghost') : null));

    if (!paired()) parts.push(h('div', { class: 'border-t border-slate-800 pt-4' }, btn('Reset demo data', () => { if (confirmInline()) { S.resetAll(); syncDailyInput(); renderSheet(); } }, 'danger')));
    parts.push(errorLine);
    fill(body, parts);
  }

  // Two-tap confirm without a blocking dialog.
  let armedAt = 0;
  function confirmInline() {
    if (Date.now() - armedAt < 4000) { armedAt = 0; return true; }
    armedAt = Date.now();
    toast('Tap again to confirm');
    return false;
  }

  // ---------- Notifications ----------

  let swReg = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(r => { swReg = r; }).catch(err => console.warn('SW registration failed', err));
  }

  const NOTIFY = {
    answered: e => `${who(e.author)} answered tonight's question. Write yours to open it.`,
    note: e => `${who(e.author)} left you a note`,
    vibe: e => `${who(e.author)} updated their mood`,
    bucket: () => 'Something new on your plans list',
    checkin: e => `${who(e.author)} filled in this week's check-in`,
    challenge: () => 'A new challenge has started',
    prompt: () => 'There\'s a new question for tonight',
    // Deliberately vague: these can show on a lock screen.
    spark: () => 'Something is waiting for you in UsTwo',
    spark_done: () => 'A new memory was saved',
    // Only fires when a partner's change creates a new mutual match (see below).
    spark_wish: () => 'You have a new match in Spark'
  };

  S.onRemote((e, prev) => {
    const make = NOTIFY[e.kind];
    if (!make) return;
    if (e.kind === 'bucket' && prev) return; // only new ideas, not edits
    if (e.kind === 'spark_wish') {
      // Stay silent unless their change matched something I already want.
      const mineWant = wishOf(S.me()).want;
      const before = new Set(prev && !prev.deleted ? (prev.data.want || []) : []);
      if (!(e.data.want || []).some(id => !before.has(id) && mineWant.includes(id))) return;
    }
    const msg = make(e);
    toast(msg);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const opts = { body: msg, tag: 'ustwo-' + e.kind, icon: 'icon.svg' };
      if (swReg) swReg.showNotification('UsTwo', opts); else new Notification('UsTwo', opts);
    }
  });

  // ---------- Wiring ----------

  $('btnPartnerA').addEventListener('click', () => { S.setActivePartner('A'); syncDailyInput(); checkinWeekShown = null; });
  $('btnPartnerB').addEventListener('click', () => { S.setActivePartner('B'); syncDailyInput(); checkinWeekShown = null; });
  $('btnSettings').addEventListener('click', openSheet);
  $('btnCloseSheet').addEventListener('click', closeSheet);
  $('sheet').addEventListener('click', e => { if (e.target === $('sheet')) closeSheet(); });
  $('btnLockIn').addEventListener('click', submitDailyAnswer);
  $('btnNextPrompt').addEventListener('click', nextPrompt);
  $('btnSuggestPrompts').addEventListener('click', suggestPrompts);
  $('deckCard').addEventListener('click', () => S.setUi({ cardIndex: S.state.ui.cardIndex + 1 }));
  $('btnAddNote').addEventListener('click', addJarNote);
  $('btnTranslate').addEventListener('click', translate);
  $('btnAddBucket').addEventListener('click', () => { addBucket($('bucketInput').value); $('bucketInput').value = ''; });
  $('bucketInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('btnAddBucket').click(); });
  $('btnSaveCheckin').addEventListener('click', saveCheckin);

  let lastPromptKey = null;
  function render() {
    renderNav();
    renderHeader();
    renderPulse();
    renderDaily();
    renderDeck();
    renderJar();
    renderSpark();
    renderCoachMode();
    renderRituals();
    // If the partner changed the prompt, clear the stale draft.
    const key = currentPrompt().data.key;
    if (lastPromptKey && key !== lastPromptKey) syncDailyInput();
    lastPromptKey = key;
    if (!$('sheet').classList.contains('hidden')) renderSheetStatus();
  }

  // Keep the open sheet's status line fresh without wiping the code input.
  function renderSheetStatus() {
    const typing = document.activeElement && $('sheet').contains(document.activeElement) && document.activeElement.tagName === 'INPUT';
    if (paired() && !typing) renderSheet();
  }

  S.subscribe(render);
  render();
  syncDailyInput();
  if (paired()) S.connect().catch(() => {});

  window.UsTwoApp = { h, sparkPick }; // exposed for tests
})();
