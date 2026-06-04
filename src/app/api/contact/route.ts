import { NextResponse } from "next/server";
import { sendEmail, renderDefaultNotification } from "@/lib/email";

const TARGET_EMAIL = process.env.MULBOX_ADMIN_EMAIL ?? "info@mulbox.ch";

/** Endpoint demonstracyjny dla formularza /kontakt na stronie publicznej. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Wszystkie pola są wymagane." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Niepoprawny adres email." }, { status: 400 });
  }

  try {
    await sendEmail({
      to: TARGET_EMAIL,
      replyTo: email,
      subject: `[mulbox.ch/kontakt] Wiadomość od ${name}`,
      html: renderDefaultNotification("Formularz kontaktowy", { name, email, message }),
    });
  } catch (e) {
    // Nie blokujemy odpowiedzi – dla deweloperskiego DX wystarczy log.
    // eslint-disable-next-line no-console
    console.warn("[contact]", e);
  }

  return NextResponse.json({ ok: true });
}
