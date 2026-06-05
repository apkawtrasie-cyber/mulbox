import type { Profile } from "@/lib/types";
import { CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  profiles: Profile[];
}

/** Lista aktywnych subskrypcji (Personal/Business). Tylko widoczna dla admina. */
export async function SubscriptionsList({ profiles }: Props) {
  const t = await getTranslations("Admin");
  const subscribers = profiles.filter(
    (p) => p.plan_type === "personal" || p.plan_type === "business"
  );

  if (subscribers.length === 0) {
    return (
      <section className="card">
        <header className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t("subsTitle")}</h2>
        </header>
        <p className="text-sm text-slate-500">{t("subsEmpty")}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t("subsTitle")}</h2>
        </div>
        <span className="text-xs font-semibold rounded-full bg-violet-100 text-violet-700 px-2.5 py-1">
          {subscribers.length}
        </span>
      </header>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="text-left py-2 pr-3">{t("colClient")}</th>
              <th className="text-left py-2 pr-3">{t("colPlan")}</th>
              <th className="text-left py-2 pr-3">{t("colStripeId")}</th>
              <th className="text-left py-2 pr-3">{t("colExpiry")}</th>
              <th className="text-left py-2 pr-3">{t("colCreated")}</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 pr-3">
                  <div className="font-medium text-slate-900">{p.full_name || "—"}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`text-xs font-bold uppercase rounded-full px-2 py-0.5 ${
                      p.plan_type === "business"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-violet-100 text-violet-800"
                    }`}
                  >
                    {p.plan_type}
                  </span>
                </td>
                <td className="py-3 pr-3 font-mono text-xs text-slate-600">
                  {p.stripe_customer_id ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${p.stripe_customer_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      {p.stripe_customer_id}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-3 text-slate-600 text-xs">
                  {p.plan_expires_at
                    ? new Date(p.plan_expires_at).toLocaleDateString()
                    : <span className="text-emerald-700">{t("activeStripe")}</span>}
                </td>
                <td className="py-3 pr-3 text-slate-500 text-xs">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
