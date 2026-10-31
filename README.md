# UsTwo, iteration 2

Builds on the single-file prototype. It adds two-phone sync, an AI communication coach, and rituals with a date planner. It also fixes the Love Jar XSS bug.

**It runs without any setup.** Open `index.html` in a browser and it behaves like the original: one device, the Partner A/B switcher, data saved in `localStorage`. Data from the original prototype (`ustwo_state`) is migrated automatically. Sync and the AI coach turn on once you add keys to `config.js`.

## What's new

| Area | What it does |
|---|---|
| **Two-phone sync** | Tap the two-circles button at the top, then **Create pairing code**. Your partner taps the same button and enters the 6-digit code. Codes expire after 24 hours and work only once. Everything then syncs live over Supabase Realtime. Changes made offline are queued and sent when the connection returns. |
| **Server-side blind reveal** | The database won't return your partner's answer until you've stored your own (enforced by row-level security). The original prototype only hid it in the UI. |
| **Notifications** | When your partner answers, drops a note, changes their vibe, adds a bucket-list idea, or does a check-in, you see a toast. If notifications are allowed and the tab is in the background, you also get a system notification. Message text never appears on the lock screen. |
| **Translate My Frustration** (Coach tab, **off for now**) | Turns a heated thought into an "I feel… when… Could we…?" message, and shows the feeling, the need, and a tip. If the text suggests a safety issue, it flags it and points to support instead of coaching reconciliation. Without AI keys you get a fill-in template that's clearly labelled. |
| **Suggested questions** | Generates five daily questions from the couple's recent answers, notes, and bucket list. Pick one and it becomes the shared prompt. |
| **Rituals** | A shared **bucket list** where you can set a date on any item. Dated items show under Upcoming and export to your calendar as `.ics`. A **Weekly State of Us** check-in, loosely inspired by the Gottman "State of the Union" meeting (an adaptation, not their official format). **Intimacy challenges** of 5 to 7 days, where each partner ticks off their own days. |
| **Spark (intimacy)** | Suggests a **position for tonight**, with numbered steps, what's in it for each of you (roles are written without gender, so it works for every couple), a tip to make it better, and a warm-up to start with. Each partner picks how horny they are, **Horny, Hornier or Horniest**, and tonight uses the lower of the two. There are 30 positions, 10 per level. Weeknights get easier positions that can sit a level below yours. Weekend nights (Friday to Sunday) aim for your full level. If either partner's mood is "Running on empty", Spark suggests closeness only. **Positions to try:** each partner privately marks positions "Want to", "Maybe" or "Not for me". A position is only revealed when you both said "Want to", and your matches are suggested first ("Make it tonight" picks one directly). "Not for me" from either of you keeps it out of tonight's picks. When your partner's change creates a new match you get a "new match" nudge, and nothing otherwise. It turns on only after both partners opt in (18+). Either partner can say "Not tonight", roll again, or hide a position for good, and no reason is asked. Neither answer is shown until you've both responded. Positions you both enjoyed are saved as memories. Everything is text, with no images, and lock-screen notifications stay vague. |
| **Deck** | Adds an Appreciation category to match the original blueprint, and an After Dark category of sensual questions. |
| **Grown-up design** | A dark plum, garnet and champagne palette, Cormorant Garamond headings with Manrope body text, line icons instead of emoji, and adult copy throughout ("Tonight's question", "Seal my answer", "Mood tonight"). Daily questions and moods are written for adults ("In the mood", "Want to be held", "Running on empty"). The colours live in `js/theme.js`. |
| **Your names** | Each partner sets their own name in settings, and the app uses it everywhere instead of "Partner A / B". The single-device demo starts as Alex and Sam, and you can rename both. |
| **Private by design** | Once paired, everything you share is **end-to-end encrypted** on your phones before it leaves them, so the server only stores scrambled data. Each phone makes its own key when you pair, and the two phones agree on a shared key that never leaves them. Settings shows a **security code** to compare on both phones; if it matches, nobody is in the middle. The app loads nothing from third parties: fonts, styles and the Supabase library are served from the app itself, and a Content-Security-Policy blocks any other site. There are no analytics, ads or trackers. Details and limits are under "Privacy" below. |
| **XSS fix** | All user text is rendered with `textContent`. No user data passes through `innerHTML`. |

