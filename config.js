// UsTwo configuration.
// Leave everything empty to run fully offline (single device, localStorage, partner switcher).
// Fill in the Supabase values to enable two-phone sync; see README.md for setup.
window.USTWO_CONFIG = {
  // Supabase project URL, e.g. "https://abcdefghijkl.supabase.co"
  SUPABASE_URL: '',
  // Supabase *publishable / anon* key. This is meant to be public; never put a service_role key here.
  SUPABASE_ANON_KEY: '',

  // AI coach. Leave as-is to call the bundled Supabase Edge Function at
  // `${SUPABASE_URL}/functions/v1/coach`. The Anthropic API key lives only in that function's
  // secrets, never in this file. Set to '' to force the offline template coach.
  COACH_FUNCTION: 'coach',

  // Pinned client library (UMD build). Verify this version against the Supabase docs before production.
  SUPABASE_JS_URL: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js'
};
