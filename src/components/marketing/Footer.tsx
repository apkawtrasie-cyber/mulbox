import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="container-fluid py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-600 max-w-xs">
            Nowoczesne formularze dla Twojej strony. Bez spamu, bez utraconych maili, bez dramatów z hostingiem.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Produkt</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/#funkcje" className="hover:text-slate-900">Funkcje</Link></li>
            <li><Link href="/pricing" className="hover:text-slate-900">Cennik</Link></li>
            <li><Link href="/#przyklady" className="hover:text-slate-900">Przykłady</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Firma</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/kontakt" className="hover:text-slate-900">Kontakt</Link></li>
            <li><Link href="/impressum" className="hover:text-slate-900">Impressum</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Konto</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/login" className="hover:text-slate-900">Zaloguj się</Link></li>
            <li><Link href="/register" className="hover:text-slate-900">Załóż konto</Link></li>
            <li><Link href="/dashboard" className="hover:text-slate-900">Panel klienta</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-fluid py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Mulbox.ch – wszystkie prawa zastrzeżone.</span>
          <span>Made with ♥ in Switzerland</span>
        </div>
      </div>
    </footer>
  );
}
