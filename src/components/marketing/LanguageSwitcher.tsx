"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Globe } from "lucide-react";
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

/** Language switcher – changes locale while preserving the current path. */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className="relative inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
      <Globe size={16} aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        className="bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0 pr-1 font-medium"
        aria-label="Choose language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-white dark:bg-[#0d0d1a]">
            {LABELS[l as Locale]} – {FULL_LABELS[l as Locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
