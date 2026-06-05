import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PricingCTA } from "@/components/marketing/PricingCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("pricingTitle"),
    description: t("pricingDescription"),
  };
}

const PLAN_KEYS = ["free", "personal", "business"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

const PLAN_FEATURE_KEYS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"] as const;
const FREE_INCLUDED = [true, true, true, true, false, false, false, false];

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingContent />;
}

function PricingContent() {
  const t = useTranslations("Pricing");

  const plans: {
    key: PlanKey;
    highlight?: boolean;
  }[] = [
    { key: "free" },
    { key: "personal", highlight: true },
    { key: "business" },
  ];

  return (
    <section className="section">
      <div className="container-fluid max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="h1 text-slate-900 dark:text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ key, highlight }) => {
            const features = PLAN_FEATURE_KEYS.map((f, idx) => ({
              label: t(`${key}${f}` as `${typeof key}${typeof f}`),
              included: key === "free" ? FREE_INCLUDED[idx] : true,
            }));

            return (
              <div
                key={key}
                className={`relative rounded-3xl border p-8 flex flex-col ${
                  highlight
                    ? "border-brand-500 bg-white dark:bg-[#12102a] shadow-xl ring-2 ring-brand-500"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#12102a] shadow-sm"
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    {t("popular")}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t(`${key}Name` as `${typeof key}Name`)}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(`${key}Description` as `${typeof key}Description`)}
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {t(`${key}Price` as `${typeof key}Price`)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{t("perMonth")}</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {f.included ? (
                        <Check size={18} className="mt-0.5 text-brand-600 shrink-0" />
                      ) : (
                        <X size={18} className="mt-0.5 text-slate-300 shrink-0" />
                      )}
                      <span className={f.included ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <PricingCTA
                  plan={key}
                  label={t(`${key}Cta` as `${typeof key}Cta`)}
                  className={`mt-8 ${highlight ? "btn-primary" : "btn-secondary"} w-full`}
                />
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
