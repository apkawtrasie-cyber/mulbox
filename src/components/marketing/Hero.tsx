import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle, Check, Palette, Mail, Link2, BarChart3 } from "lucide-react";

function HeroCard({ className, icon, title, subtitle }: { className: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className={`absolute z-20 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/70 dark:border-white/[0.12] bg-white/80 dark:bg-[#2a1f5e]/70 px-2.5 py-2 sm:px-4 sm:py-3 shadow-[0_8px_32px_rgba(139,92,246,0.18),0_2px_8px_rgba(139,92,246,0.08)] dark:shadow-[0_8px_40px_rgba(139,92,246,0.7),0_0_24px_rgba(109,40,217,0.4)] ${className}`}>
      <span className="grid h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 place-items-center rounded-full bg-brand-50 dark:bg-[#3d2080] text-brand-600 dark:text-brand-200">
        {icon}
      </span>
      <div>
        <p className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{title}</p>
        <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-purple-200/70 max-w-[90px] sm:max-w-[130px] leading-relaxed">{subtitle}</p>
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

      <div className="container-fluid grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-1 sm:pt-2 lg:pt-3 pb-2 sm:pb-4">
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
        <div className="relative w-[120%] -ml-[10%] sm:w-full sm:ml-0 aspect-[5/6]">
          {/* Glow BEHIND phone – light mode: soft lavender halo */}
          <div aria-hidden className="absolute inset-0 pointer-events-none dark:hidden"
            style={{ background: "radial-gradient(ellipse 65% 70% at 52% 44%, rgba(255,255,255,0.95) 0%, rgba(220,180,255,0.55) 22%, rgba(180,130,255,0.2) 50%, transparent 72%)" }} />
          {/* Glow BEHIND phone – dark mode: bright white-purple star burst */}
          <div aria-hidden className="absolute inset-0 pointer-events-none hidden dark:block"
            style={{ background: "radial-gradient(ellipse 55% 60% at 52% 42%, rgba(255,255,255,0.28) 0%, rgba(220,160,255,0.45) 14%, rgba(139,92,246,0.3) 32%, rgba(109,40,217,0.12) 55%, transparent 72%)" }} />

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
