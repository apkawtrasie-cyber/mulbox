import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const TITLE = "Mulbox – Generator formularzy kontaktowych online (HTML, QR, Link)";
const DESCRIPTION =
  "Mulbox to generator formularzy kontaktowych online. Zbieraj leady przez kod HTML, kody QR i bezpośrednie linki – bez wtyczek WordPress. Konfiguracja w 2 minuty, 100% PageSpeed, < 1s czas ładowania.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: "%s · Mulbox",
  },
  description: DESCRIPTION,
  applicationName: "Mulbox",
  keywords: [
    "generator formularzy",
    "formularz kontaktowy online",
    "formularz HTML bez wtyczek",
    "kod QR formularz",
    "Mulbox",
    "WordPress formularz",
    "lead generation",
    "Kontaktformular",
    "contact form generator",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo-bimi.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-bimi.png",
    shortcut: "/logo-bimi.svg",
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      "de-CH": APP_URL,
      "pl-PL": `${APP_URL}/pl`,
      "en": `${APP_URL}/en`,
      "fr": `${APP_URL}/fr`,
      "it": `${APP_URL}/it`,
      "es": `${APP_URL}/es`,
      "x-default": APP_URL,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Mulbox",
    locale: "de_CH",
    alternateLocale: ["pl_PL", "en_US", "fr_FR", "it_IT", "es_ES"],
    type: "website",
    images: [{ url: "/logo.mulbox.ch.png", width: 1200, height: 630, alt: "Mulbox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.mulbox.ch.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mulbox",
  url: APP_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "CHF" },
  featureList: [
    "Generator kodów HTML dla WordPress, Webflow, Next.js",
    "Automatyczne generowanie kodów QR dla biznesu lokalnego",
    "Dedykowane strony docelowe (Landing Pages) z linkami do formularzy",
    "Bezpieczna wysyłka e-mail bez obciążania hostingu",
  ],
  publisher: { "@type": "Organization", name: "Mulbox", url: APP_URL, logo: `${APP_URL}/logo.mulbox.ch.png` },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // locale jest ustawiane dynamicznie przez next-intl przez setRequestLocale w [locale]/layout.tsx
  const { getLocale } = await import("next-intl/server");
  let locale = "de";
  try {
    locale = await getLocale();
  } catch {
    // Fallback dla tras nielokalizowanych (dashboard/admin)
    locale = "pl";
  }

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {/* Zapobiega mignięciu złego motywu przed hydratacją */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('mulbox-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
