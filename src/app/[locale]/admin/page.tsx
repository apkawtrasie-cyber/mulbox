import { Link } from "@/i18n/routing";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { SetupRequired } from "@/components/SetupRequired";
import { AdminTable } from "@/components/admin/AdminTable";
import { PromoCodeManager } from "@/components/admin/PromoCodeManager";
import { SubscriptionsList } from "@/components/admin/SubscriptionsList";
import type { Profile, FormRecord } from "@/lib/types";
import { getTranslations } from "next-intl/server";

export const revalidate = 0;

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  await requireAdmin();
  const supabase = createServerSupabase();
  const t = await getTranslations("Admin");

  const [{ data: profiles }, { data: forms }, { count: submissionsCount }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("forms").select("*").order("created_at", { ascending: false }),
    supabase.from("submissions").select("id", { count: "exact", head: true }),
  ]);

  const profilesArr = (profiles ?? []) as Profile[];
  const formsArr = (forms ?? []) as FormRecord[];

  const stats = {
    users: profilesArr.length,
    forms: formsArr.length,
    activeForms: formsArr.filter((f) => f.is_active).length,
    submissions: submissionsCount ?? 0,
    free: profilesArr.filter((p) => p.plan_type === "free").length,
    personal: profilesArr.filter((p) => p.plan_type === "personal").length,
    business: profilesArr.filter((p) => p.plan_type === "business").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="container-fluid h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5 uppercase">Admin</span>
          </div>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">← {t("backToDashboard")}</Link>
        </div>
      </header>

      <main className="container-fluid py-10 space-y-8">
        <section>
          <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-slate-500">{t("subtitle")}</p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label={t("statUsers")} value={stats.users} />
          <Stat label={t("statForms")} value={`${stats.activeForms} / ${stats.forms}`} />
          <Stat label={t("statSubmissions")} value={stats.submissions} />
          <Stat label={t("statPlans")} value={`${stats.free} / ${stats.personal} / ${stats.business}`} />
        </section>

        <SubscriptionsList profiles={profilesArr} />

        <AdminTable forms={formsArr} profiles={profilesArr} />

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t("promoCodes")}</h2>
          <PromoCodeManager />
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
