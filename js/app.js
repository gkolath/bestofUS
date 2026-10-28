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
  function who(p) {
    if (!paired()) return `Partner ${p}`;
    return p === S.me() ? 'You' : 'Your partner';
  }
  // Mid-sentence form: "your partner" when paired, "Partner B" in the demo.
  const whoInline = p => (paired() ? who(p).toLowerCase() : who(p));

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

  const TABS = [
    ['daily', '🔒', 'Daily'],
    ['deck', '🃏', 'Deck'],
    ['jar', '🫙', 'Love Jar'],
    ['coach', '🕊️', 'Coach'],
    ['rituals', '🗓️', 'Rituals']
  ];

  function renderNav() {
    const tab = S.state.ui.tab;
    TABS.forEach(([t]) => $(`tab-${t}`).classList.toggle('hidden', t !== tab));
    fill($('navBar'), TABS.map(([t, icon, label]) =>
      h('button', {
        class: 'flex flex-col items-center gap-1 px-2 ' + (t === tab ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'),
        onclick: () => S.setUi({ tab: t })
      }, h('span', { class: 'text-lg' }, icon), h('span', { class: 'text-[11px] font-medium' }, label))
    ));
  }

  // ---------- Header & pulse ----------

  function renderHeader() {
    const isA = S.me() === 'A';
    $('partnerSwitcher').classList.toggle('hidden', paired());
    $('btnPartnerA').className = 'px-3 py-1 rounded-full text-xs font-medium transition ' + (isA ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white');
    $('btnPartnerB').className = 'px-3 py-1 rounded-full text-xs font-medium transition ' + (!isA ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white');
    $('activePartnerLabel').textContent = paired() ? '' : `Acting as Partner ${S.me()}`;

    const labels = {
      offline: paired() ? '⚪ Offline, changes will sync later' : 'Single-device demo',
      connecting: '🟡 Connecting…',
      live: S.state.pairCode ? '🟡 Waiting for your partner to join' : '🟢 Synced with your partner',
      error: '🔴 Sync problem, retrying'
    };
    $('syncLabel').textContent = labels[paired() ? S.syncStatus : 'offline'];
  }

  function renderPulse() {
    ['A', 'B'].forEach(p => {
      const v = S.get(`vibe:${p}`);
      $(`vibeLabel${p}`).textContent = `${who(p)}'s Vibe`;
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
    badge.textContent = both ? '✨ Unlocked! Both answered' : '🔒 Blind Mode: Both must answer to reveal';
    badge.className = both ? 'text-xs text-emerald-400 font-medium' : 'text-xs text-amber-400';
    $('btnLockIn').textContent = mine ? 'Update My Answer' : 'Lock In Answer';

    ['A', 'B'].forEach(x => {
      $(`ansLabel${x}`).textContent = who(x);
      const disp = $(`ansDisplay${x}`);
      const ans = S.get(`answer:${key}:${x}`);
      const marked = S.get(`answered:${key}:${x}`);
      if (x === me) {
        disp.textContent = ans ? ans.data.text : 'Not answered yet';
        disp.className = ans ? 'text-sm text-slate-100' : 'text-sm text-slate-400 italic';
      } else if (both && ans) {
        disp.textContent = ans.data.text;
        disp.className = 'text-sm text-slate-100';
      } else if (both) {
        disp.textContent = 'Unlocking…';
        disp.className = 'text-sm text-slate-400 italic';
      } else {
        disp.textContent = marked ? '🔒 Answered (submit yours to unlock)' : `Waiting for ${whoInline(x)}...`;
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
    toast('Answer locked in 🔒');
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
    fill(box, h('p', { class: 'text-xs text-slate-400' }, Coach.aiAvailable() ? '✨ Writing prompts from your history…' : 'Shuffling the prompt pool…'));
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
            n.author === S.me() ? h('button', { class: 'hover:text-red-400', 'aria-label': 'Delete note', onclick: () => S.remove(n.id) }, '✕') : null
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
    toast('Note dropped 💌');
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
        h('p', { class: 'text-xs text-slate-300' }, '💡 ', r.tip),
        (r.extraTips || []).map(t => h('p', { class: 'text-xs text-slate-400' }, '• ', t)),
        h('button', { class: 'w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm', onclick: copy }, 'Copy message')
      );
    } catch (err) {
      fill(out, h('p', { class: 'text-xs text-red-400' }, err.message));
    } finally {
      $('btnTranslate').disabled = false;
    }
  }

  // ---------- Rituals ----------

  const RITUALS = [['bucket', '🪣 Bucket & Dates'], ['checkin', '🗣️ Weekly Check-in'], ['challenges', '🔥 Challenges']];

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
      h('button', { class: 'text-xs text-slate-500 hover:text-red-400', 'aria-label': 'Remove', onclick: () => S.remove(e.id) }, '✕')
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
        h('button', { class: 'shrink-0 text-xs text-rose-300 hover:underline', onclick: () => downloadIcs(e) }, '📅 .ics')
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
    toast('Check-in saved 🗣️');
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
              }, paired() ? (isMe ? 'Me' : '♥') : p);
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

    if (!S.isConfigured()) {
      parts.push(h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-300 space-y-1' },
        h('p', { class: 'font-medium' }, 'Single-device demo mode'),
        h('p', { class: 'text-xs text-slate-400' }, 'Everything is saved in this browser only. To sync two phones, add your Supabase URL and anon key to config.js (see README.md).')));
    } else if (!paired()) {
      const codeInput = h('input', { inputmode: 'numeric', maxlength: '6', placeholder: '123456', class: 'flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-lg tracking-[0.4em] text-center focus:outline-none focus:border-rose-500' });
      parts.push(
        h('div', { class: 'space-y-2' },
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
              try { await S.joinPair(codeInput.value); syncDailyInput(); renderSheet(); toast("You're connected 💞"); } catch (e) { fail(e); }
            } }, 'Join'))));
    } else {
      parts.push(h('div', { class: 'bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1' },
        h('p', { class: 'font-medium' }, S.state.pairCode ? 'Waiting for your partner' : 'Paired 💞'),
        S.state.pairCode ? h('p', { class: 'text-3xl tracking-[0.3em] text-center text-rose-300 py-2 font-semibold' }, S.state.pairCode) : null,
        S.state.pairCode ? h('p', { class: 'text-xs text-slate-400' }, 'Ask your partner to open UsTwo, tap 💞, and enter this code.') : null,
        h('p', { class: 'text-xs text-slate-400' }, `Sync status: ${S.syncStatus}`)));
      parts.push(btn('Unpair this device', () => { if (confirmInline()) { S.unpair(); renderSheet(); } }, 'danger'));
    }

    // Notifications
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    parts.push(h('div', { class: 'border-t border-slate-800 pt-4 space-y-2' },
      h('p', { class: 'font-medium' }, 'Notifications'),
      h('p', { class: 'text-xs text-slate-400' },
        perm === 'unsupported' ? 'This browser does not support notifications.' :
        perm === 'granted' ? 'On. You\'ll get a gentle nudge when your partner answers, drops a note, or changes their vibe while UsTwo is open in the background.' :
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
    answered: () => 'Your partner answered today\'s prompt 🔒 Answer to unlock.',
    note: () => 'A new note landed in your Love Jar 💌',
    vibe: e => `Your partner's vibe: ${e.data.text}`,
    bucket: () => 'New idea on your bucket list 🪣',
    checkin: () => 'Your partner filled in this week\'s check-in 🗣️',
    challenge: () => 'A new challenge has started 🔥',
    prompt: () => 'There\'s a new daily prompt ✨'
  };

  S.onRemote((e, prev) => {
    const make = NOTIFY[e.kind];
    if (!make) return;
    if (e.kind === 'bucket' && prev) return; // only new ideas, not edits
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
    if (paired()) renderSheet();
  }

  S.subscribe(render);
  render();
  syncDailyInput();
  if (paired()) S.connect().catch(() => {});

  window.UsTwoApp = { h }; // exposed for tests
})();
