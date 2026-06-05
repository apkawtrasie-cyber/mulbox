"use client";

import { useLocale } from "next-intl";
import { useState, useTransition, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter, routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = {
  de: "DE",
  pl: "PL",
  en: "EN",
  fr: "FR",
  it: "IT",
  es: "ES",
};

const FULL_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  pl: "Polski",
  en: "English",
  fr: "Français",
  it: "Italiano",
  es: "Español",
};

/** Language switcher – visible pill button with dropdown. */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-60"
        aria-label="Choose language"
        aria-expanded={open}
      >
        <Globe size={13} />
        {LABELS[locale]}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[130px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l as Locale)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-left transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
                l === locale ? "font-semibold text-brand-700 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>{FULL_LABELS[l as Locale]}</span>
              <span className="text-xs text-slate-400 font-mono">{LABELS[l as Locale]}</span>
              {l === locale && <Check size={13} className="text-brand-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
