"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { ImagePlus, FileText as FileIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
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
        {[...fields].sort((a, b) =>
          a.type === "checkbox" && b.type !== "checkbox" ? 1
          : a.type !== "checkbox" && b.type === "checkbox" ? -1
          : 0
        ).map((f) => {
          const fullWidth = wide && (f.type === "textarea" || f.type === "file" || f.type === "checkbox");

          if (f.type === "checkbox") {
            return (
              <div key={f.id} className={fullWidth ? "md:col-span-2" : undefined}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id={f.id}
                    name={f.name}
                    required={f.required}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug">
                    {f.placeholder || f.label}
                  </span>
                </label>
              </div>
            );
          }

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
              ) : f.type === "select" ? (
                <select
                  id={f.id}
                  name={f.name}
                  required={f.required}
                  defaultValue=""
                  className="input"
                >
                  <option value="" disabled>{f.placeholder || "— Wybierz opcję —"}</option>
                  {(f.options ?? []).filter(Boolean).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
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

interface Preview { name: string; url: string; isImage: boolean; }

function FileDropzone({ field }: { field: FormField }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  function applyFiles(files: FileList | null) {
    previews.forEach((p) => { if (p.isImage) URL.revokeObjectURL(p.url); });
    if (!files || files.length === 0) { setPreviews([]); return; }
    setPreviews(
      Array.from(files).map((f) => ({
        name: f.name,
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
        isImage: f.type.startsWith("image/"),
      }))
    );
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!inputRef.current) return;
    try {
      const dt = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    } catch { /* fallback */ }
    applyFiles(e.dataTransfer.files);
  }

  const imagePreviews = previews.filter((p) => p.isImage);

  function prevImg(e: React.MouseEvent) {
    e.stopPropagation();
    setLightbox((i) => (i !== null && i > 0 ? i - 1 : i));
  }
  function nextImg(e: React.MouseEvent) {
    e.stopPropagation();
    setLightbox((i) => (i !== null && i < imagePreviews.length - 1 ? i + 1 : i));
  }

  return (
    <div>
      {/* Dropzone */}
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
          required={field.required && previews.length === 0}
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => applyFiles(e.target.files)}
        />
        <ImagePlus className="mb-2 text-slate-400" size={36} />
        {previews.length > 0 ? (
          <p className="text-sm font-medium text-slate-700">
            {previews.length} {previews.length === 1 ? "plik wybrany" : previews.length < 5 ? "pliki wybrane" : "plików wybranych"} – kliknij, by zmienić
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-600">Kliknij lub przeciągnij zdjęcia tutaj</p>
            <p className="mt-1 text-xs text-slate-400">Max 5MB</p>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => p.isImage && setLightbox(imagePreviews.indexOf(p))}
              className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 transition-all ${
                p.isImage
                  ? "cursor-zoom-in hover:border-violet-400 hover:scale-105"
                  : "cursor-default"
              }`}
            >
              {p.isImage ? (
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1 px-1">
                  <FileIcon size={22} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 text-center leading-tight break-all line-clamp-2">{p.name}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && imagePreviews[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-screen-lg w-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagePreviews[lightbox].url}
              alt={imagePreviews[lightbox].name}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-sm text-white/60 truncate max-w-xs">
              {imagePreviews[lightbox].name}
            </p>
            {imagePreviews.length > 1 && (
              <p className="mt-1 text-xs text-white/40">
                {lightbox + 1} / {imagePreviews.length}
              </p>
            )}
          </div>

          {/* Zamknij */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Poprzednie */}
          {lightbox > 0 && (
            <button
              onClick={prevImg}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Następne */}
          {lightbox < imagePreviews.length - 1 && (
            <button
              onClick={nextImg}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
