"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ClipboardList, Plus, ExternalLink, Pencil } from "lucide-react";
import type { FormRecord, PlanType } from "@/lib/types";

interface Props {
  briefForms: FormRecord[];
  plan: PlanType;
  onEditForm: (id: string) => void;
}

const TEMPLATES = [
  {
    id: "wycena",
    label: "Brief / Wycena",
    icon: FileText,
    description: "Klient opisuje projekt, budżet i termin. Idealny do zbierania zapytań ofertowych.",
    fields: [
      "Imię i nazwisko", "Email", "Telefon", "Nazwa firmy",
      "Rodzaj usługi", "Opis projektu", "Budżet", "Termin realizacji",
      "Zdjęcia / materiały", "Dodatkowe informacje",
    ],
  },
  {
    id: "ankieta",
    label: "Ankieta satysfakcji",
    icon: ClipboardList,
    description: "Zbierz opinie klientów po wykonaniu usługi. Sprawdź co możesz poprawić.",
    fields: [
      "Imię i nazwisko", "Email", "Skąd nas znasz?",
      "Ocena (1–10)", "Co się podobało?", "Co poprawić?",
      "Czy polecisz nas?", "Dodatkowe uwagi",
    ],
  },
] as const;

export function BriefBuilder({ briefForms, onEditForm }: Props) {
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
        setError("Nie udało się utworzyć formularza. Spróbuj ponownie.");
      }
    } catch {
      setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
    } finally {
      setCreating(null);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Brief / Ankieta</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pełnoekranowe formularze do zbierania briefów i wycen. Automatycznie ustawiają szeroki,
          dwukolumnowy układ na stronie <code className="font-mono">/p/[id]</code>.
        </p>
      </header>

      {briefForms.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Twoje brief-formularze</h2>
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
                    <ExternalLink size={13} /> Otwórz
                  </a>
                  <button
                    onClick={() => onEditForm(f.id)}
                    className="btn-primary text-xs py-1.5 px-2.5"
                  >
                    <Pencil size={13} /> Edytuj
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Utwórz nowy z szablonu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="card flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-semibold text-slate-900">{tpl.label}</h3>
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
                    ? "Tworzę formularz…"
                    : <><Plus size={15} /> Utwórz z szablonu</>}
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
        <strong>Jak to działa?</strong> Po kliknięciu „Utwórz z szablonu" formularz zostanie
        automatycznie skonfigurowany z szerokim layoutem (2 kolumny na desktopie) i gotowymi polami.
        Możesz go dowolnie edytować w zakładce <strong>Kreator</strong>.
      </div>
    </section>
  );
}
