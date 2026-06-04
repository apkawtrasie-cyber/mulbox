import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe nie skonfigurowany" }, { status: 503 });
  }

  const supabase = createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { plan: "personal" | "business" | "test" };
  const priceId = PRICE_IDS[body.plan];
  if (!priceId || priceId.startsWith("price_UZUPEŁNIJ")) {
    return NextResponse.json({ error: "Price ID nie skonfigurowany" }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .maybeSingle();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Plan 'test' (1 zł) daje taki sam dostęp jak 'personal'
  const effectivePlan = body.plan === "test" ? "personal" : body.plan;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan: effectivePlan },
    },
    metadata: { supabase_user_id: user.id, plan: effectivePlan },
    success_url: `${baseUrl}/dashboard?payment=success`,
    cancel_url: `${baseUrl}/pricing?payment=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
