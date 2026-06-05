"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Download, Lock, Mail } from "lucide-react";
import type { FormRecord, PlanType, SubmissionRecord } from "@/lib/types";
import { downloadCSV, submissionsToCSV, submissionsToMailingCSV } from "@/lib/csv";

interface Props {
  forms: FormRecord[];
  submissions: SubmissionRecord[];
  plan: PlanType;
}

/** Moduł 3: Skrzynka odbiorcza – dynamiczne kolumny z JSONB + filtr po sender_email + CSV (Premium). */
export function Inbox({ forms, submissions, plan }: Props) {
  const t = useTranslations("Dashboard");
  const [formId, setFormId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (formId !== "all" && s.form_id !== formId) return false;
      if (query && !(s.sender_email ?? "").toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [submissions, formId, query]);

  // Dynamiczne wykrycie wszystkich kluczy z danych (JSONB)
  const dataKeys = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((s) => Object.keys(s.data ?? {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [filtered]);

  const isPremium = plan !== "free";

  function exportCSV() {
    if (!isPremium) return;
    const csv = submissionsToCSV(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCSV(`mulbox-inbox-${stamp}.csv`, csv);
  }

  function exportMailing() {
    if (!isPremium) return;
    const csv = submissionsToMailingCSV(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCSV(`mulbox-mailing-${stamp}.csv`, csv);
  }

  return (
    <section>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("inboxTitle")}</h1>
          <p className="text-sm text-slate-500">{t("inboxSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={!isPremium || filtered.length === 0}
            className={`${isPremium ? "btn-primary" : "btn-secondary"} disabled:opacity-60`}
            title={isPremium ? "Eksportuj wszystkie zgłoszenia jako CSV" : "Funkcja Premium"}
          >
            {isPremium ? <Download size={16} /> : <Lock size={16} />}
            {isPremium ? t("exportCsv") : t("exportCsvPremium")}
          </button>
          <button
            onClick={exportMailing}
            disabled={!isPremium || filtered.length === 0}
            className={`${isPremium ? "btn-secondary" : "btn-secondary"} disabled:opacity-60`}
            title={isPremium ? "Unikalna lista mailowa (email, imię, telefon)" : "Funkcja Premium"}
          >
            {isPremium ? <Mail size={16} /> : <Lock size={16} />}
            {isPremium ? t("mailingList") : t("mailingListPremium")}
          </button>
        </div>
      </header>

      <div className="card mt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={formId} onChange={(e) => setFormId(e.target.value)} className="input sm:max-w-xs">
            <option value="all">{t("allForms")}</option>
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchByEmail")}
              className="input pl-9"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto -mx-2 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                <th className="px-3 py-2.5">{t("colDate")}</th>
                <th className="px-3 py-2.5">{t("colSender")}</th>
                {dataKeys.map((k) => <th key={k} className="px-3 py-2.5">{k}</th>)}
                <th className="px-3 py-2.5">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-3 font-medium text-slate-900 whitespace-nowrap">{s.sender_email ?? "—"}</td>
                  {dataKeys.map((k) => (
                    <td key={k} className="px-3 py-3 text-slate-700 max-w-xs truncate" title={String((s.data as Record<string, unknown>)[k] ?? "")}>
                      {String((s.data as Record<string, unknown>)[k] ?? "")}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    {s.is_spam
                      ? <span className="rounded-full bg-rose-50 text-rose-700 text-xs px-2 py-0.5">{t("statusSpam")}</span>
                      : <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5">{t("statusOk")}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Mail className="mx-auto mb-2" size={32} />
              <p className="text-sm">{t("inboxEmpty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
