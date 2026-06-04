import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { PricingCTA } from "@/components/marketing/PricingCTA";

export const metadata: Metadata = {
  title: "Cennik",
  description: "Wybierz plan idealny dla Twojego biznesu – Free, Personal lub Business.",
};

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  cta: string;
  planKey: "free" | "personal" | "business";
  features: { label: string; included: boolean }[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "0 zł",
    period: "/mies.",
    description: "Idealny start dla małych stron i osobistych projektów.",
    cta: "Zacznij za darmo",
    planKey: "free" as const,
    features: [
      { label: "1 aktywny formularz", included: true },
      { label: "100 wiadomości / mies.", included: true },
      { label: "Powiadomienia email", included: true },
      { label: "Stopka 'Powered by Mulbox'", included: true },
      { label: "Custom Redirect URL", included: false },
      { label: "Autoresponder", included: false },
      { label: "Własne reCAPTCHA", included: false },
      { label: "Eksport do CSV", included: false },
    ],
  },
  {
    name: "Test – 1 zł",
    price: "1 zł",
    period: "/mies.",
    description: "Oferta testowa – sprawdź pełną funkcjonalność za symboliczną złotówkę.",
    highlight: true,
    cta: "Kup za 1 zł",
    planKey: "personal" as const,
    features: [
      { label: "5 aktywnych formularzy", included: true },
      { label: "1 000 wiadomości / mies.", included: true },
      { label: "Bez stopki brandingowej", included: true },
      { label: "Custom Redirect URL", included: true },
      { label: "Autoresponder z personalizacją", included: true },
      { label: "Własne reCAPTCHA (Site/Secret)", included: true },
      { label: "Eksport do CSV (UTF-8)", included: true },
      { label: "Dynamiczne strony /p/[id]", included: true },
    ],
  },
  {
    name: "Business",
    price: "9,90 zł",
    period: "/mies.",
    description: "Dla firm i agencji obsługujących wiele projektów.",
    cta: "Wybierz Business",
    planKey: "business" as const,
    features: [
      { label: "Nielimitowane formularze", included: true },
      { label: "Nielimitowane wiadomości", included: true },
      { label: "Wszystko z planu Personal", included: true },
      { label: "Priorytetowe wsparcie", included: true },
      { label: "Wielu użytkowników (zespoły)", included: true },
      { label: "Niestandardowe domeny wysyłki", included: true },
      { label: "SLA 99.9%", included: true },
      { label: "API access", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="section">
      <div className="container-fluid max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="h1 text-slate-900">Prosty cennik. Bez niespodzianek.</h1>
          <p className="mt-4 text-lg text-slate-600">
            Zacznij za darmo, przejdź na Premium kiedy chcesz. Anulujesz w dowolnej chwili.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 flex flex-col ${
                plan.highlight
                  ? "border-brand-500 bg-white shadow-xl ring-2 ring-brand-500"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Najpopularniejszy
                </span>
              )}
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.included ? (
                      <Check size={18} className="mt-0.5 text-brand-600 shrink-0" />
                    ) : (
                      <X size={18} className="mt-0.5 text-slate-300 shrink-0" />
                    )}
                    <span className={f.included ? "text-slate-700" : "text-slate-400 line-through"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <PricingCTA
                plan={plan.planKey}
                label={plan.cta}
                className={`mt-8 ${plan.highlight ? "btn-primary" : "btn-secondary"} w-full`}
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Wszystkie ceny netto. Obsługujemy płatności Stripe.
        </p>
      </div>
    </section>
  );
}
