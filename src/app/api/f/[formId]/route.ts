import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { applyTemplate, renderDefaultNotification, sendEmail, escapeHtml } from "@/lib/email";
import type { FormRecord, PlanType } from "@/lib/types";

/** Pomocniczo: wyciąga email nadawcy jeśli sender_email nie zostanie ustawiony triggerem. */
function extractEmail(data: Record<string, unknown>): string | null {
  for (const v of Object.values(data)) {
    const s = String(v ?? "");
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return s;
  }
  return null;
}

/** Parsuje JSON lub form-urlencoded / multipart. */
async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await req.json()) as Record<string, unknown>;
  const fd = await req.formData();
  const out: Record<string, unknown> = {};
  fd.forEach((v, k) => { out[k] = typeof v === "string" ? v : String(v); });
  return out;
}

export async function POST(req: Request, { params }: { params: { formId: string } }) {
  const supabase = createServiceSupabase();

  // 1) Pobierz config formularza + plan właściciela (do brandingowej stopki)
  const { data: form, error: formErr } = await supabase
    .from("forms")
    .select("*, profiles:user_id(plan_type, email, full_name)")
    .eq("id", params.formId)
    .maybeSingle<FormRecord & { profiles: { plan_type: PlanType; email: string; full_name: string | null } }>();

  if (formErr || !form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }
  if (!form.is_active) {
    return NextResponse.json({ error: "Form is disabled" }, { status: 403 });
  }

  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  const body = await parseBody(req).catch(() => ({} as Record<string, unknown>));
  const recaptchaToken = (body["g-recaptcha-response"] as string | undefined)
    ?? (body["recaptchaToken"] as string | undefined)
    ?? null;
  // Czyścimy "techniczne" klucze z payloadu zapisywanego do bazy
  delete body["g-recaptcha-response"];
  delete body["recaptchaToken"];

  // 2) reCAPTCHA
  // Weryfikuj tylko gdy:
  //   a) formularz ma własny klucz Premium (recaptcha_site_key ustawiony), LUB
  //   b) token został przesłany (strona /p/[id] zawsze go dołącza)
  // HTML embed nie ma widgetu – brak tokenu = przepuszczamy bez weryfikacji.
  const hasFormCaptcha = !!form.recaptcha_site_key;
  const secretKey = hasFormCaptcha
    ? (form.recaptcha_secret_key ?? process.env.RECAPTCHA_SECRET_KEY ?? null)
    : recaptchaToken
    ? (process.env.RECAPTCHA_SECRET_KEY ?? null)
    : null;

  if (secretKey) {
    const ok = await verifyRecaptcha(secretKey, recaptchaToken);
    if (!ok) {
      if (wantsJson) {
        return NextResponse.json(
          { error: "Weryfikacja reCAPTCHA nie powiodła się. Spróbuj ponownie." },
          { status: 400 },
        );
      }
      return NextResponse.redirect(new URL(`/p/${form.id}`, req.url), 303);
    }
  }

  const senderEmail = extractEmail(body);

  // 3) Zapis do bazy
  const { error: insErr } = await supabase.from("submissions").insert({
    form_id: form.id,
    data: body,
    sender_email: senderEmail,
    is_spam: false,
  });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // 4) Wysyłka maili
  const ownerEmail = form.notification_email ?? form.profiles?.email;
  const plan = form.profiles?.plan_type ?? "free";

  // Mail 1 → właściciel
  if (ownerEmail) {
    const tplBody = form.custom_email_template
      ? applyTemplate(form.custom_email_template, body).replace(/\n/g, "<br/>")
      : renderDefaultNotification(form.name, body);
    const signature = form.notification_signature
      ? `<p style="margin-top:24px;color:#64748b;font-size:13px">${escapeHtml(form.notification_signature).replace(/\n/g, "<br/>")}</p>`
      : "";
    const branding = plan === "free"
      ? `<hr style="margin:24px 0;border:none;border-top:1px solid #eee" /><p style="text-align:center;color:#94a3b8;font-size:12px">Powered by <a href="https://mulbox.ch" style="color:#7c3aed">Mulbox.ch</a></p>`
      : "";
    await sendEmail({
      to: ownerEmail,
      replyTo: senderEmail ?? undefined,
      subject: `Nowa wiadomość: ${form.name}`,
      html: `<div>${tplBody}${signature}${branding}</div>`,
    }).catch((e) => console.warn("[mail owner]", e));
  }

  // Mail 2 → autoresponder (Premium) do klienta
  if (form.autoresponder_enabled && plan !== "free" && senderEmail) {
    const subject = form.autoresponder_subject || "Dziękujemy za kontakt";
    const bodyText = form.autoresponder_body
      ? applyTemplate(form.autoresponder_body, body).replace(/\n/g, "<br/>")
      : "Dziękujemy za wiadomość. Odezwiemy się najszybciej jak to możliwe.";
    const signature = form.notification_signature
      ? `<p style="margin-top:24px;color:#64748b;font-size:13px">${escapeHtml(form.notification_signature).replace(/\n/g, "<br/>")}</p>`
      : "";
    await sendEmail({
      to: senderEmail,
      subject,
      html: `<div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:560px;margin:0 auto"><p>${bodyText}</p>${signature}</div>`,
    }).catch((e) => console.warn("[mail autoresponder]", e));
  }

  // 5) Redirect lub JSON
  const customRedirect = plan !== "free" ? form.redirect_url : null;
  const redirectTarget = customRedirect || `/p/${form.id}/success`;

  if (wantsJson) return NextResponse.json({ ok: true, redirect: redirectTarget });
  return NextResponse.redirect(new URL(redirectTarget, req.url), 303);
}
