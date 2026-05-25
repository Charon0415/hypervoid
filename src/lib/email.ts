import "server-only";

import { Resend } from "resend";

let _client: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getClient(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _client = new Resend(key);
  return _client;
}

function fromAddress(): string {
  const email = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  const name = process.env.RESEND_FROM_NAME?.trim() || "Hypervoid";
  return `${name} <${email}>`;
}

function adminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim() || null;
}

/**
 * Best-effort admin notification — silently no-ops if RESEND_API_KEY or
 * ADMIN_EMAIL aren't set. Never throws; intended to be fire-and-forget.
 */
export async function notifyAdmin(args: {
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<void> {
  const to = adminEmail();
  if (!to || !isEmailConfigured()) return;
  try {
    const client = getClient();
    await client.emails.send({
      from: fromAddress(),
      to,
      subject: args.subject,
      text: args.bodyText,
      html: args.bodyHtml ?? args.bodyText.replace(/\n/g, "<br>"),
    });
  } catch (e) {
    console.warn("[email] admin notify failed:", e);
  }
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id: string } | { error: string }> {
  if (!isEmailConfigured()) {
    return { error: "RESEND_API_KEY not configured" };
  }
  try {
    const res = await getClient().emails.send({
      from: fromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (res.error) return { error: res.error.message };
    return { id: res.data?.id ?? "" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
