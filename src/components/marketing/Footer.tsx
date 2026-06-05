import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/Logo";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a14]">
      <div className="container-fluid py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
            {t("tagline")}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("product")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/#funkcje" className="hover:text-slate-900 dark:hover:text-white">{t("functions")}</Link></li>
            <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white">{t("pricing")}</Link></li>
            <li><Link href="/#przyklady" className="hover:text-slate-900 dark:hover:text-white">{t("examples")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("company")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/kontakt" className="hover:text-slate-900 dark:hover:text-white">{t("contact")}</Link></li>
            <li><Link href="/impressum" className="hover:text-slate-900 dark:hover:text-white">{t("impressum")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("account")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/login" className="hover:text-slate-900 dark:hover:text-white">{t("login")}</Link></li>
            <li><Link href="/register" className="hover:text-slate-900 dark:hover:text-white">{t("register")}</Link></li>
            <li><Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">{t("dashboard")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="container-fluid py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{t("copyright", { year })}</span>
          <span>{t("madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}
