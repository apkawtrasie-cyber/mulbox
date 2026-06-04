"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  /** ID formularza Mulbox – domyślnie z env NEXT_PUBLIC_CONTACT_FORM_ID */
  formId?: string;
  /** Tytuł nad formularzem */
  title?: string;
  /** Krótki opis pod tytułem */
  description?: string;
}

/**
 * Samowystarczalny formularz kontaktowy – karta z tytułem, polami i przyciskiem.
 * Wysyła zgłoszenie do /api/f/{formId} (pełny pipeline Mulbox).
 * Wstaw w dowolnym miejscu: <ContactForm />
 */
/** Wyciąga samo UUID z formId – obsługuje zarówno "uuid" jak i "https://…/p/uuid" */
function resolveFormId(raw: string): string {
  if (!raw) return "";
  if (raw.includes("/")) return raw.split("/").filter(Boolean).pop() ?? raw;
  return raw;
}

export function ContactForm({
  formId: rawFormId = process.env.NEXT_PUBLIC_CONTACT_FORM_ID ?? "",
  title = "Skontaktuj się z nami",
  description,
}: Props) {
  const formId = resolveFormId(rawFormId);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const hasCaptcha = siteKey.length > 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formId) { setError("Brak konfiguracji formularza."); return; }
    setStatus("loading");
    setError(null);

    if (hasCaptcha && !recaptchaRef.current?.getValue()) {
      setError("Zaznacz checkbox \'Nie jestem robotem\'.");
      setStatus("idle");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = Object.fromEntries(
      Array.from(fd.entries()).filter(([, v]) => typeof v === "string") as [string, string][]
    );
    if (hasCaptcha) {
      payload["recaptchaToken"] = recaptchaRef.current!.getValue()!;
    }

    try {
      const res = await fetch(`/api/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Nie udało się wysłać wiadomości.");
      }
      setStatus("success");
      (e.target as HTMLFormElement).reset();
      recaptchaRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd sieci.");
      setStatus("error");
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl bg-white border border-violet-100 shadow-violet p-6 sm:p-8">
      {status === "success" ? (
        <div className="flex flex-col items-center text-center py-8">
          <CheckCircle2 className="text-emerald-500" size={44} />
          <h3 className="text-xl font-bold mt-4 text-slate-900">Wiadomość wysłana!</h3>
          <p className="mt-2 text-slate-600">Odezwiemy się tak szybko, jak to możliwe.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <div>
            <label className="label" htmlFor="cf-name">Imię i nazwisko</label>
            <input id="cf-name" name="name" required className="input" placeholder="Jan Kowalski" />
          </div>
          <div>
            <label className="label" htmlFor="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" required className="input" placeholder="jan@przyklad.pl" />
          </div>
          <div>
            <label className="label" htmlFor="cf-message">Wiadomość</label>
            <textarea id="cf-message" name="message" required rows={5} className="input resize-none" placeholder="W czym możemy pomóc?" />
          </div>
          {hasCaptcha && (
            <ReCAPTCHA ref={recaptchaRef} sitekey={siteKey} />
          )}
          {error && (
            <p className="flex items-center gap-2 text-sm text-rose-600"><AlertCircle size={16} /> {error}</p>
          )}
          <button type="submit" disabled={status === "loading"} className="btn-primary w-full disabled:opacity-60 justify-center py-3 text-base rounded-xl">
            <Send size={18} /> {status === "loading" ? "Wysyłanie…" : "Wyślij wiadomość"}
          </button>
        </form>
      )}
    </div>
  );
}
