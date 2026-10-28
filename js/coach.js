// AI communication coach. Uses the `coach` Supabase Edge Function when configured,
// otherwise falls back to an offline template (clearly labelled as not AI).
(function () {
  const cfg = window.USTWO_CONFIG || {};
  const store = () => window.UsTwoStore;

  function aiAvailable() { return store().isConfigured() && !!cfg.COACH_FUNCTION; }

  async function invoke(body) {
    const sb = store().client || (await ensureClient());
    const { data, error } = await sb.functions.invoke(cfg.COACH_FUNCTION, { body });
    if (error) {
      // Edge function error bodies carry a friendly message when available.
      let msg = error.message || 'Coach request failed';
      try { const b = await error.context.json(); if (b && b.error) msg = b.error; } catch (_) { /* not JSON */ }
      throw new Error(msg);
    }
    return data;
  }

  async function ensureClient() {
    // store.connect() only runs once paired; for unpaired use we still need a signed-in client.
    await store().createClientOnly();
    return store().client;
  }

  const BLAME = [
    [/\byou always\b/i, '"You always" tends to start a defence. Try naming one specific time.'],
    [/\byou never\b/i, '"You never" is hard to hear. Try "Lately I\'ve missed..."'],
    [/\bwhy can'?t you\b/i, '"Why can\'t you" sounds like an accusation. Try asking for what you want.'],
    [/\b(lazy|selfish|ridiculous|stupid|useless)\b/i, 'Labels about character hurt. Describe the action instead.']
  ];
  const FEELINGS = [
    [/\b(alone|lonely|ignored|invisible)\b/i, 'lonely'],
    [/\b(tired|exhausted|drained|overwhelmed)\b/i, 'overwhelmed'],
    [/\b(hurt|sad|upset)\b/i, 'hurt'],
    [/\b(worried|anxious|scared)\b/i, 'anxious'],
    [/\b(angry|mad|furious|annoyed|pissed)\b/i, 'frustrated']
  ];

  function offlineTranslate(text) {
    const feeling = (FEELINGS.find(([re]) => re.test(text)) || [null, 'frustrated'])[1];
    const tips = BLAME.filter(([re]) => re.test(text)).map(([, t]) => t);
    return {
      offline: true,
      rewrite: `I feel ${feeling} when ___ (one specific moment). It matters to me because ___. Could we ___ (one concrete ask)?`,
      feeling,
      need: 'Name what you need (e.g. help, reassurance, time together)',
      tip: tips[0] || 'Pick a calm moment, not mid-argument, and start with one thing you appreciate.',
      extraTips: tips.slice(1),
      safety_concern: false
    };
  }

  async function translate(text) {
    if (!aiAvailable()) return offlineTranslate(text);
    return invoke({ mode: 'translate', text });
  }

  async function generatePrompts() {
    if (!aiAvailable()) {
      const pool = window.UsTwoContent.dailyPrompts.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      return { offline: true, prompts: pool.slice(0, 3) };
    }
    return invoke({ mode: 'prompts', history: store().historyForCoach() });
  }

  window.UsTwoCoach = { aiAvailable, translate, generatePrompts };
})();
