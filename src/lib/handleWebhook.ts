import { parsePayload } from '../utils/llm';
import { dispatchToBrew } from '../utils/brew';
import type { BrewResult } from '../utils/brew';

export interface WebhookResult extends BrewResult {
  brewPrompt: string;
}

export async function handleWebhook(
  eventType: string,
  rawPayload: Record<string, unknown>
): Promise<WebhookResult> {
  console.log(`Step 1 — Parsing payload for event: "${eventType}"`);

  const parsed = await parsePayload(eventType, rawPayload);

  console.log(`LLM extracted`);
  console.log(`email: ${parsed.email}`);
  console.log(`name: ${parsed.name ?? '(not found)'}`);
  console.log(`prompt: ${parsed.brewPrompt}`);
  console.log(`\n Step 2 — Dispatching to Brew SDK`);

  const brewResult = await dispatchToBrew(eventType, parsed);

  console.log(`\n Done — emailId: ${brewResult.emailId ?? 'n/a (no draft created)'}`);

  return { ...brewResult, brewPrompt: parsed.brewPrompt };
}