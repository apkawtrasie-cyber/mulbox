"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, FileText, ToggleRight, ToggleLeft, Trash2, ExternalLink, AlignLeft, LayoutTemplate, X } from "lucide-react";
import type { FormRecord } from "@/lib/types";

interface Props {
  forms: FormRecord[];
  onSelect: (id: string) => void;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

/** Moduł 1: Lista formularzy – widok kafelkowy. */
export function FormsList({ forms, onSelect }: Props) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  async function createForm(category: "standard" | "wide") {
    setCreating(category);
    setShowPicker(false);
    try {
      if (category === "wide") {
        await fetch("/api/forms/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: "podstawowy" }),
        });
      } else {
        await fetch("/api/forms", { method: "POST" });
      }
      router.refresh();
    } finally {
      setCreating(null);
    }
  }

  async function toggleActive(id: string, value: boolean) {
    await fetch(`/api/forms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: value }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("formsTitle")}</h1>
          <p className="text-sm text-slate-500">{t("formsSubtitle")}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowPicker((v) => !v)}
            disabled={!!creating}
            className="btn-primary disabled:opacity-60"
          >
            <Plus size={16} /> {creating ? t("creating") : t("newForm")}
          </button>
          {showPicker && (
            <div className="absolute right-0 top-full mt-2 z-20 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl p-3 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("chooseFormType")}</p>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
              </div>
              <button
                onClick={() => createForm("standard")}
                className="w-full flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-violet-400 hover:bg-violet-50/40 transition-colors text-left"
              >
                <AlignLeft size={18} className="mt-0.5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("contactForm")}</p>
                  <p className="text-xs text-slate-500">{t("contactFormDesc")}</p>
                </div>
              </button>
              <button
                onClick={() => createForm("wide")}
                className="w-full flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-violet-400 hover:bg-violet-50/40 transition-colors text-left"
              >
                <LayoutTemplate size={18} className="mt-0.5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("briefForm")}</p>
                  <p className="text-xs text-slate-500">{t("briefFormDesc")}</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {forms.length === 0 ? (
        <div className="card mt-6 text-center py-16">
          <FileText className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 font-semibold text-slate-900">{t("emptyForms")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("emptyFormsHint")}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {forms.map((f) => (
            <article key={f.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{f.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 font-mono break-all">ID: {f.id}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${f.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {f.is_active ? t("formActive") : t("formInactive")}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{t("fieldCount", { count: (f.config?.fields ?? []).length })}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => onSelect(f.id)} className="btn-secondary text-sm py-2 px-3">{t("edit")}</button>
                <button onClick={() => toggleActive(f.id, !f.is_active)} className="btn-ghost text-sm py-2 px-3">
                  {f.is_active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                  {f.is_active ? t("disable") : t("enable")}
                </button>
                <a href={`${APP_URL}/p/${f.id}`} target="_blank" rel="noreferrer" className="btn-ghost text-sm py-2 px-3">
                  <ExternalLink size={16} /> {t("preview")}
                </a>
                <button onClick={() => remove(f.id)} className="btn-ghost text-sm py-2 px-3 text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
