"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Save, Plus, Trash2, Check, ExternalLink, QrCode, Sparkles, X, Download } from "lucide-react";
import type { FormField, FormRecord, PlanType } from "@/lib/types";
import { generateFormHTML } from "@/lib/htmlGenerator";
import { AIPanel } from "./AIPanel";
import { QuickAddFieldsPanel } from "./QuickAddFieldsPanel";

interface Props {
  forms: FormRecord[];
  selectedForm: FormRecord | null;
  onSelectForm: (id: string) => void;
  plan: PlanType;
}


export function FormBuilder({ forms, selectedForm, onSelectForm, plan }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(selectedForm?.config?.fields ?? []);
  const [name, setName] = useState(selectedForm?.name ?? "Nowy formularz");
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [rightPanel, setRightPanel] = useState<"html" | "ai">("html");

  useEffect(() => {
    setFields(selectedForm?.config?.fields ?? []);
    setName(selectedForm?.name ?? "Nowy formularz");
  }, [selectedForm?.id]);

  const html = useMemo(() => {
    if (!selectedForm) return "";
    return generateFormHTML(selectedForm.id, { ...selectedForm.config, fields }, plan);
  }, [selectedForm, fields, plan]);

  function addPreset(preset: Omit<FormField, "id">) {
    setFields((prev) => [...prev, { ...preset, id: crypto.randomUUID() }]);
  }
  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }
  function addAiField(preset: Omit<FormField, "id">) {
    setFields((prev) => [...prev, { ...preset, id: crypto.randomUUID() }]);
  }
  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function save() {
    if (!selectedForm) return;
    setSaving(true);
    try {
      await fetch(`/api/forms/${selectedForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config: { ...selectedForm.config, fields } }),
      });
      router.refresh();
    } finally { setSaving(false); }
  }

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyUrl() {
    const url = `${window.location.origin}/p/${selectedForm?.id}`;
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  if (!selectedForm) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">
          {forms.length === 0
            ? "Nie masz jeszcze żadnego formularza."
            : "Wybierz formularz, aby go edytować."}
        </p>
        {forms.length === 0 ? (
          <button
            onClick={async () => {
              const res = await fetch("/api/forms", { method: "POST" });
              if (res.ok) {
                const { form } = await res.json();
                router.refresh();
                if (form?.id) onSelectForm(form.id);
              }
            }}
            className="btn-primary mt-5 inline-flex"
          >
            <Plus size={16} /> Utwórz pierwszy formularz
          </button>
        ) : (
          <select
            onChange={(e) => onSelectForm(e.target.value)}
            defaultValue=""
            className="input mt-5 max-w-xs mx-auto"
          >
            <option value="" disabled>Wybierz formularz…</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        )}
      </div>
    );
  }

  return (
    <section>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wizualny kreator</h1>
          <p className="text-sm text-slate-500">Klikaj klocki, układaj formularz, kopiuj kod do WordPressa.</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedForm.id} onChange={(e) => onSelectForm(e.target.value)} className="input max-w-xs">
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {saving ? "Zapisuję…" : "Zapisz"}
          </button>
        </div>
      </header>

      {/* Link do publicznej strony formularza */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="text-xs text-slate-500 shrink-0">Publiczny link:</span>
        <code className="flex-1 truncate text-xs font-mono text-slate-700">
          {typeof window !== "undefined" ? `${window.location.origin}/p/${selectedForm.id}` : `/p/${selectedForm.id}`}
        </code>
        <button
          onClick={copyUrl}
          className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
        >
          {copiedUrl ? <><Check size={13} /> Skopiowano</> : <><Copy size={13} /> Kopiuj</>}
        </button>
        <a
          href={`/p/${selectedForm.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
        >
          <ExternalLink size={13} /> Otwórz
        </a>
        <button
          onClick={() => setShowQR((v) => !v)}
          className={`btn-secondary py-1.5 px-2.5 text-xs shrink-0 ${showQR ? "bg-violet-50 border-violet-300 text-violet-700" : ""}`}
        >
          <QrCode size={13} /> QR
        </button>
      </div>

      {/* QR Code panel */}
      {showQR && (() => {
        const formUrl = typeof window !== "undefined"
          ? `${window.location.origin}/p/${selectedForm.id}`
          : `https://mulbox.vercel.app/p/${selectedForm.id}`;
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(formUrl)}`;
        return (
          <div className="mt-3 flex items-center gap-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <img src={qrSrc} alt="QR Code" width={110} height={110} className="rounded-xl border border-slate-200 bg-white shrink-0" />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-900">Kod QR formularza</p>
              <p className="text-xs text-slate-500">Skanuj telefonem, by otworzyć formularz. Udostępnij na materiałach reklamowych.</p>
              <div className="flex gap-2 mt-1">
                <a
                  href={qrSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download size={13} /> Pobierz QR
                </a>
                <button onClick={() => setShowQR(false)} className="btn-ghost text-xs py-1.5 px-2.5 text-slate-500">
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Panel szybkich klocków */}
        <QuickAddFieldsPanel onAddField={addPreset} />

        {/* Edytor + HTML/AI */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Edytor pól */}
          <div className="card">
            <label className="label">Nazwa formularza</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />

            <div className="mt-6 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Pola ({fields.length})</h3>
              <button
                onClick={() => setFields((prev) => [...prev, { id: crypto.randomUUID(), type: "text", label: "", name: `pole_${prev.length + 1}`, placeholder: "", required: false }])}
                className="btn-secondary text-xs py-1.5 px-2.5 border-dashed text-violet-700 border-violet-300"
              >
                <Plus size={13} /> Własne pole
              </button>
            </div>

            <ul className="mt-2 space-y-2">
              {fields.map((f) => (
                <li key={f.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={f.type}
                      onChange={(e) => updateField(f.id, { type: e.target.value as FormField["type"] })}
                      className="input py-1 text-xs font-semibold uppercase text-brand-700 w-auto pr-6"
                    >
                      <option value="text">TEXT</option>
                      <option value="email">EMAIL</option>
                      <option value="tel">TEL</option>
                      <option value="number">NUMBER</option>
                      <option value="date">DATE</option>
                      <option value="textarea">TEXTAREA</option>
                      <option value="file">FILE</option>
                      <option value="select">SELECT</option>
                      <option value="checkbox">CHECKBOX</option>
                    </select>
                    <button onClick={() => removeField(f.id)} className="text-rose-600 hover:bg-rose-50 rounded p-1"><Trash2 size={14} /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} placeholder="Etykieta pola" className="input py-2 text-sm" />
                    <input value={f.name} onChange={(e) => updateField(f.id, { name: e.target.value })} placeholder="name (HTML)" className="input py-2 text-sm font-mono" />
                  </div>
                  <input
                    value={f.placeholder ?? ""}
                    onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                    placeholder={f.type === "checkbox" ? "Treść checkboxa (tekst zgody)" : "Placeholder / podpowiedź"}
                    className="input py-2 text-sm mt-2"
                  />
                  {f.type === "select" && (
                    <textarea
                      value={(f.options ?? []).join("\n")}
                      onChange={(e) => updateField(f.id, { options: e.target.value.split("\n") })}
                      placeholder={"Jedna opcja na linię:\nOpcja 1\nOpcja 2\nOpcja 3"}
                      rows={3}
                      className="input py-2 text-xs mt-2 resize-none font-mono"
                    />
                  )}
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} /> Pole wymagane
                  </label>
                </li>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">
                  Brak pól – dodaj klocek z panelu bocznego lub kliknij „+ Własne pole".
                </p>
              )}
            </ul>
          </div>

          {/* Kod HTML lub Asystent AI */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setRightPanel("html")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    rightPanel === "html" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Copy size={12} /> Kod HTML
                </button>
                <button
                  onClick={() => setRightPanel("ai")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    rightPanel === "ai" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles size={12} /> Asystent AI
                  {plan === "free" && <span className="ml-1 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">Premium</span>}
                </button>
              </div>
              {rightPanel === "html" && (
                <button onClick={copyHtml} className="btn-secondary text-sm py-2 px-3">
                  {copied ? <><Check size={14} /> Skopiowano</> : <><Copy size={14} /> Kopiuj</>}
                </button>
              )}
            </div>
            {rightPanel === "html" ? (
              <>
                <pre className="mt-3 flex-1 overflow-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono leading-relaxed">
                  <code>{html}</code>
                </pre>
                <p className="mt-3 text-xs text-slate-500">Wklej kod w WordPress (blok "Własny HTML"), Elementor, Webflow lub plain HTML.</p>
              </>
            ) : (
              <div className="mt-3 flex-1">
                <AIPanel plan={plan} onAddField={addAiField} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
