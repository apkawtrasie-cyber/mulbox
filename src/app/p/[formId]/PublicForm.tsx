"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import type { FormField } from "@/lib/types";

interface Props {
  formId: string;
  fields: FormField[];
  submitLabel: string;
  siteKey: string;
}

export default function PublicForm({ formId, fields, submitLabel, siteKey }: Props) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaDone, setCaptchaDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCaptcha = siteKey.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (hasCaptcha) {
      const token = recaptchaRef.current?.getValue() ?? null;
      if (!token) {
        setError("Zaznacz checkbox 'Nie jestem robotem', aby wysłać formularz.");
        return;
      }
    }

    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);

      if (hasCaptcha) {
        const token = recaptchaRef.current!.getValue()!;
        fd.set("g-recaptcha-response", token);
      }

      const res = await fetch(`/api/f/${formId}`, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        redirect?: string;
        error?: string;
      };

      if (res.ok && json.ok) {
        window.location.assign(json.redirect ?? `/p/${formId}/success`);
        return;
      }

      setError(json.error ?? "Wystąpił błąd. Spróbuj ponownie.");
      recaptchaRef.current?.reset();
      setCaptchaDone(false);
    } catch {
      setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
      recaptchaRef.current?.reset();
      setCaptchaDone(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
    >
      {fields.map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className="label">
            {f.label}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={f.id}
              name={f.name}
              placeholder={f.placeholder}
              required={f.required}
              rows={4}
              className="input resize-none"
            />
          ) : (
            <input
              id={f.id}
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              required={f.required}
              className="input"
            />
          )}
        </div>
      ))}

      {hasCaptcha && (
        <div className="flex justify-center py-1">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={(token) => setCaptchaDone(!!token)}
            onExpired={() => setCaptchaDone(false)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || (hasCaptcha && !captchaDone)}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Wysyłanie…" : submitLabel}
      </button>

      <p className="text-center text-xs text-slate-400">
        Powered by{" "}
        <a href="/" className="underline">
          Mulbox.ch
        </a>
      </p>
    </form>
  );
}
