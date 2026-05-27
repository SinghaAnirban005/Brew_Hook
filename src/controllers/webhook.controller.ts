import { Request, Response } from "express";

export const webhookHandler = async (req: Request, res: Response) => {
  const event_type = req.params['event_type'] as string;
  const rawPayload = req.body as Record<string, unknown>;

  console.log(`\n Incoming webhook  event_type="${event_type}"`);
  console.log('Payload:', JSON.stringify(rawPayload, null, 2));

  try {
    const result = await handleWebhook(event_type, rawPayload);
    res.status(202).json({
      ok: true,
      event_type,
      contact: result.contact,
      emailId: result.emailId,
      brewPrompt: result.brewPrompt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Webhook processing failed:', message);
    res.status(500).json({ ok: false, error: message });
  }
}