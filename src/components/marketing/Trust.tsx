import { Gauge, Rocket, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

const TECH = [
  "Next.js (React 19)",
  "Supabase",
  "Tailwind CSS",
  "Stripe",
  "Vercel",
];

/** Sekcja techniczna – fundament technologiczny + twarde parametry wydajnościowe. */
export function Trust() {
  const t = useTranslations("Trust");
  const STATS = [
    { icon: Gauge, value: "< 1s", label: t("speedLabel") },
    { icon: Rocket, value: "100%", label: t("perfLabel") },
    { icon: Timer, value: t("setupValue"), label: t("setupLabel") },
  ];

  return (
    <section className="container-fluid pb-16" aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="text-center text-slate-700 dark:text-slate-200 font-medium">
        {t("heading")}
      </h2>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-500 dark:text-slate-400 text-base sm:text-lg font-semibold">
        {TECH.map((tech) => (
          <span key={tech} className="opacity-80 hover:opacity-100 transition">{tech}</span>
        ))}
      </div>

      <div className="mt-10 relative overflow-hidden grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl border border-blue-200/50 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(59,130,246,0.10)]">
        <span aria-hidden className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />

        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="relative flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/40 dark:to-blue-900/30 text-brand-600 dark:text-brand-300 ring-1 ring-white/60 dark:ring-white/10">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
