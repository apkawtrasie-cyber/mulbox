"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Check, ExternalLink, Loader2, AlertCircle, Lock } from "lucide-react";
import type { Profile } from "@/lib/types";

interface Props { profile: Profile; }

export function Billing({ profile }: Props) {
  const t = useTranslations("Dashboard");
  const tp = useTranslations("Pricing");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PLANS = [
    {
      key: "personal" as const,
      name: tp("personalName"),
      price: tp("personalPrice"),
      per: tp("perMonth"),
      desc: tp("personalDescription"),
      features: [
        tp("personalF1"), tp("personalF2"), tp("personalF3"),
        tp("personalF4"), tp("personalF5"), tp("personalF6"),
        tp("personalF7"), tp("personalF8"),
      ],
      highlight: true,
    },
    {
      key: "business" as const,
      name: tp("businessName"),
      price: tp("businessPrice"),
      per: tp("perMonth"),
      desc: tp("businessDescription"),
      features: [
        tp("businessF1"), tp("businessF2"), tp("businessF3"),
        tp("businessF4"), tp("businessF5"), tp("businessF6"),
        tp("businessF7"), tp("businessF8"),
      ],
    },
  ];

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
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
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
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(null);
    }
  }

  const isPaid = profile.plan_type !== "free";

  return (
    <div className="space-y-6">

      {/* Current plan status */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t("billingTitle")}</h2>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm text-slate-500">{t("activePlan")}</p>
            <p className="text-base font-semibold text-slate-900 capitalize">{profile.plan_type}</p>
            {profile.plan_expires_at && (
              <p className="text-xs text-amber-600 mt-0.5">
                {t("billingExpiry")} {new Date(profile.plan_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {isPaid && (
            <button
              onClick={openPortal}
              disabled={loading === "portal"}
              className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading === "portal" ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              {t("manageSubscription")}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={15} /> {error}
          </p>
        )}
      </div>

      {/* Checkout plan cards – Stripe-style order summary */}
      {!isPaid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-sm ${
                plan.highlight
                  ? "border-2 border-brand-500 shadow-brand-100/60"
                  : "border border-slate-200"
              }`}
            >
              {/* Popular banner */}
              {plan.highlight && (
                <div className="bg-brand-600 text-white text-xs font-bold tracking-widest uppercase text-center py-1.5">
                  {t("mostPopular")}
                </div>
              )}

              {/* Plan header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{plan.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-extrabold text-slate-900 leading-none">{plan.price}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{plan.per}</p>
                  </div>
                </div>
              </div>

              {/* Feature list – "what's included" */}
              <div className="px-6 py-4 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  {t("billingIncludes")}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-50">
                        <Check size={10} className="text-brand-600" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price summary – Stripe-style line items */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("billingSubtotal")}</span>
                  <span className="font-medium text-slate-800">{plan.price}</span>
                </div>
                <p className="text-xs text-slate-400">{t("billingVatNote")}</p>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 mt-1">
                  <span className="text-slate-900">{t("billingTotal")}</span>
                  <span className="text-slate-900">{plan.price}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 pt-4">
                <button
                  onClick={() => startCheckout(plan.key)}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-60 ${
                    plan.highlight
                      ? "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200"
                      : "bg-slate-900 hover:bg-slate-700 text-white"
                  }`}
                >
                  {loading === plan.key
                    ? <Loader2 size={16} className="animate-spin" />
                    : <CreditCard size={16} />
                  }
                  {t("billingCheckout")}
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Lock size={11} />
                  <span>{t("billingSecure")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
