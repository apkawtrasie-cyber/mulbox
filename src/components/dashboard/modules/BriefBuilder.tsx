"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, ClipboardList, Plus, ExternalLink, Pencil, LayoutTemplate } from "lucide-react";
import type { FormRecord, PlanType } from "@/lib/types";

interface Props {
  briefForms: FormRecord[];
  plan: PlanType;
  onEditForm: (id: string) => void;
}

interface Template {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  fields: string[];
  isDefault: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "podstawowy",
    label: "Brief podstawowy",
    icon: LayoutTemplate,
    description: "Uniwersalny szablon startowy: dane kontaktowe, adres, wiadomość i zdjęcia. Resztę pól dopisujesz samodzielnie w Kreatorze.",
    fields: ["Imię i nazwisko", "Nazwa firmy", "Adres", "E-mail", "Telefon", "Wiadomość", "Załączniki / zdjęcia"],
    isDefault: true,
  },
  {
    id: "wycena",
    label: "Brief / Wycena",
    icon: FileText,
    description: "Klient opisuje projekt, budżet i termin. Idealny do zbierania zapytań ofertowych.",
    fields: ["Imię i nazwisko", "Email", "Telefon", "Nazwa firmy", "Rodzaj usługi", "Opis projektu", "Budżet", "Termin realizacji", "Zdjęcia / materiały", "Dodatkowe informacje"],
    isDefault: false,
  },
  {
    id: "ankieta",
    label: "Ankieta satysfakcji",
    icon: ClipboardList,
    description: "Zbierz opinie klientów po wykonaniu usługi. Sprawdź co możesz poprawić.",
    fields: ["Imię i nazwisko", "Email", "Skąd nas znasz?", "Ocena (1–10)", "Co się podobało?", "Co poprawić?", "Czy polecisz nas?", "Dodatkowe uwagi"],
    isDefault: false,
  },
];

export function BriefBuilder({ briefForms, onEditForm }: Props) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createBrief(templateId: string) {
    setCreating(templateId);
    setError(null);
    try {
      const res = await fetch("/api/forms/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateId }),
      });
      if (res.ok) {
        const { form } = await res.json();
        router.refresh();
        if (form?.id) onEditForm(form.id);
      } else {
        setError(t("briefErrorCreate"));
      }
    } catch {
      setError(t("briefErrorNetwork"));
    } finally {
      setCreating(null);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{t("briefTitle")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("briefSubtitle")}</p>
      </header>

      {briefForms.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">{t("yourBriefs")}</h2>
          <ul className="space-y-2">
            {briefForms.map((f) => (
              <li
                key={f.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{f.name}</p>
                  <code className="text-xs text-slate-400 font-mono break-all">/p/{f.id}</code>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={`/p/${f.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-1.5 px-2.5"
                  >
                    <ExternalLink size={13} /> {t("open")}
                  </a>
                  <button
                    onClick={() => onEditForm(f.id)}
                    className="btn-primary text-xs py-1.5 px-2.5"
                  >
                    <Pencil size={13} /> {t("edit")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">{t("createFromTemplate")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="card flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    tpl.isDefault ? "bg-violet-100 text-violet-700" : "bg-brand-50 text-brand-700"
                  }`}>
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900 leading-tight">{tpl.label}</h3>
                    {tpl.isDefault && (
                      <span className="inline-block mt-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold px-2 py-0.5">{t("defaultBadge")}</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-500">{tpl.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {tpl.fields.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => createBrief(tpl.id)}
                  disabled={!!creating}
                  className="btn-primary mt-auto disabled:opacity-60"
                >
                  {creating === tpl.id
                    ? t("creatingForm")
                    : <><Plus size={15} /> {t("createFromTemplateBtn")}</>}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
        <strong>{t("howItWorks")}</strong> {t("howItWorksText")}
      </div>
    </section>
  );
}
