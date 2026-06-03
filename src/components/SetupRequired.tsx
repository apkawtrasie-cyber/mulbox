import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Database } from "lucide-react";

/** Ekran zastępczy, gdy użytkownik nie skonfigurował jeszcze Supabase ENV. */
export function SetupRequired() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl card text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Database size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Skonfiguruj Supabase, aby kontynuować</h1>
        <p className="mt-2 text-slate-600">
          Aby korzystać z panelu klienta i panelu admina, uzupełnij plik <code className="font-mono text-sm">.env.local</code> swoimi kluczami i uruchom skrypt SQL z <code className="font-mono text-sm">supabase/schema.sql</code>.
        </p>
        <ol className="mt-5 text-left text-sm text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 rounded-xl p-4 border border-slate-200">
          <li>Skopiuj <code>.env.local.example</code> do <code>.env.local</code> i wpisz swoje klucze.</li>
          <li>W Supabase Studio → SQL Editor → wklej zawartość <code>supabase/schema.sql</code>.</li>
          <li>Zrestartuj <code>npm run dev</code>.</li>
        </ol>
        <Link href="/" className="btn-secondary mt-6 inline-flex"><Logo /></Link>
      </div>
    </div>
  );
}
