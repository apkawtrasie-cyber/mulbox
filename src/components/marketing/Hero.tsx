import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle, Check } from "lucide-react";

/** Sekcja Hero – priorytet renderowania (above the fold). */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Light gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white dark:hidden" />
      {/* Dark gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block" style={{ background: "linear-gradient(135deg,#0d0d1a 0%,#12102a 40%,#1a103a 100%)" }} />

      <div className="container-fluid grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-12 sm:pt-16 lg:pt-24 pb-12 sm:pb-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-700/60 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
            ✨ Nowoczesne formularze dla Twojej strony
          </span>
          <h1 className="h1 mt-5 text-slate-900">
            Mulbox to nie <br />
            zwykły formularz.{" "}
            <span className="gradient-text">To cały system.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Twórz, dostosowuj i udostępniaj formularze. Zbieraj wiadomości, zarządzaj leadami i rozwijaj swój biznes w prosty sposób.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn-primary">
              Załóż darmowe konto <ArrowRight size={18} />
            </Link>
            <Link href="/#funkcje" className="btn-secondary">
              <PlayCircle size={18} /> Zobacz jak to działa
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            {["Za darmo na start", "Bez karty kredytowej", "Gotowe w 2 minuty"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check size={16} className="text-brand-600" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero image – light / dark */}
        <div className="relative w-full aspect-[5/6]">
          <Image
            src="/tlo.handy.mulbox.png"
            alt="Mulbox – formularz na telefonie"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/tlo.handy.dark.mulbox.png"
            alt="Mulbox – formularz na telefonie (dark)"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain hidden dark:block"
            priority
          />
        </div>
      </div>
    </section>
  );
}
