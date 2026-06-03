import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mulbox.ch – Formularze, które naprawdę działają",
    template: "%s · Mulbox.ch",
  },
  description:
    "Mulbox.ch to nie zwykły formularz – to cały system. Twórz, dostosowuj i udostępniaj formularze. Zbieraj wiadomości, zarządzaj leadami i rozwijaj swój biznes.",
  applicationName: "Mulbox",
  keywords: ["formularz", "form", "WordPress", "kontakt", "lead", "Mulbox", "Szwajcaria"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Mulbox.ch – Formularze, które naprawdę działają",
    description:
      "Twórz, dostosowuj i udostępniaj nowoczesne formularze. Bez spamu, bez utraconych maili.",
    url: APP_URL,
    siteName: "Mulbox.ch",
    locale: "pl_PL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
