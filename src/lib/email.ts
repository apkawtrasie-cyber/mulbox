import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "powiadomienia@mulbox.ch";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/** Cienka warstwa nad Resend – jeśli brak klucza, loguje (dev). */
export async function sendEmail({ to, subject, html, replyTo, attachments }: SendArgs): Promise<void> {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn("[email] RESEND_API_KEY brak – pomijam wysyłkę:", { to, subject });
    return;
  }
  const { data, error } = await resend.emails.send({
    from: `Mulbox <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    replyTo: replyTo,
    attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[email] Resend error:", JSON.stringify(error), { to, subject, from: FROM_EMAIL });
    throw new Error(`Resend: ${error.message ?? JSON.stringify(error)}`);
  }
  // eslint-disable-next-line no-console
  console.log("[email] Wysłano OK:", data?.id, "→", to);
}

/** Podstawia tagi {key} na realne wartości z pakietu danych. */
export function applyTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = data[key];
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

/** Mapa angielskich nazw pól na polskie etykiety. */
const PL_LABELS: Record<string, string> = {
  name: "Imię i nazwisko",
  full_name: "Imię i nazwisko",
  fullname: "Imię i nazwisko",
  first_name: "Imię",
  last_name: "Nazwisko",
  email: "E-mail",
  phone: "Telefon",
  tel: "Telefon",
  mobile: "Telefon komórkowy",
  message: "Wiadomość",
  msg: "Wiadomość",
  subject: "Temat",
  company: "Firma",
  company_name: "Nazwa firmy",
  website: "Strona internetowa",
  address: "Adres",
  city: "Miasto",
  zip: "Kod pocztowy",
  country: "Kraj",
  budget: "Budżet",
  deadline: "Termin realizacji",
  description: "Opis projektu",
  project_name: "Nazwa projektu",
  project_type: "Typ projektu",
  notes: "Uwagi",
  additional_info: "Dodatkowe informacje",
  service: "Usługa",
  quantity: "Ilość",
  nip: "NIP",
};

function plLabel(key: string): string {
  return PL_LABELS[key.toLowerCase()] ?? key.replace(/_/g, " ");
}

/** Domyślne renderowanie maila powiadomienia, gdy nie ustawiono custom_email_template. */
export function renderDefaultNotification(formName: string, data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;white-space:nowrap;font-size:13px">${escapeHtml(plLabel(k))}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");
  return `<div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:560px;margin:0 auto">
    <h2 style="margin:0 0 4px;font-size:18px">Nowe zgłoszenie z formularza</h2>
    <p style="margin:0;color:#64748b;font-size:14px">${escapeHtml(formName)}</p>
    <table style="width:100%;margin-top:16px;border-collapse:collapse">${rows}</table>
  </div>`;
}

/**
 * Renderuje czytelny mail dla zgłoszenia konwersacyjnego:
 * dane kontaktowe, streszczenie AI, a następnie pytania → odpowiedzi po kolei.
 */
export function renderConversationNotification(
  formName: string,
  opts: { name?: string; email?: string; qa: Array<{ q: string; a: string }>; summary?: string },
): string {
  const qaHtml = opts.qa
    .map(
      (item, i) => `<div style="margin:0 0 14px">
        <p style="margin:0 0 2px;font-size:12px;color:#7c3aed;font-weight:600">${i + 1}. ${escapeHtml(item.q)}</p>
        <p style="margin:0;font-size:14px;color:#0f172a">${escapeHtml(item.a || "—").replace(/\n/g, "<br/>")}</p>
      </div>`,
    )
    .join("");

  const contact = [opts.name, opts.email].filter((v): v is string => Boolean(v)).map(escapeHtml).join(" · ");

  const summaryBlock = opts.summary
    ? `<div style="margin:16px 0;padding:14px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6d28d9">Streszczenie</p>
        <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.55">${escapeHtml(opts.summary).replace(/\n/g, "<br/>")}</p>
      </div>`
    : "";

  return `<div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:600px;margin:0 auto">
    <h2 style="margin:0 0 4px;font-size:18px">Nowe zgłoszenie z formularza</h2>
    <p style="margin:0;color:#64748b;font-size:14px">${escapeHtml(formName)}</p>
    ${contact ? `<p style="margin:6px 0 0;color:#334155;font-size:14px;font-weight:600">${contact}</p>` : ""}
    ${summaryBlock}
    <p style="margin:18px 0 10px;font-size:13px;font-weight:700;color:#0f172a">Pytania i odpowiedzi</p>
    ${qaHtml}
    <p style="margin-top:8px;font-size:12px;color:#94a3b8">📎 Pełna wersja w załączonym pliku PDF.</p>
  </div>`;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
