"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    try {
      const supabase = createBrowserSupabase();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zalogować.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-slate-900">Zaloguj się</h1>
      <p className="mt-1 text-sm text-slate-500">Witaj z powrotem w Mulbox.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Hasło</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={16} /> {error}
          </p>
        )}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          <LogIn size={16} /> {loading ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Nie masz konta?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">Załóż konto</Link>
      </p>
    </div>
  );
}
