import { FileText, Palette, Link2, Mail, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";

/** Sekcja "Funkcje" – glassmorphism z delikatnymi niebieskimi akcentami w rogach. */
export function Features() {
  const t = useTranslations("Features");

  const FEATURES = [
    { icon: FileText, title: t("f1Title"), text: t("f1Text") },
    { icon: Palette,  title: t("f2Title"), text: t("f2Text") },
    { icon: Link2,    title: t("f3Title"), text: t("f3Text") },
    { icon: Mail,     title: t("f4Title"), text: t("f4Text") },
    { icon: BarChart3, title: t("f5Title"), text: t("f5Text") },
  ];

  return (
    <section id="funkcje" className="section" aria-labelledby="features-heading">
      <div className="container-fluid">
        <h2 id="features-heading" className="sr-only">
          {t("srHeading")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_32px_rgba(59,130,246,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(59,130,246,0.18)] dark:hover:shadow-[0_12px_48px_rgba(59,130,246,0.35)]"
            >
              {/* Niebieskie akcenty w rogach */}
              <span aria-hidden className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
              <span aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-brand-400/15 blur-3xl" />

              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/40 dark:to-blue-900/30 text-brand-600 dark:text-brand-300 ring-1 ring-white/60 dark:ring-white/10">
                <Icon size={22} />
              </span>
              <h3 className="relative mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="relative mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
