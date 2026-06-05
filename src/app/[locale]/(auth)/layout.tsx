import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-white dark:from-[#0d0d1a] dark:via-[#12102a] dark:to-[#0d0d1a]">
      <header className="container-fluid py-6">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <AuthFooter />
    </div>
  );
}

function AuthFooter() {
  const t = useTranslations("Auth");
  return (
    <footer className="container-fluid py-6 text-center text-xs text-slate-500">
      <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300">
        {t("backHome")}
      </Link>
    </footer>
  );
}
