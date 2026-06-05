"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, ChevronDown, ChevronRight,
  User, Briefcase, Paperclip, Building2, Star, ShieldCheck,
  Type, Mail, Phone, AlignLeft, Hash, CalendarDays, FileImage, List, CheckSquare,
} from "lucide-react";
import type { FormField } from "@/lib/types";

type QuickField = Omit<FormField, "id">;

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  fields: QuickField[];
}

const FIELD_ICON: Record<string, React.ElementType> = {
  text: Type, email: Mail, tel: Phone, textarea: AlignLeft,
  number: Hash, date: CalendarDays, file: FileImage, select: List, checkbox: CheckSquare,
};

const CATEGORIES: Category[] = [
  {
    id: "contact",
    label: "Dane podstawowe",
    icon: User,
    colorClass: "bg-blue-50 text-blue-600",
    fields: [
      { type: "text",  label: "Imię i nazwisko",    name: "name",    placeholder: "np. Jan Kowalski",                required: true },
      { type: "email", label: "Adres e-mail",        name: "email",   placeholder: "np. nazwa@domena.pl",             required: true },
      { type: "text",  label: "Numer telefonu",      name: "phone",   placeholder: "np. +48 123 456 789" },
      { type: "text",  label: "Nazwa firmy",         name: "company", placeholder: "np. Moja Firma Sp. z o.o." },
      { type: "text",  label: "Lokalizacja / Adres", name: "address", placeholder: "np. Warszawa, ul. Wiejska 4" },
    ],
  },
  {
    id: "brief",
    label: "Szczegóły projektu",
    icon: Briefcase,
    colorClass: "bg-violet-50 text-violet-600",
    fields: [
      { type: "textarea", label: "Opis projektu / Wiadomość", name: "description",  placeholder: "Opisz krótko swoje wymagania, oczekiwania lub zakres prac...", required: true },
      { type: "text",     label: "Planowany budżet",          name: "budget",       placeholder: "np. Do 5000 PLN / CHF" },
      { type: "text",     label: "Termin realizacji",         name: "deadline",     placeholder: "np. Jak najszybciej / Połowa przyszłego miesiąca" },
      { type: "number",   label: "Przybliżony metraż (m²)",   name: "area_m2",      placeholder: "np. 120" },
      { type: "text",     label: "Link do strony WWW",        name: "website",      placeholder: "https://twojadomena.pl" },
      { type: "text",     label: "Profile Social Media",      name: "social_media", placeholder: "np. Link do Instagrama, TikToka lub LinkedIna" },
    ],
  },
  {
    id: "media",
    label: "Pliki i multimedia",
    icon: Paperclip,
    colorClass: "bg-teal-50 text-teal-600",
    fields: [
      { type: "file", label: "Załączniki / Zdjęcia", name: "attachments", placeholder: "Przeciągnij pliki lub kliknij tutaj, aby dodać zdjęcia (Max 5MB)" },
    ],
  },
  {
    id: "business",
    label: "Biznes i B2B",
    icon: Building2,
    colorClass: "bg-amber-50 text-amber-600",
    fields: [
      { type: "text",     label: "Numer NIP / VAT ID", name: "nip",          placeholder: "np. PL1234567890" },
      { type: "textarea", label: "Dane do faktury",    name: "invoice_data", placeholder: "Wpisz pełną nazwę firmy, adres rejestrowy oraz NIP..." },
      { type: "select",   label: "Typ klienta",        name: "client_type",  placeholder: "Wybierz typ", required: true, options: ["Osoba prywatna", "Firma"] },
      { type: "number",   label: "Ilość / Liczba sztuk", name: "quantity",   placeholder: "Wpisz lub wybierz ilość..." },
    ],
  },
  {
    id: "survey",
    label: "Feedback i opinie",
    icon: Star,
    colorClass: "bg-orange-50 text-orange-600",
    fields: [
      { type: "select",   label: "Ocena usługi (1–10)", name: "rating",      placeholder: "Wybierz ocenę", required: true, options: ["1","2","3","4","5","6","7","8","9","10"] },
      { type: "select",   label: "Skąd o nas wiesz?",   name: "source",      placeholder: "Wybierz źródło", options: ["Z polecenia","Google","Social Media","Inne"] },
      { type: "textarea", label: "Co możemy poprawić?", name: "improvement", placeholder: "Twoje uwagi i sugestie, które pomogą nam ulepszyć usługi..." },
    ],
  },
  {
    id: "legal",
    label: "Zgody prawne",
    icon: ShieldCheck,
    colorClass: "bg-green-50 text-green-600",
    fields: [
      { type: "checkbox", label: "Zgoda RODO / Prywatność", name: "rodo_consent",  placeholder: "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi tego zapytania zgodnie z Polityką Prywatności.", required: true },
      { type: "checkbox", label: "Akceptacja Regulaminu",   name: "terms_consent", placeholder: "Akceptuję regulamin świadczenia usług i warunki zamówienia.", required: true },
    ],
  },
];

interface Props {
  onAddField: (field: QuickField) => void;
}

export function QuickAddFieldsPanel({ onAddField }: Props) {
  const t = useTranslations("Dashboard");
  const [open, setOpen] = useState<Set<string>>(new Set(["contact"]));
  const catLabels: Record<string, string> = {
    contact: t("quickCatContact"),
    brief: t("quickCatBrief"),
    media: t("quickCatMedia"),
    business: t("quickCatBusiness"),
    survey: t("quickCatSurvey"),
    legal: t("quickCatLegal"),
  };

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <aside className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <p className="px-2 pb-1.5 pt-0.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {t("quickPanelTitle")}
      </p>

      {CATEGORIES.map((cat) => {
        const CatIcon = cat.icon;
        const isOpen = open.has(cat.id);
        return (
          <div key={cat.id}>
            <button
              type="button"
              onClick={() => toggle(cat.id)}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${cat.colorClass}`}>
                  <CatIcon size={14} />
                </span>
                <span className="truncate text-sm font-semibold text-slate-700">{catLabels[cat.id] ?? cat.label}</span>
              </div>
              {isOpen
                ? <ChevronDown size={15} className="shrink-0 text-slate-400" />
                : <ChevronRight size={15} className="shrink-0 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="mb-1 ml-1 flex flex-col gap-0.5 pl-1">
                {cat.fields.map((f) => {
                  const FIcon = FIELD_ICON[f.type] ?? Type;
                  return (
                    <button
                      key={`${cat.id}-${f.name}`}
                      type="button"
                      title={f.placeholder}
                      onClick={() => onAddField(f)}
                      className="group flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <FIcon size={13} className="shrink-0 text-slate-400" />
                      <span className="flex-1 truncate text-sm text-slate-600 group-hover:text-slate-900">
                        {f.label}
                      </span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400 transition-colors group-hover:bg-violet-100 group-hover:text-violet-700">
                        <Plus size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
