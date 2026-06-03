"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { ImagePlus } from "lucide-react";
import type { FormField } from "@/lib/types";

interface Props {
  formId: string;
  fields: FormField[];
  submitLabel: string;
  siteKey: string;
  accentColor?: string;
  footer?: string;
  wide?: boolean;
}

export default function PublicForm({ formId, fields, submitLabel, siteKey, accentColor, footer, wide }: Props) {
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
      className="mt-8 rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
    >
      <div className={wide ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
        {fields.map((f) => {
          const fullWidth = wide && (f.type === "textarea" || f.type === "file");
          return (
            <div key={f.id} className={fullWidth ? "md:col-span-2" : undefined}>
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
              ) : f.type === "file" ? (
                <FileDropzone field={f} />
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
          );
        })}
      </div>

      {hasCaptcha && (
        <div className="flex justify-center py-1 mt-6">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            onChange={(token) => setCaptchaDone(!!token)}
            onExpired={() => setCaptchaDone(false)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 text-center mt-4">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || (hasCaptcha && !captchaDone)}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        style={accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
      >
        {loading ? "Wysyłanie…" : submitLabel}
      </button>

      {footer && (
        <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 whitespace-pre-line">
          {footer}
        </p>
      )}

      <p className="text-center text-xs text-slate-400 mt-3">
        Powered by{" "}
        <a href="/" className="underline">
          Mulbox.ch
        </a>
      </p>
    </form>
  );
}

function FileDropzone({ field }: { field: FormField }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [names, setNames] = useState<string | null>(null);

  function applyFiles(files: FileList | null) {
    if (!files || files.length === 0) { setNames(null); return; }
    setNames(Array.from(files).map((f) => f.name).join(", "));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!inputRef.current) return;
    try {
      const dt = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    } catch { /* fallback: user clicks to re-select */ }
    applyFiles(e.dataTransfer.files);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={[
        "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer select-none min-h-[120px] flex flex-col items-center justify-center",
        isDragging
          ? "border-violet-500 bg-violet-50"
          : "border-gray-300 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/40",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        id={field.id}
        name={field.name}
        type="file"
        required={field.required}
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => applyFiles(e.target.files)}
      />
      <ImagePlus className="mb-2 text-slate-400" size={36} />
      {names ? (
        <p className="text-sm font-medium text-slate-700 break-all px-2">{names}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600">Kliknij lub przeciągnij zdjęcia tutaj</p>
          <p className="mt-1 text-xs text-slate-400">Max 5MB</p>
        </>
      )}
    </div>
  );
}
