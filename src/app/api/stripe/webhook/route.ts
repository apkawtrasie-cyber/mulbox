import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import type Stripe from "stripe";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const ADMIN_EMAIL = process.env.MULBOX_ADMIN_EMAIL ?? "info@mulbox.ch";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe nie skonfigurowany" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] Weryfikacja podpisu nieudana:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan as "personal" | "business" | undefined;
      if (!userId || !plan) break;

      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      // Subskrypcja – nie ustawiamy plan_expires_at, bo Stripe zarządza cyklem
      await admin.from("profiles").update({
        plan_type: plan,
        plan_expires_at: null,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      }).eq("id", userId);

      console.log(`[stripe/webhook] checkout.session.completed: user=${userId} plan=${plan}`);
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `✅ Nowa subskrypcja Mulbox – plan ${plan}`,
        html: `<p>Użytkownik <strong>${userId}</strong> wykupił plan <strong>${plan}</strong>.</p><p>Stripe customer: ${customerId ?? "brak"}</p>`,
      }).catch((e) => console.warn("[stripe mail]", e));
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const status = sub.status;
      if (status === "active" || status === "trialing") {
        const plan = sub.metadata?.plan as "personal" | "business" | undefined;
        if (plan) {
          await admin.from("profiles").update({ plan_type: plan, plan_expires_at: null }).eq("id", userId);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await admin.from("profiles").update({ plan_type: "free", plan_expires_at: null }).eq("id", userId);
      console.log(`[stripe/webhook] subscription.deleted: user=${userId} → free`);
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `❌ Anulowana subskrypcja Mulbox`,
        html: `<p>Użytkownik <strong>${userId}</strong> anulował subskrypcję. Plan zmieniony na <strong>free</strong>.</p>`,
      }).catch((e) => console.warn("[stripe mail]", e));
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
      if (customerId) {
        await admin.from("profiles").update({ plan_type: "free", plan_expires_at: null }).eq("stripe_customer_id", customerId);
        console.log(`[stripe/webhook] invoice.payment_failed: customer=${customerId} → free`);
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `⚠️ Płatność nieudana – Mulbox`,
          html: `<p>Nieudana płatność dla klienta Stripe: <strong>${customerId}</strong>. Plan zmieniony na <strong>free</strong>.</p>`,
        }).catch((e) => console.warn("[stripe mail]", e));
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
