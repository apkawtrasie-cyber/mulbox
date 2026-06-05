"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>(selectedForm?.config?.fields ?? []);
  const [name, setName] = useState(selectedForm?.name ?? "");
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [rightPanel, setRightPanel] = useState<"html" | "ai">("html");

  useEffect(() => {
    setFields(selectedForm?.config?.fields ?? []);
    setName(selectedForm?.name ?? "");
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
          {forms.length === 0 ? t("noFormYet") : t("noFormSelected")}
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
            <Plus size={16} /> {t("createFirst")}
          </button>
        ) : (
          <select
            onChange={(e) => onSelectForm(e.target.value)}
            defaultValue=""
            className="input mt-5 max-w-xs mx-auto"
          >
            <option value="" disabled>{t("selectFormPlaceholder")}</option>
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
          <h1 className="text-2xl font-bold text-slate-900">{t("builderTitle")}</h1>
          <p className="text-sm text-slate-500">{t("builderSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedForm.id} onChange={(e) => onSelectForm(e.target.value)} className="input max-w-xs">
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {saving ? t("saving") : t("save")}
          </button>
        </div>
      </header>

      {/* Link do publicznej strony formularza – always visible, 2-row on mobile */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 mb-2">
          <span className="text-sm font-medium text-slate-500 shrink-0">{t("publicLink")}</span>
          <code className="flex-1 min-w-0 truncate text-sm font-mono text-slate-700">
            {typeof window !== "undefined" ? `${window.location.origin}/p/${selectedForm.id}` : `/p/${selectedForm.id}`}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyUrl}
            className="btn-secondary py-2 px-3 text-sm flex-1 sm:flex-none justify-center"
          >
            {copiedUrl ? <><Check size={15} /> {t("copied")}</> : <><Copy size={15} /> {t("copy")}</>}
          </button>
          <a
            href={`/p/${selectedForm.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2 px-3 text-sm flex-1 sm:flex-none justify-center"
          >
            <ExternalLink size={15} /> {t("open")}
          </a>
          <button
            onClick={() => setShowQR((v) => !v)}
            className={`btn-secondary py-2 px-3 text-sm flex-1 sm:flex-none justify-center ${showQR ? "bg-violet-50 border-violet-300 text-violet-700" : ""}`}
          >
            <QrCode size={15} /> QR
          </button>
        </div>
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
              <p className="text-sm font-semibold text-slate-900">{t("qrTitle")}</p>
              <p className="text-xs text-slate-500">{t("qrDesc")}</p>
              <div className="flex gap-2 mt-1">
                <a
                  href={qrSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download size={13} /> {t("downloadQr")}
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
        {/* Edytor + HTML/AI – first on mobile */}
        <div className="order-1 lg:order-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Edytor pól */}
          <div className="card">
            <label className="label">{t("formName")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />

            <div className="mt-6 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{t("fieldsCount", { count: fields.length })}</h3>
              <button
                onClick={() => setFields((prev) => [...prev, { id: crypto.randomUUID(), type: "text", label: "", name: `pole_${prev.length + 1}`, placeholder: "", required: false }])}
                className="btn-secondary text-sm py-2 px-3 border-dashed text-violet-700 border-violet-300"
              >
                <Plus size={15} /> {t("addCustomField")}
              </button>
            </div>

            <ul className="mt-2 space-y-2">
              {fields.map((f) => (
                <li key={f.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={f.type}
                      onChange={(e) => updateField(f.id, { type: e.target.value as FormField["type"] })}
                      className="input py-1 text-sm font-semibold uppercase text-brand-700 w-auto pr-6"
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
                    <button onClick={() => removeField(f.id)} className="text-rose-600 hover:bg-rose-50 rounded p-1.5"><Trash2 size={16} /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} placeholder={t("fieldLabelAttr")} className="input py-2 text-sm" />
                    <input value={f.name} onChange={(e) => updateField(f.id, { name: e.target.value })} placeholder={t("fieldNameAttr")} className="input py-2 text-sm font-mono" />
                  </div>
                  <input
                    value={f.placeholder ?? ""}
                    onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                    placeholder={f.type === "checkbox" ? t("checkboxPlaceholder") : t("fieldPlaceholderAttr")}
                    className="input py-2 text-sm mt-2"
                  />
                  {f.type === "select" && (
                    <textarea
                      value={(f.options ?? []).join("\n")}
                      onChange={(e) => updateField(f.id, { options: e.target.value.split("\n") })}
                      placeholder={t("selectOptionsPlaceholder")}
                      rows={3}
                      className="input py-2 text-sm mt-2 resize-none font-mono"
                    />
                  )}
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} /> {t("required")}
                  </label>
                </li>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">{t("noFields")}</p>
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
                  <Copy size={12} /> {t("htmlCode")}
                </button>
                <button
                  onClick={() => setRightPanel("ai")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    rightPanel === "ai" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles size={12} /> {t("aiAssistant")}
                  {plan === "free" && <span className="ml-1 rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">{t("premiumBadge")}</span>}
                </button>
              </div>
              {rightPanel === "html" && (
                <button onClick={copyHtml} className="btn-secondary text-sm py-2 px-3">
                  {copied ? <><Check size={14} /> {t("copied")}</> : <><Copy size={14} /> {t("copy")}</>}
                </button>
              )}
            </div>
            {rightPanel === "html" ? (
              <>
                <pre className="mt-3 flex-1 overflow-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono leading-relaxed">
                  <code>{html}</code>
                </pre>
                <p className="mt-3 text-xs text-slate-500">{t("embedHint")}</p>
              </>
            ) : (
              <div className="mt-3 flex-1">
                <AIPanel plan={plan} onAddField={addAiField} />
              </div>
            )}
          </div>
        </div>

        {/* Panel szybkich klocków – after editor on mobile, left sidebar on desktop */}
        <div className="order-2 lg:order-1">
          <QuickAddFieldsPanel onAddField={addPreset} />
        </div>
      </div>
    </section>
  );
}
