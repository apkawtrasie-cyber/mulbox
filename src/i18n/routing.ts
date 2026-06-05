import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Konfiguracja routingu wielojęzykowego.
 * - de jest językiem domyślnym (root mulbox.ch bez prefiksu)
 * - pozostałe języki dostępne pod /pl, /en, /fr, /it, /es
 */
export const routing = defineRouting({
  locales: ["de", "pl", "en", "fr", "it", "es"] as const,
  defaultLocale: "de",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// Lokalizowane wrappery na <Link>, useRouter itp.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
