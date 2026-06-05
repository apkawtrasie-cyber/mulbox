import { cache } from "react";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";

/**
 * Pobiera użytkownika i profil; przekierowuje na /login gdy brak sesji.
 * Owinięte w React.cache → pojedynczy network call na request, nawet
 * jeśli wywołane z layoutu i page równocześnie.
 */
export const requireUser = cache(async function requireUser(): Promise<{ profile: Profile; userId: string }> {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    const locale = await getLocale();
    redirect(locale === "de" ? "/login" : `/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profile) return { profile, userId: user.id };

  // Brak profilu – trigger nie zadziałał lub RLS blokuje SELECT.
  // Tworzymy idempotentnie service-role kluczem (omija RLS, brak INSERT policy).
  const admin = createServiceSupabase();
  await admin.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) ?? null,
  }, { onConflict: "id" });

  const { data: created } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!created) {
    const locale = await getLocale();
    redirect(locale === "de" ? "/login" : `/${locale}/login`);
  }
  return { profile: created!, userId: user.id };
});

/** Wymusza rolę admin – w przeciwnym razie wyrzuca na /dashboard. */
export const requireAdmin = cache(async function requireAdmin(): Promise<{ profile: Profile; userId: string }> {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") {
    const locale = await getLocale();
    redirect(locale === "de" ? "/dashboard" : `/${locale}/dashboard`);
  }
  return ctx;
});
