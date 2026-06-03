import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { SetupRequired } from "@/components/SetupRequired";
import { AdminTable } from "@/components/admin/AdminTable";
import type { Profile, FormRecord } from "@/lib/types";

export const revalidate = 0;

/** Panel admina – widoczny tylko dla profili z role='admin'. RLS jest drugą linią obrony. */
export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  await requireAdmin();
  const supabase = createServerSupabase();

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
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">← Dashboard</Link>
        </div>
      </header>

      <main className="container-fluid py-10 space-y-8">
        <section>
          <h1 className="text-3xl font-bold text-slate-900">Panel administratora</h1>
          <p className="text-slate-500">Globalna kontrola nad platformą Mulbox.ch.</p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Użytkownicy" value={stats.users} />
          <Stat label="Formularze (aktywne)" value={`${stats.activeForms} / ${stats.forms}`} />
          <Stat label="Wszystkie wiadomości" value={stats.submissions} />
          <Stat label="Plany (Free / Personal / Business)" value={`${stats.free} / ${stats.personal} / ${stats.business}`} />
        </section>

        <AdminTable forms={formsArr} profiles={profilesArr} />
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
