"use client";

import { useState } from "react";
import { CreditCard, Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import type { Profile } from "@/lib/types";

interface PlanInfo {
  name: string;
  price: string;
  features: string[];
  priceKey: "personal" | "business";
  highlight?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    name: "Personal",
    price: "1 zł/mies.",
    priceKey: "personal",
    highlight: true,
    features: [
      "5 aktywnych formularzy",
      "1 000 wiadomości / mies.",
      "Bez stopki brandingowej",
      "Custom Redirect URL",
      "Autoresponder",
      "Eksport CSV",
    ],
  },
  {
    name: "Business",
    price: "9,90 zł/mies.",
    priceKey: "business",
    features: [
      "Nielimitowane formularze",
      "Nielimitowane wiadomości",
      "Wszystko z Personal",
      "Priorytetowe wsparcie",
      "API access",
      "SLA 99.9%",
    ],
  },
];

interface Props {
  profile: Profile;
}

export function Billing({ profile }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: "personal" | "business") {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Nieznany błąd");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd połączenia ze Stripe");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Nieznany błąd");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd połączenia ze Stripe");
    } finally {
      setLoading(null);
    }
  }

  const isPaid = profile.plan_type !== "free";

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">Plan i płatności</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm text-slate-500">Aktywny plan</p>
            <p className="text-base font-semibold text-slate-900 capitalize">{profile.plan_type}</p>
            {profile.plan_expires_at && (
              <p className="text-xs text-amber-600 mt-0.5">
                Wygasa: {new Date(profile.plan_expires_at).toLocaleDateString("pl-PL")}
              </p>
            )}
          </div>
          {isPaid && (
            <button
              onClick={openPortal}
              disabled={loading === "portal"}
              className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading === "portal" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} />
              )}
              Zarządzaj subskrypcją
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={15} /> {error}
          </p>
        )}
      </div>

      {!isPaid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.priceKey}
              className={`card flex flex-col ${
                plan.highlight ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {plan.highlight && (
                <span className="self-start rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white mb-3">
                  Najpopularniejszy
                </span>
              )}
              <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-700">
                    <Check size={14} className="text-brand-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startCheckout(plan.priceKey)}
                disabled={loading !== null}
                className={`mt-5 ${plan.highlight ? "btn-primary" : "btn-secondary"} w-full flex items-center justify-center gap-2 disabled:opacity-60`}
              >
                {loading === plan.priceKey ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CreditCard size={15} />
                )}
                Kup {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
