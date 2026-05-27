import { createBrewClient, BrewApiError } from '@brew.new/sdk';
import type { ParsedPayload } from './llm';

const brew = createBrewClient({ apiKey: process.env.BREW_API_KEY! });

export interface BrewResult {
  contact: { email: string; created: boolean };
  emailId: string | null;
  emailHtml: string | null;
}

export async function dispatchToBrew(
  eventType: string,
  parsed: ParsedPayload
): Promise<BrewResult> {

  const nameParts = parsed.name ? parsed.name.trim().split(/\s+/) : [];
  const firstName = nameParts[0] ?? undefined;
  const lastName = nameParts.slice(1).join(' ') || undefined;

  let contactResult: Awaited<ReturnType<typeof brew.contacts.upsert>>;
  try {
    contactResult = await brew.contacts.upsert({
      email: parsed.email,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      subscribed: true,
      customFields: { lastEvent: eventType },
    });
    console.log(
      `Contact ${contactResult.created ? 'CREATED' : 'UPDATED'}: ${contactResult.contact.email}`
    );
  } catch (err) {
    if (err instanceof BrewApiError) {
      throw new Error(`Brew contacts.upsert failed [${err.code}]: ${err.message}`);
    }
    throw err;
  }

  let emailId: string | null = null;
  let emailHtml: string | null = null;

  try {
    const emailType = eventType.includes('newsletter') || eventType.includes('promo')
      ? 'campaign'
      : 'transactional';

    const generated = await brew.emails.generate({
      prompt: parsed.brewPrompt,
      emailType,
    });

    if ('emailId' in generated) {
      emailId = generated.emailId;
      emailHtml = generated.emailHtml ?? null;
      console.log(`Email draft generated — emailId: ${emailId}`);
    } else {
      // brew.emails.generate can return a clarification response instead of an email
      console.warn(`Brew responded with text instead of an email:`, generated.response);
    }
  } catch (err) {
    if (err instanceof BrewApiError) {
      throw new Error(`Brew emails.generate failed [${err.code}]: ${err.message}`);
    }
    throw err;
  }

  return {
    contact: {
      email: contactResult.contact.email,
      created: contactResult.created,
    },
    emailId,
    emailHtml,
  };
}