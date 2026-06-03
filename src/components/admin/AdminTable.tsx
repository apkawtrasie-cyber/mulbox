"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Power, Shield } from "lucide-react";
import type { FormRecord, Profile } from "@/lib/types";

interface Props { forms: FormRecord[]; profiles: Profile[] }

/** Tabela wszystkich formularzy z możliwością globalnego wyłączenia. */
export function AdminTable({ forms, profiles }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const profilesById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return forms;
    return forms.filter((f) => {
      const owner = profilesById.get(f.user_id);
      return f.name.toLowerCase().includes(q)
        || f.id.toLowerCase().includes(q)
        || (owner?.email ?? "").toLowerCase().includes(q);
    });
  }, [forms, query, profilesById]);

  async function toggle(id: string, current: boolean) {
    const action = current ? "wyłączyć" : "włączyć";
    if (!confirm(`Na pewno ${action} ten formularz?`)) return;
    await fetch(`/api/admin/forms/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    router.refresh();
  }

  async function changePlan(userId: string, plan: string) {
    await fetch(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_type: plan }),
    });
    router.refresh();
  }

  return (
    <section className="card">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Formularze i użytkownicy</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj…" className="input pl-9 w-64" />
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
              <th className="px-3 py-2.5">Formularz</th>
              <th className="px-3 py-2.5">Właściciel</th>
              <th className="px-3 py-2.5">Plan</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const owner = profilesById.get(f.user_id);
              return (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{f.id}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <p>{owner?.email ?? "—"}</p>
                    {owner?.role === "admin" && (
                      <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-amber-700"><Shield size={12} /> admin</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {owner ? (
                      <select
                        defaultValue={owner.plan_type}
                        onChange={(e) => changePlan(owner.id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="free">Free</option>
                        <option value="personal">Personal</option>
                        <option value="business">Business</option>
                      </select>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${f.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {f.is_active ? "Aktywny" : "Wyłączony"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => toggle(f.id, f.is_active)} className="btn-secondary text-xs py-1.5 px-2.5">
                      <Power size={14} /> {f.is_active ? "Wyłącz" : "Włącz"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">Brak wyników.</p>}
      </div>
    </section>
  );
}