## Files

```
index.html                         UI shell
config.js                          Keys go here (all blank = offline mode)
js/theme.js                        Colour palette and fonts (read by tailwind.config.js)
css/tailwind.css                   Built stylesheet (rebuild after changing classes, see below)
css/input.css, tailwind.config.js  Tailwind build input and config
vendor/                            Self-hosted fonts (SIL OFL) and supabase-js (MIT), with licences
js/crypto.js                       End-to-end encryption (Web Crypto: ECDH P-256, HKDF, AES-GCM)
js/content.js                      Prompts, decks, vibes, check-in template, challenges
js/store.js                        Local store, outbox, Supabase sync and pairing
js/coach.js                        AI coach client and offline fallback
js/app.js                          Rendering and interactions
sw.js, manifest.webmanifest, icon.svg   Installable PWA, notifications, offline shell
supabase/migrations/0001_ustwo.sql      Tables, RLS, pairing RPCs, realtime
supabase/migrations/0002-0004           Spark, names and wish lists, encryption keys
supabase/functions/coach/index.ts       Edge Function that calls Claude
```

## What you need to provide

1. **A Supabase project** (the free tier should be enough for testing).
   - In Authentication settings, **enable anonymous sign-ins**. Each phone signs in anonymously, with no email needed.
   - Run `supabase/migrations/0001_ustwo.sql`, then `0002_spark.sql`, then `0003_profile_wishes.sql`, then `0004_encryption.sql`, either in the SQL editor or with `supabase db push`.
   - Copy the **Project URL** and the **anon / publishable key** into `config.js`. Never use the `service_role` / secret key in the app.
2. **Not needed for now:** the Coach tab is switched off (`COACH_ENABLED: false` in `config.js`), so the app needs no AI and no Anthropic key, and "Suggest" shuffles the built-in questions. To bring it back later, set `COACH_ENABLED: true` and add **an Anthropic API key** for the coach, from the Claude Console with billing enabled. This key goes **only** into the Edge Function secrets, never into `config.js`:
   ```bash
   supabase functions deploy coach
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   # optional: supabase secrets set COACH_MODEL=claude-sonnet-5-5
   ```
   The default model is `claude-opus-5-5` at low effort, with Anthropic's server-side refusal fallback turned on. A single rewrite is a few thousand tokens at most. At the listed rate of $4 / $20 per million input/output tokens, I estimate that's roughly a cent or less per request. That's my estimate, not a measurement, so check current pricing. Switching to `claude-sonnet-5-5` or `claude-haiku-5-5` costs less.
3. **HTTPS hosting** for the static files, such as Netlify, Vercel, Cloudflare Pages, or GitHub Pages. Service workers and notifications don't work from `file://`. For local testing, `python3 -m http.server` from this folder works because `localhost` counts as secure.

## How I tested it

- **Database:** I ran the migration on a local Postgres 16 with Supabase's `auth.uid()` mocked. I confirmed that the pairing code is 6 digits and single-use, and that outsiders see nothing. Partner B can't read A's answer until B has answered, and can't edit it. The `author` field is set by the server, so it can't be spoofed. The join-attempt limit also triggers.
- **Offline mode:** 25 headless-browser checks all passed. They covered the legacy-data migration, the blind reveal, XSS payloads (`<img onerror>`, `<script>`) rendering as plain text before and after a reload, the coach template, bucket list with `.ics` export, check-ins, challenges, and reload persistence.
- **Two-phone sync:** Two isolated browsers ran against a **simulated** Supabase backend. Pairing, a wrong code, vibes, the blind reveal across devices, prompt changes, the AI coach path, shared bucket edits, and the offline outbox all worked.
- **Edge Function:** It passes the type check against `@anthropic-ai/sdk@0.133.0`. I ran it against a mock API to confirm the request it sends (model, fallback header, JSON-schema output) and its error handling.

- **Privacy:** in the two-phone test, the simulated server's copy contained no readable answers, notes, moods, names or plans, every non-key entry was ciphertext, and both phones showed the same security code. A headless browser loading every tab made zero requests to any other site, from both `localhost` and `file://`. On Postgres, a partner couldn't publish a public key under the other's role, and the blind reveal still worked with encrypted answers.

