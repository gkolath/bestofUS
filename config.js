// UsTwo configuration.
// Leave everything empty to run fully offline (single device, localStorage, partner switcher).
// Fill in the Supabase values to enable two-phone sync; see README.md for setup.
window.USTWO_CONFIG = {
  // Supabase project URL, e.g. "https://abcdefghijkl.supabase.co"
  SUPABASE_URL: '',
  // Supabase *publishable / anon* key. This is meant to be public; never put a service_role key here.
  SUPABASE_ANON_KEY: '',

  // Coach tab (Translate My Frustration) and AI-written questions. Off for now; set to true to bring
  // the tab back. With it on, the AI path also needs the Edge Function below and an Anthropic key.
  COACH_ENABLED: false,

  // AI coach. Leave as-is to call the bundled Supabase Edge Function at
  // `${SUPABASE_URL}/functions/v1/coach`. The Anthropic API key lives only in that function's
  // secrets, never in this file. Set to '' to force the offline template coach.
  COACH_FUNCTION: 'coach',

  // Pinned client library, served from this app (vendor/) so no third-party CDN sees your users.
  SUPABASE_JS_URL: 'vendor/supabase-js-2.117.2.js'
};
