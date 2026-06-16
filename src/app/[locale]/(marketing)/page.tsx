import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/marketing/Hero";
import { Trust } from "@/components/marketing/Trust";
import { Features } from "@/components/marketing/Features";
import { LiveDemo } from "@/components/marketing/LiveDemo";
import { CodeShowcase } from "@/components/marketing/CodeShowcase";
import { Link } from "@/i18n/routing";

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "FAQ" });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((i) => ({
      "@type": "Question",
      name: t(`q${i}` as `q${typeof i}`),
      acceptedAnswer: { "@type": "Answer", text: t(`a${i}` as `a${typeof i}`) },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <Trust />
      <Features />
      <LiveDemo />
      <CodeShowcase />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

function FaqSection() {
  const t = useTranslations("FAQ");
  return (
    <section id="faq" className="section bg-slate-50 dark:bg-[#0a0a14] relative overflow-hidden" aria-labelledby="faq-heading">
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[700px] h-[450px]" style={{ background: "radial-gradient(ellipse at 90% 100%, rgba(139,92,246,0.22) 0%, rgba(180,130,255,0.12) 35%, transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] hidden dark:block" style={{ background: "radial-gradient(ellipse at 95% 100%, rgba(109,40,217,0.45) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)" }} />
      <div className="container-fluid max-w-4xl relative">
        <h2 id="faq-heading" className="h2 text-center text-slate-900 dark:text-white">{t("heading")}</h2>
        <div className="mt-10 space-y-3">
          {FAQ_KEYS.map((i) => (
            <details key={i} className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-4">
                <h3 className="text-base">{t(`q${i}` as `q${typeof i}`)}</h3>
                <span className="text-brand-600 dark:text-brand-400 transition group-open:rotate-45 text-2xl leading-none flex-shrink-0">+</span>
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{t(`a${i}` as `a${typeof i}`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const t = useTranslations("CTA");
  return (
    <section className="section">
      <div className="container-fluid">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-16 text-white text-center shadow-xl">
          <h2 className="h2">{t("heading")}</h2>
          <p className="mt-3 text-brand-50/90 max-w-2xl mx-auto">
            {t("description")}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-white text-brand-700 font-semibold px-6 py-3 hover:bg-brand-50 transition">
              {t("primary")}
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-xl ring-1 ring-white/40 px-6 py-3 hover:bg-white/10 transition">
              {t("secondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
