"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Power, Shield } from "lucide-react";
import type { FormRecord, Profile } from "@/lib/types";

interface Props { forms: FormRecord[]; profiles: Profile[] }

/** Tabela wszystkich formularzy z możliwością globalnego wyłączenia. */
export function AdminTable({ forms, profiles }: Props) {
  const t = useTranslations("Admin");
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
    if (!confirm(`${current ? t("disable") : t("enable")}?`)) return;
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
        <h2 className="text-lg font-semibold text-slate-900">{t("tableTitle")}</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="input pl-9 w-64" />
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
              <th className="px-3 py-2.5">{t("colForm")}</th>
              <th className="px-3 py-2.5">{t("colOwner")}</th>
              <th className="px-3 py-2.5">{t("colPlan")}</th>
              <th className="px-3 py-2.5">{t("colStatus")}</th>
              <th className="px-3 py-2.5">{t("colActions")}</th>
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
                      {f.is_active ? t("formActive") : t("formInactive")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => toggle(f.id, f.is_active)} className="btn-secondary text-xs py-1.5 px-2.5">
                      <Power size={14} /> {f.is_active ? t("disable") : t("enable")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">{t("noResults")}</p>}
      </div>
    </section>
  );
}
