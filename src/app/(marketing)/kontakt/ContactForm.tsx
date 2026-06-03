"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

/** Formularz kontaktowy strefy publicznej – wysyła do /api/contact. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Nie udało się wysłać wiadomości.");
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd sieci.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <CheckCircle2 className="text-emerald-500" size={40} />
        <h3 className="h3 mt-3">Wiadomość wysłana!</h3>
        <p className="mt-1 text-slate-600">Odezwiemy się tak szybko, jak to możliwe.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Skontaktuj się z nami</h2>
      <div>
        <label className="label" htmlFor="name">Imię i nazwisko</label>
        <input id="name" name="name" required className="input" placeholder="Jan Kowalski" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" placeholder="jan@przyklad.pl" />
      </div>
      <div>
        <label className="label" htmlFor="message">Wiadomość</label>
        <textarea id="message" name="message" required rows={5} className="input resize-none" placeholder="W czym możemy pomóc?" />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-sm text-rose-600"><AlertCircle size={16} /> {error}</p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full disabled:opacity-60">
        <Send size={16} /> {status === "loading" ? "Wysyłanie…" : "Wyślij wiadomość"}
      </button>
    </form>
  );
}
