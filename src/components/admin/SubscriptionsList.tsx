import type { Profile } from "@/lib/types";
import { CreditCard } from "lucide-react";

interface Props {
  profiles: Profile[];
}

/** Lista aktywnych subskrypcji (Personal/Business). Tylko widoczna dla admina. */
export function SubscriptionsList({ profiles }: Props) {
  const subscribers = profiles.filter(
    (p) => p.plan_type === "personal" || p.plan_type === "business"
  );

  if (subscribers.length === 0) {
    return (
      <section className="card">
        <header className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-slate-900">Aktywne subskrypcje</h2>
        </header>
        <p className="text-sm text-slate-500">Brak aktywnych subskrypcji.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-slate-900">Aktywne subskrypcje</h2>
        </div>
        <span className="text-xs font-semibold rounded-full bg-violet-100 text-violet-700 px-2.5 py-1">
          {subscribers.length} {subscribers.length === 1 ? "subskrypcja" : "subskrypcji"}
        </span>
      </header>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="text-left py-2 pr-3">Klient</th>
              <th className="text-left py-2 pr-3">Plan</th>
              <th className="text-left py-2 pr-3">Stripe Customer ID</th>
              <th className="text-left py-2 pr-3">Wygasa</th>
              <th className="text-left py-2 pr-3">Założył konto</th>
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
                    <span className="text-slate-400">brak</span>
                  )}
                </td>
                <td className="py-3 pr-3 text-slate-600 text-xs">
                  {p.plan_expires_at
                    ? new Date(p.plan_expires_at).toLocaleDateString("pl-PL")
                    : <span className="text-emerald-700">aktywna (Stripe)</span>}
                </td>
                <td className="py-3 pr-3 text-slate-500 text-xs">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString("pl-PL") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
