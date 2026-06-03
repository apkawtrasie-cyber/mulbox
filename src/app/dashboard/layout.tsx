import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { SetupRequired } from "@/components/SetupRequired";
import { Shield } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { profile } = await requireUser();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="container-fluid flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline-block rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold uppercase">
              Plan: {profile.plan_type}
            </span>
            {profile.role === "admin" && (
              <Link href="/admin" className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold uppercase">
                <Shield size={14} /> Admin
              </Link>
            )}
            <span className="hidden md:inline text-slate-600">{profile.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container-fluid py-8">{children}</main>
    </div>
  );
}
