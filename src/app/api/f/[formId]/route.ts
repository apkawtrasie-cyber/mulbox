import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { applyTemplate, renderDefaultNotification, renderConversationNotification, sendEmail, escapeHtml } from "@/lib/email";
import { buildConversationPdf } from "@/lib/pdf";
import type { FormRecord, PlanType } from "@/lib/types";

/** Wyłuskuje pary pytanie→odpowiedź ze zgłoszenia konwersacyjnego (klucze "1. ...", "2. ..."). */
function extractQA(data: Record<string, unknown>): Array<{ q: string; a: string }> {
  return Object.entries(data)
    .filter(([k]) => /^\d+\.\s/.test(k))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([k, v]) => ({ q: k.replace(/^\d+\.\s/, ""), a: String(v ?? "") }));
}

/** Pomocniczo: wyciąga email nadawcy jeśli sender_email nie zostanie ustawiony triggerem. */
function extractEmail(data: Record<string, unknown>): string | null {
  for (const v of Object.values(data)) {
    const s = String(v ?? "");
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return s;
  }
  return null;
}

/** Parsuje JSON lub form-urlencoded / multipart. Pliki zwraca osobno. */
async function parseBody(
  req: Request,
): Promise<{ data: Record<string, unknown>; files: Array<{ field: string; file: File }> }> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return { data: (await req.json()) as Record<string, unknown>, files: [] };
  }
  const fd = await req.formData();
  const data: Record<string, unknown> = {};
  const files: Array<{ field: string; file: File }> = [];
  fd.forEach((v, k) => {
    if (v instanceof File && v.size > 0) {
      files.push({ field: k, file: v });
    } else {
      data[k] = typeof v === "string" ? v : String(v);
    }
  });
  return { data, files };
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
  const { data: rawData, files } = await parseBody(req).catch(() => ({ data: {} as Record<string, unknown>, files: [] }));
  const recaptchaToken = (rawData["g-recaptcha-response"] as string | undefined)
    ?? (rawData["recaptchaToken"] as string | undefined)
    ?? null;
  delete rawData["g-recaptcha-response"];
  delete rawData["recaptchaToken"];

  // Upload plików do Supabase Storage
  const fileLinks: Array<{ field: string; name: string; url: string }> = [];
  for (const { field, file } of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${params.formId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
    const buffer = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from("form-attachments")
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (!upErr) {
      const { data: urlData } = supabase.storage.from("form-attachments").getPublicUrl(path);
      fileLinks.push({ field, name: file.name, url: urlData.publicUrl });
      rawData[field] = `[plik] ${file.name}`;
    } else {
      console.warn("[upload]", upErr.message);
      rawData[field] = `[błąd uploadu] ${file.name}`;
    }
    void ext;
  }
  const body = rawData;

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

  // Sekcja HTML z linkami do załączników
  const attachmentsHtml = fileLinks.length > 0
    ? `<div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-weight:600;color:#334155;font-size:13px">📎 Załączniki (${fileLinks.length}):</p>
        ${fileLinks.map(f =>
          `<p style="margin:4px 0;font-size:13px"><a href="${escapeHtml(f.url)}" style="color:#7c3aed">${escapeHtml(f.name)}</a></p>`
        ).join("")}
      </div>`
    : "";

  // Mail 1 → właściciel
  const isConversational = form.config?.form_type === "conversational";
  if (ownerEmail) {
    const signature = form.notification_signature
      ? `<p style="margin-top:24px;color:#64748b;font-size:13px">${escapeHtml(form.notification_signature).replace(/\n/g, "<br/>")}</p>`
      : "";
    const branding = plan === "free"
      ? `<hr style="margin:24px 0;border:none;border-top:1px solid #eee" /><p style="text-align:center;color:#94a3b8;font-size:12px">Powered by <a href="https://mulbox.ch" style="color:#7c3aed">Mulbox.ch</a></p>`
      : "";

    if (isConversational) {
      // Tryb konwersacyjny: czytelny mail Q&A + PDF w załączniku.
      const qa = extractQA(body);
      const summary = String(body["📋 Podsumowanie AI"] ?? "");
      const name = String(body["Imię i nazwisko"] ?? "");
      const tplBody = renderConversationNotification(form.name, {
        name,
        email: senderEmail ?? undefined,
        qa,
        summary,
      });
      const attachments = [];
      try {
        const pdf = await buildConversationPdf({
          formName: form.name,
          name,
          email: senderEmail ?? undefined,
          qa,
          summary,
          createdAt: new Date(),
        });
        const safeName = form.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40) || "zgloszenie";
        attachments.push({ filename: `${safeName}.pdf`, content: Buffer.from(pdf) });
      } catch (e) {
        console.warn("[pdf]", e);
      }
      await sendEmail({
        to: ownerEmail,
        replyTo: senderEmail ?? undefined,
        subject: `Nowe zgłoszenie: ${form.name}`,
        html: `<div>${tplBody}${signature}${branding}</div>`,
        attachments,
      }).catch((e) => console.warn("[mail owner]", e));
    } else {
      const tplBody = form.custom_email_template
        ? applyTemplate(form.custom_email_template, body).replace(/\n/g, "<br/>")
        : renderDefaultNotification(form.name, body);
      await sendEmail({
        to: ownerEmail,
        replyTo: senderEmail ?? undefined,
        subject: `Nowa wiadomość: ${form.name}`,
        html: `<div>${tplBody}${attachmentsHtml}${signature}${branding}</div>`,
      }).catch((e) => console.warn("[mail owner]", e));
    }
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
