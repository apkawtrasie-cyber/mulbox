"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, ToggleRight, ToggleLeft, Trash2, ExternalLink } from "lucide-react";
import type { FormRecord } from "@/lib/types";

interface Props {
  forms: FormRecord[];
  onSelect: (id: string) => void;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

/** Moduł 1: Lista formularzy – widok kafelkowy. */
export function FormsList({ forms, onSelect }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createForm() {
    setCreating(true);
    try {
      const res = await fetch("/api/forms", { method: "POST" });
      if (!res.ok) throw new Error("Nie udało się utworzyć formularza.");
      router.refresh();
    } finally {
      setCreating(false);
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
    if (!confirm("Na pewno usunąć formularz wraz z wiadomościami?")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Twoje formularze</h1>
          <p className="text-sm text-slate-500">Zarządzaj wszystkimi swoimi formularzami w jednym miejscu.</p>
        </div>
        <button onClick={createForm} disabled={creating} className="btn-primary disabled:opacity-60">
          <Plus size={16} /> Nowy formularz
        </button>
      </header>

      {forms.length === 0 ? (
        <div className="card mt-6 text-center py-16">
          <FileText className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 font-semibold text-slate-900">Nie masz jeszcze żadnego formularza</h2>
          <p className="mt-1 text-sm text-slate-500">Kliknij "Nowy formularz", aby zacząć.</p>
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
                  {f.is_active ? "Aktywny" : "Wyłączony"}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{(f.config?.fields ?? []).length} pól w formularzu</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => onSelect(f.id)} className="btn-secondary text-sm py-2 px-3">Edytuj</button>
                <button onClick={() => toggleActive(f.id, !f.is_active)} className="btn-ghost text-sm py-2 px-3">
                  {f.is_active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                  {f.is_active ? "Wyłącz" : "Włącz"}
                </button>
                <a href={`${APP_URL}/p/${f.id}`} target="_blank" rel="noreferrer" className="btn-ghost text-sm py-2 px-3">
                  <ExternalLink size={16} /> Podgląd
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
