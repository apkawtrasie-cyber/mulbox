"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createBrowserSupabase } from "@/lib/supabase";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("Auth");
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

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setInfo(t("registerInfo"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registerError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("registerH1")}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("registerSubtitle")}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="label">{t("labelFullName")}</label>
          <input id="full_name" name="full_name" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">{t("labelEmail")}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">{t("labelPassword")}</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("passwordHint")}</p>
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-rose-600"><AlertCircle size={16} /> {error}</p>
        )}
        {info && (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={16} /> {info}</p>
        )}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          <UserPlus size={16} /> {loading ? t("registerSubmitting") : t("registerSubmit")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-brand-700 dark:text-brand-400 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
