/**
 * Supabase – wspólny barrel. Browser-safe (bez `next/headers`).
 * Funkcje serwerowe mieszkają w `@/lib/supabase-server`.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn("[supabase] Brak NEXT_PUBLIC_SUPABASE_URL – sprawdź .env.local");
}

/** Klient w przeglądarce (komponenty 'use client'). */
export function createBrowserSupabase(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Funkcje serwerowe importuj z `@/lib/supabase-server` (używają `next/headers`).
