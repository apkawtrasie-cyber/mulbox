import Image from "next/image";
import { ArrowRight, PlayCircle, Palette, Mail, Link2, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

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

function PhoneVisual({ scaleMobile = false, altLight, altDark, cards }: {
  scaleMobile?: boolean;
  altLight: string;
  altDark: string;
  cards: { title: string; subtitle: string }[];
}) {
  return (
    <div className={`relative aspect-[5/6] ${scaleMobile ? "w-[110%] -mx-[5%] sm:w-full sm:mx-0" : "w-full"}`}>
      <div aria-hidden className="absolute inset-0 pointer-events-none dark:hidden"
        style={{ background: "radial-gradient(ellipse 65% 70% at 52% 44%, rgba(255,255,255,0.95) 0%, rgba(220,180,255,0.55) 22%, rgba(180,130,255,0.2) 50%, transparent 72%)" }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: "radial-gradient(ellipse 55% 60% at 52% 42%, rgba(255,255,255,0.28) 0%, rgba(220,160,255,0.45) 14%, rgba(139,92,246,0.3) 32%, rgba(109,40,217,0.12) 55%, transparent 72%)" }} />

      <div className="absolute inset-0 animate-float">
        <Image src="/tlo.handy.mulbox.png" alt={altLight} fill sizes="(max-width: 1024px) 110vw, 50vw" className="object-contain dark:hidden" priority />
        <Image src="/tlo.handy.dark.mulbox.png" alt={altDark} fill sizes="(max-width: 1024px) 110vw, 50vw" className="object-contain hidden dark:block" priority />
      </div>

      <HeroCard className="top-[18%] left-[30px] sm:left-[2%] animate-drift-l"   icon={<Palette size={18} />}   title={cards[0].title} subtitle={cards[0].subtitle} />
      <HeroCard className="top-[35%] right-[30px] sm:right-[2%] animate-drift-r" icon={<Mail size={18} />}      title={cards[1].title} subtitle={cards[1].subtitle} />
      <HeroCard className="top-[57%] left-[30px] sm:left-[2%] animate-drift-l2" icon={<Link2 size={18} />}     title={cards[2].title} subtitle={cards[2].subtitle} />
      <HeroCard className="top-[65%] right-[30px] sm:right-[2%] animate-drift-r2" icon={<BarChart3 size={18} />} title={cards[3].title} subtitle={cards[3].subtitle} />
    </div>
  );
}

export function Hero() {
  const t = useTranslations("Hero");

  const cards = [
    { title: t("card1Title"), subtitle: t("card1Subtitle") },
    { title: t("card2Title"), subtitle: t("card2Subtitle") },
    { title: t("card3Title"), subtitle: t("card3Subtitle") },
    { title: t("card4Title"), subtitle: t("card4Subtitle") },
  ];
  const altLight = t("phoneAltLight");
  const altDark = t("phoneAltDark");

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white dark:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block" style={{ background: "#070712" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block" style={{ background: "radial-gradient(ellipse 110% 95% at 65% 46%, rgba(109,40,217,0.85) 0%, rgba(124,58,237,0.55) 18%, rgba(139,92,246,0.25) 40%, rgba(109,40,217,0.08) 62%, transparent 78%)" }} />

      {/* MOBILE */}
      <div className="lg:hidden container-fluid pt-2 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-700/60 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
          {t("badge")}
        </span>
        <h1 id="hero-heading" className="h1 mt-5 text-slate-900 dark:text-white">
          {t("h1Line1")} <br />
          {t("h1Line2")} <br />
          <span className="gradient-text">{t("h1Line3")}</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
          {t("subtitle1")}<br />
          {t("subtitle2")}
        </p>
        <div className="mt-8 scale-110 origin-top">
          <PhoneVisual scaleMobile altLight={altLight} altDark={altDark} cards={cards} />
        </div>
        <div className="mt-6">
          <Link href="/register" className="btn-primary w-full justify-center">
            {t("ctaPrimary")} <ArrowRight size={18} />
          </Link>
        </div>
        <div className="mt-3">
          <Link href="/#funkcje" className="btn-secondary w-full justify-center">
            <PlayCircle size={18} /> {t("ctaSecondary")}
          </Link>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:grid container-fluid grid-cols-2 gap-16 items-center pt-3 pb-4">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-700/60 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
            {t("badge")}
          </span>
          <h1 className="h1 mt-5 text-slate-900 dark:text-white">
            {t("h1Line1")} <br />
            {t("h1Line2")} <br />
            <span className="gradient-text">{t("h1Line3")}</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
            {t("subtitle1")}<br />
            {t("subtitle2")}
          </p>
          <div className="mt-8 flex flex-row gap-3">
            <Link href="/register" className="btn-primary">
              {t("ctaPrimary")} <ArrowRight size={18} />
            </Link>
            <Link href="/#funkcje" className="btn-secondary">
              <PlayCircle size={18} /> {t("ctaSecondary")}
            </Link>
          </div>
        </div>

        <PhoneVisual altLight={altLight} altDark={altDark} cards={cards} />
      </div>
    </section>
  );
}
