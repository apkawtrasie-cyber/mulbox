import Link from "next/link";
import { ArrowRight, PlayCircle, Check } from "lucide-react";
import { HeroPhoneMock } from "./HeroPhoneMock";

/** Sekcja Hero – priorytet renderowania (above the fold). */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
      <div className="container-fluid grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-12 sm:pt-16 lg:pt-24 pb-12 sm:pb-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
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
        <div className="relative">
          <HeroPhoneMock />
        </div>
      </div>
    </section>
  );
}
