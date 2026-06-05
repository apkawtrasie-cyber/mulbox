import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("impressumTitle"), description: t("impressumDescription") };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ImpressumContent />;
}

function ImpressumContent() {
  const t = useTranslations("Impressum");
  const operatorLines = t("operatorBody").split("\n");

  return (
    <section className="section">
      <div className="container-fluid max-w-3xl prose prose-slate dark:prose-invert">
        <h1 className="h1 text-slate-900 dark:text-white">{t("h1")}</h1>

        <h2 className="h3 mt-10">{t("operatorTitle")}</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">
          {operatorLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < operatorLines.length - 1 && <br />}
            </span>
          ))}
        </p>

        <h2 className="h3 mt-8">{t("contactTitle")}</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">
          {t("contactEmail")}{" "}
          <a className="text-brand-700 dark:text-brand-400 underline" href="mailto:kontakt@mulbox.ch">
            kontakt@mulbox.ch
          </a>
        </p>

        <h2 className="h3 mt-8">{t("responsibilityTitle")}</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">{t("responsibilityBody")}</p>

        <h2 className="h3 mt-8">{t("linksTitle")}</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">{t("linksBody")}</p>

        <h2 className="h3 mt-8">{t("copyrightTitle")}</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">{t("copyrightBody")}</p>
      </div>
    </section>
  );
}
