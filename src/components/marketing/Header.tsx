"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";

/** Sticky, w pełni responsywny header strefy publicznej. */
export function Header() {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);

  const NAV = [
    { href: "/#funkcje", label: t("navFunctions") },
    { href: "/#przyklady", label: t("navExamples") },
    { href: "/pricing", label: t("navPricing") },
    { href: "/#faq", label: t("navFaq") },
    { href: "/kontakt", label: t("navContact") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-[#2a2a3a] bg-white/80 dark:bg-[#0d0d1a]/90 backdrop-blur">
      <div className="container-fluid flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV.map((it) => (
            <Link key={it.href} href={it.href} className="hover:text-slate-900 dark:hover:text-white transition">
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn-ghost">{t("login")}</Link>
          <Link href="/register" className="btn-primary">{t("register")}</Link>
        </div>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("openMenu")}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 dark:border-[#2a2a3a] bg-white dark:bg-[#0d0d1a]">
          <div className="container-fluid flex flex-col gap-1 py-3">
            {NAV.map((it) => (
              <Link key={it.href} href={it.href} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
                {it.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t("theme")}</span>
                <ThemeToggle />
              </div>
              <div className="py-1">
                <LanguageSwitcher />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="btn-secondary w-full">{t("loginShort")}</Link>
                <Link href="/register" className="btn-primary w-full">{t("register")}</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