**Not tested:** none of this has run against a real Supabase project or the real Claude API, because I don't have credentials. The first real run is the true test.

## Things to verify or know (uncertainty, stated plainly)

- **Library calls to check against current docs:**
  - supabase-js v2: `createClient`, `auth.signInAnonymously`, `rpc`, `from().upsert(..., { onConflict })`, `channel().on('postgres_changes', ...)`, and `functions.invoke`. The coach's error handling reads the edge-function error body through `error.context.json()`.
  - I'm fairly but not fully certain that Realtime `postgres_changes` applies RLS to each subscriber. Confirm the blind reveal on two real phones.
  - The Edge Function relies on Supabase's default JWT verification. If your project uses the newer publishable/secret key system, check how functions verify callers.
- **Pinned versions:** supabase-js `2.117.2` (released 2026-09-25, served from `vendor/`) and `@anthropic-ai/sdk` `0.133.0`. Fonts are `@fontsource/manrope` and `@fontsource/cormorant-garamond` `5.3.0`.
- **Rebuilding the styles:** after changing Tailwind classes in `index.html` or `js/`, run `npx tailwindcss@3.4.17 -i css/input.css -o css/tailwind.css --minify`.
- **Content-Security-Policy:** `index.html` only allows connections to `*.supabase.co`. If you use a custom Supabase domain, add it to `connect-src`.
- **Push when the app is closed is not built yet.** Notifications currently fire only while UsTwo is open or in a background tab. Real push needs Web Push: VAPID keys, a table of push subscriptions, and a database webhook or Edge Function that sends them. On iPhone, web push also requires the app to be added to the Home Screen. Check Apple's current requirements.
- **Anonymous identity is tied to the browser.** If someone clears site data or switches phones, they lose access to the shared space. Adding email magic-link sign-in (linking the anonymous user) is the natural next step.
- **Brute-forcing pairing codes:** each identity is limited to 10 tries per hour. Because anonymous identities are cheap to create, also turn on Supabase's CAPTCHA or rate limits for anonymous sign-ins before a public launch.
- **Privacy, what is protected:** answers, notes, moods, names, plans, check-ins, challenges and everything in Spark are encrypted on the phone with AES-256-GCM before upload. The key is derived from both phones' ECDH keys, never sent anywhere, and the server (including Supabase staff or anyone who gets into your database) only sees ciphertext. Single-device mode never sends anything at all.
- **Privacy, what is not hidden (metadata):** the server still sees that two anonymous accounts are paired, which *type* of entry exists and when it changed (e.g. "a note was added at 21:04"), entry ids that contain dates (e.g. Spark responses per day), and the random `promptKey` on answers, which the blind-reveal rule needs. Supabase, like any host, also sees IP addresses in its logs. No email, phone number or name is ever collected.
- **Privacy, keys live on the phone:** the private key is stored in this browser's local storage. If someone clears site data or loses the phone, that device can no longer read the shared space, and you'd need to pair again. Anyone with access to an unlocked phone can read the app, as with any messaging app.
- **Security code:** compare the code in settings on both phones once after pairing. If it differs, someone could be relaying keys (a man-in-the-middle). The app can't detect that by itself.
- **Coach:** it's off. If you ever turn it on, text typed into the Coach is sent to Anthropic for the rewrite and is not end-to-end encrypted. Say this in your privacy policy if you enable it.
- **Not independently audited.** The encryption uses standard building blocks from the browser's Web Crypto API, but it hasn't been reviewed by a security firm. Do that before making strong public claims.
- **Spark privacy:** the app hides each partner's Spark answer until both have responded, and shows only mutual "Want to" positions, but unlike daily-prompt answers, the database does not enforce either. Because both phones hold the couple key, a determined partner could read the other's Spark answer early through the API (outsiders still can't). Tell me if you want it enforced server-side like the daily prompt.
- **Conflicts:** last write wins per item. Shared items (bucket list, current prompt, active challenge) can be edited by either partner. Personal items (answers, vibes, notes, check-ins, challenge progress) can only be edited by their author.
