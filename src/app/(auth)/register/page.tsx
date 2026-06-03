"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");

    try {
      const supabase = createBrowserSupabase();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (err) throw err;

      // Jeśli email-confirmation OFF → mamy sesję od razu
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setInfo("Sprawdź skrzynkę – wysłaliśmy link aktywacyjny.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się utworzyć konta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-slate-900">Załóż konto</h1>
      <p className="mt-1 text-sm text-slate-500">Plan Free, bez karty kredytowej.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="label">Imię i nazwisko</label>
          <input id="full_name" name="full_name" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Hasło</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <p className="mt-1 text-xs text-slate-500">Minimum 8 znaków.</p>
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-rose-600"><AlertCircle size={16} /> {error}</p>
        )}
        {info && (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={16} /> {info}</p>
        )}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          <UserPlus size={16} /> {loading ? "Tworzenie konta…" : "Załóż darmowe konto"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Masz już konto?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">Zaloguj się</Link>
      </p>
    </div>
  );
}
