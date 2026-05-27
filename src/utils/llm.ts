import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export interface ParsedPayload {
  email: string;
  name: string | null;
  brewPrompt: string;
}

const SYSTEM_PROMPT = `You are an automated marketing assistant middleware for Brew.new.
Your job is to analyse raw JSON webhook payloads and extract structured data from them.
You MUST respond with a single, valid JSON object only — no markdown fences, no explanation.
The object must have exactly these keys:
  "email"      – the user's primary email address (string, required)
  "name"       – the user's first name or full name if available (string or null)
  "brewPrompt" – a vivid, personalised natural-language instruction for Brew's AI to write
                 a perfectly tailored email campaign about this event.
                 Examples:
                 • "Draft a warm receipt email for Jane who just subscribed to the Pro Plan at $49/month."
                 • "Write a welcome email for Alex who just signed up with their GitHub account."
                 • "Send a payment-failed recovery email to sam@example.com whose card was declined."
If you cannot find an email address in the payload, set "email" to "unknown@unknown.com".`;

/**
 * Uses Groq (llama-3.3-70b-versatile) to extract email, name, and a
 * contextual brewPrompt from any arbitrary webhook JSON payload.
 */
export async function parsePayload(
  eventType: string,
  rawPayload: Record<string, unknown>
): Promise<ParsedPayload> {
  const userPrompt = `Analyse this raw incoming JSON payload for a "${eventType}" event.
Return ONLY valid JSON with keys: email, name, brewPrompt.

Payload:
${JSON.stringify(rawPayload, null, 2)}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    max_completion_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ], 
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? '';

  // Strip any accidental markdown fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  try {
    const parsed = JSON.parse(clean) as ParsedPayload;
    if (!parsed.email) throw new Error('email field missing from LLM output');
    return parsed;
  } catch {
    throw new Error(`Groq returned unparseable JSON: ${text}`);
  }
}