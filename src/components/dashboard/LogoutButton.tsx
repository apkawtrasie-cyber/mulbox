"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createBrowserSupabase } from "@/lib/supabase";

export function LogoutButton() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  async function logout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-ghost text-sm" aria-label={t("logoutBtn")}>
      <LogOut size={16} /> <span className="hidden sm:inline">{t("logoutBtn")}</span>
    </button>
  );
}
