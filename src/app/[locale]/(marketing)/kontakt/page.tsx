import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ContactForm } from "./ContactForm";
import { Mail, MapPin, Clock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("contactTitle"), description: t("contactDescription") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("Contact");
  return (
    <section className="section">
      <div className="container-fluid max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="h1 text-slate-900 dark:text-white">{t("h1")}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t("intro")}</p>
          <ul className="mt-8 space-y-4 text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-3">
              <Mail className="text-brand-600" size={20} /> kontakt@mulbox.ch
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="text-brand-600" size={20} /> {t("location")}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="text-brand-600" size={20} /> {t("hours")}
            </li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
