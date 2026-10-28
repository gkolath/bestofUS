// UsTwo AI communication coach (Supabase Edge Function, Deno).
// POST { mode: "translate", text } -> { rewrite, feeling, need, tip, safety_concern }
// POST { mode: "prompts", history } -> { prompts: string[] }
//
// Secrets (set with `supabase secrets set ...`):
//   ANTHROPIC_API_KEY  required
//   COACH_MODEL        optional, defaults to claude-opus-5-5
import Anthropic from "npm:@anthropic-ai/sdk@0.133.0";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
const MODEL = Deno.env.get("COACH_MODEL") ?? "claude-opus-5-5";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TRANSLATE_SYSTEM = `You help one partner in a couple turn a heated or frustrated thought into something they can say to their partner without blame.
Rewrite it as a short, warm, non-defensive "I feel ... when ... because ... Could we ...?" message in the speaker's own voice.
Keep their real concern; do not water it down into something they did not mean. No therapy jargon, no diagnosis, no taking sides.
"feeling" is the core emotion in one or two words. "need" is the underlying need in a short phrase. "tip" is one sentence on how or when to bring it up.
If the text describes violence, threats, coercion, or fear for someone's safety, set safety_concern to true, do not coach toward reconciliation, and use "tip" to gently suggest reaching out to a trusted person or a local domestic-violence or crisis line.`;

const PROMPTS_SYSTEM = `You write daily connection questions for a couple's app. Each question is answered by both partners separately and revealed together.
Using the couple's recent answers, notes and plans as context, write 5 fresh questions: a mix of playful, appreciative, and gently deep.
Build on things they have mentioned when it fits, but never quote private details back verbatim, and never be explicit. One sentence each, under 25 words, written to "you".`;

const TRANSLATE_SCHEMA = {
  type: "object",
  properties: {
    rewrite: { type: "string" },
    feeling: { type: "string" },
    need: { type: "string" },
    tip: { type: "string" },
    safety_concern: { type: "boolean" },
  },
  required: ["rewrite", "feeling", "need", "tip", "safety_concern"],
  additionalProperties: false,
};

const PROMPTS_SCHEMA = {
  type: "object",
  properties: { prompts: { type: "array", items: { type: "string" } } },
  required: ["prompts"],
  additionalProperties: false,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function ask(system: string, user: string, schema: Record<string, unknown>) {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema } },
    system,
    messages: [{ role: "user", content: user }],
  });
  if (response.stop_reason === "refusal") {
    return { refused: true as const };
  }
  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  return { refused: false as const, value: JSON.parse(text) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { mode?: string; text?: string; history?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  try {
    if (body.mode === "translate") {
      const text = String(body.text ?? "").trim().slice(0, 2000);
      if (!text) return json({ error: "text is required" }, 400);
      const result = await ask(TRANSLATE_SYSTEM, text, TRANSLATE_SCHEMA);
      if (result.refused) return json({ error: "The coach couldn't help with this one." }, 422);
      return json(result.value);
    }
    if (body.mode === "prompts") {
      const history = String(body.history ?? "").slice(0, 4000);
      const user = history
        ? `Recent context from this couple:\n${history}`
        : "No history yet; write general questions for a new couple using the app.";
      const result = await ask(PROMPTS_SYSTEM, user, PROMPTS_SCHEMA);
      if (result.refused) return json({ error: "The coach couldn't generate prompts right now." }, 422);
      return json({ prompts: (result.value.prompts as string[]).slice(0, 5) });
    }
    return json({ error: "mode must be 'translate' or 'prompts'" }, 400);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: "Coach is busy, try again shortly." }, 429);
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return json({ error: "Coach is unavailable right now." }, 502);
    }
    console.error(err);
    return json({ error: "Unexpected error" }, 500);
  }
});
