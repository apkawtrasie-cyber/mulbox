"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface PromoCode {
  id: string;
  code: string;
  plan_type: string;
  duration_days: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export function PromoCodeManager() {
  const t = useTranslations("Admin");
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ plan_type: "business", duration_days: 7, max_uses: 1, count: 1 });
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/promo");
    const json = await res.json() as { codes: PromoCode[] };
    setCodes(json.codes ?? []);
  }

  useEffect(() => { load(); }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNewCodes([]);
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json() as { codes?: string[] };
    setNewCodes(json.codes ?? []);
    setLoading(false);
    load();
  }

  async function deleteCode(id: string, code: string) {
    if (!window.confirm(t("deleteCodeConfirm", { code }))) return;
    await fetch("/api/admin/promo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Generator */}
      <form onSubmit={generate} className="card">
        <h3 className="font-semibold text-slate-900 mb-4">{t("promoGenTitle")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="label">{t("promoPlan")}</label>
            <select value={form.plan_type} onChange={(e) => setForm((s) => ({ ...s, plan_type: e.target.value }))} className="input">
              <option value="business">Business</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="label">{t("promoDays")}</label>
            <input type="number" min={1} max={365} value={form.duration_days}
              onChange={(e) => setForm((s) => ({ ...s, duration_days: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">{t("promoMaxUses")}</label>
            <input type="number" min={1} max={1000} value={form.max_uses}
              onChange={(e) => setForm((s) => ({ ...s, max_uses: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">{t("promoCount")}</label>
            <input type="number" min={1} max={50} value={form.count}
              onChange={(e) => setForm((s) => ({ ...s, count: Number(e.target.value) }))} className="input" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-4 disabled:opacity-60">
          <Plus size={16} /> {loading ? t("promoGenerating") : t("promoGenBtn")}
        </button>

        {newCodes.length > 0 && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">{t("promoGenerated")}</p>
            <div className="flex flex-wrap gap-2">
              {newCodes.map((c) => (
                <button key={c} type="button" onClick={() => copy(c)}
                  className="flex items-center gap-1.5 rounded-lg bg-white border border-green-300 px-3 py-1.5 font-mono text-sm text-green-800 hover:bg-green-100">
                  {copied === c ? <Check size={13} /> : <Copy size={13} />} {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Lista kodów */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-slate-900 mb-4">{t("promoAllCodes", { count: codes.length })}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
              <th className="pb-2 pr-4">{t("colCode")}</th>
              <th className="pb-2 pr-4">{t("colPlan")}</th>
              <th className="pb-2 pr-4">{t("colDays")}</th>
              <th className="pb-2 pr-4">{t("colUses")}</th>
              <th className="pb-2 pr-4">{t("colStatus")}</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2 pr-4 font-mono">
                  <button onClick={() => copy(c.code)} className="flex items-center gap-1 hover:text-brand-700">
                    {copied === c.code ? <Check size={12} /> : <Copy size={12} />} {c.code}
                  </button>
                </td>
                <td className="py-2 pr-4 capitalize">{c.plan_type}</td>
                <td className="py-2 pr-4">{c.duration_days}d</td>
                <td className="py-2 pr-4">{c.used_count}/{c.max_uses}</td>
                <td className="py-2 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.is_active && c.used_count < c.max_uses ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.is_active && c.used_count < c.max_uses ? t("promoActive") : t("promoExhausted")}
                  </span>
                </td>
                <td className="py-2">
                  <button onClick={() => deleteCode(c.id, c.code)} className="text-rose-400 hover:text-rose-600 p-1 rounded" title={t("deleteCode")}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-slate-400">{t("noCodes")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
