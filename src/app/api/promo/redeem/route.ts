import { NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: "Podaj kod." }, { status: 400 });

  const service = createServiceSupabase();
  const normalizedCode = code.trim().toUpperCase();

  // 1. Pobierz kod
  const { data: promo, error: promoErr } = await service
    .from("promo_codes")
    .select("*")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle();

  if (promoErr || !promo) {
    return NextResponse.json({ error: "Kod jest nieważny lub wygasł." }, { status: 400 });
  }

  if (promo.used_count >= promo.max_uses) {
    return NextResponse.json({ error: "Ten kod został już w pełni wykorzystany." }, { status: 400 });
  }

  // 2. Sprawdź czy użytkownik już go użył
  const { data: existing } = await service
    .from("code_redemptions")
    .select("id")
    .eq("code_id", promo.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Już aktywowałeś ten kod." }, { status: 400 });
  }

  // 3. Oblicz datę wygaśnięcia planu
  const now = new Date();
  const planExpiresAt = new Date(now.getTime() + promo.duration_days * 24 * 60 * 60 * 1000);

  // 4. Zapisz realizację
  await service.from("code_redemptions").insert({
    code_id: promo.id,
    user_id: user.id,
    plan_expires_at: planExpiresAt.toISOString(),
  });

  // 5. Zaktualizuj licznik kodu
  await service
    .from("promo_codes")
    .update({ used_count: promo.used_count + 1 })
    .eq("id", promo.id);

  // 6. Ustaw plan użytkownika
  await service
    .from("profiles")
    .update({
      plan_type: promo.plan_type,
      plan_expires_at: planExpiresAt.toISOString(),
    })
    .eq("id", user.id);

  return NextResponse.json({
    ok: true,
    plan: promo.plan_type,
    expires_at: planExpiresAt.toISOString(),
    duration_days: promo.duration_days,
  });
}
