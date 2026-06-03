import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle, Check, Palette, Mail, Link2, BarChart3 } from "lucide-react";

function HeroCard({ className, icon, title, subtitle }: { className: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className={`absolute z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-[#2e2e50] bg-white dark:bg-[#26263f] px-4 py-3 shadow-[0_4px_24px_rgba(139,92,246,0.13)] dark:shadow-[0_4px_36px_rgba(139,92,246,0.55)] ${className}`}>
      <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-50 dark:bg-[#2e1f6e] text-brand-600 dark:text-brand-300">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{title}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[130px] leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

/** Sekcja Hero – priorytet renderowania (above the fold). */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Light gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white dark:hidden" />
      {/* Dark base – deep space navy */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block" style={{ background: "#070712" }} />
      {/* Purple burst from phone spreading toward h1 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block" style={{ background: "radial-gradient(ellipse 110% 95% at 65% 46%, rgba(109,40,217,0.85) 0%, rgba(124,58,237,0.55) 18%, rgba(139,92,246,0.25) 40%, rgba(109,40,217,0.08) 62%, transparent 78%)" }} />

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

        {/* Hero image + float cards */}
        <div className="relative w-full aspect-[5/6]">
          {/* Light image */}
          <Image
            src="/tlo.handy.mulbox.png"
            alt="Mulbox – formularz na telefonie"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain dark:hidden"
            priority
          />
          {/* Dark image */}
          <Image
            src="/tlo.handy.dark.mulbox.png"
            alt="Mulbox – formularz na telefonie (dark)"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain hidden dark:block"
            priority
          />

          {/* 4 feature cards */}
          <HeroCard className="top-[18%] left-[2%]"  icon={<Palette size={18} />}   title="Dostosuj"   subtitle="Kolory, czcionki, układ i treści" />
          <HeroCard className="top-[35%] right-[2%]" icon={<Mail size={18} />}      title="Zbieraj"    subtitle="wiadomości i leady" />
          <HeroCard className="top-[57%] left-[2%]"  icon={<Link2 size={18} />}     title="Udostępnij" subtitle="link, kod QR lub osadzenie" />
          <HeroCard className="top-[65%] right-[2%]" icon={<BarChart3 size={18} />} title="Zarządzaj"  subtitle="swoją listą kontaktów" />
        </div>
      </div>
    </section>
  );
}
