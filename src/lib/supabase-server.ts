import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Sprawdza, czy zmienne ENV Supabase są skonfigurowane. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Klient po stronie serwera (cookies → sesja użytkownika, RLS aktywne). */
export function createServerSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: Record<string, unknown>) => {
        try { cookieStore.set({ name, value, ...options }); } catch { /* Server Components */ }
      },
      remove: (name: string, options: Record<string, unknown>) => {
        try { cookieStore.set({ name, value: "", ...options }); } catch { /* j.w. */ }
      },
    },
  });
}

/** Service-role klient – TYLKO endpointy serwerowe (omija RLS). */
export function createServiceSupabase(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
