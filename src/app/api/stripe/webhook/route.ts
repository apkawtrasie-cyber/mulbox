import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";
import type Stripe from "stripe";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const ADMIN_EMAIL = process.env.MULBOX_ADMIN_EMAIL ?? "info@mulbox.ch";

const PLAN_LABEL: Record<string, string> = {
  personal: "Personal",
  business: "Business",
  free: "Free",
};

function fmtDate(unix: number | null | undefined): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtAmount(cents: number | null | undefined, currency: string | null | undefined): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toFixed(2).replace(".", ",");
  return `${amount} ${(currency ?? "pln").toUpperCase()}`;
}

function emailLayout(title: string, bodyHtml: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;background:#fff">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="margin:0;font-size:22px;color:#7c3aed">Mulbox</h1>
    </div>
    <h2 style="margin:0 0 16px;font-size:18px">${title}</h2>
    ${bodyHtml}
    <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;text-align:center">
      Mulbox – generator formularzy. Zarządzaj subskrypcją na <a href="https://mulbox.ch/dashboard" style="color:#7c3aed">mulbox.ch/dashboard</a>
    </p>
  </div>`;
}

function detailsTable(rows: [string, string][]): string {
  return `<table style="width:100%;margin:16px 0;border-collapse:collapse">${rows.map(([k, v]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;white-space:nowrap">${k}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:500">${v}</td>
    </tr>`).join("")}</table>`;
}

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
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      // Subskrypcja – nie ustawiamy plan_expires_at, bo Stripe zarządza cyklem
      await admin.from("profiles").update({
        plan_type: plan,
        plan_expires_at: null,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      }).eq("id", userId);

      console.log(`[stripe/webhook] checkout.session.completed: user=${userId} plan=${plan}`);

      // Pobierz dodatkowe szczegóły subskrypcji (data odnowienia, kwota)
      let nextBilling = "—";
      let amount = "—";
      let customerName = session.customer_details?.name ?? "—";
      const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

      if (subscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });
          nextBilling = fmtDate((sub as Stripe.Subscription & { current_period_end?: number }).current_period_end);
          const price = sub.items.data[0]?.price;
          amount = fmtAmount(price?.unit_amount, price?.currency);
        } catch (e) {
          console.warn("[stripe/webhook] retrieve subscription failed", e);
        }
      }

      const planLabel = PLAN_LABEL[plan] ?? plan;
      const startDate = fmtDate(Math.floor(Date.now() / 1000));

      const clientDetails = detailsTable([
        ["Plan", planLabel],
        ["Cena", amount],
        ["Data aktywacji", startDate],
        ["Kolejne odnowienie", nextBilling],
        ["ID klienta Stripe", customerId ?? "—"],
        ["ID subskrypcji", subscriptionId ?? "—"],
        ["ID transakcji", session.id],
      ]);

      // Mail do klienta
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `✅ Aktywacja subskrypcji Mulbox – plan ${planLabel}`,
          html: emailLayout(
            `Dziękujemy za zakup subskrypcji!`,
            `<p>Witaj <strong>${customerName}</strong>,</p>
             <p>Twój plan <strong>${planLabel}</strong> został pomyślnie aktywowany. Poniżej szczegóły do faktury i ewentualnych reklamacji:</p>
             ${clientDetails}
             <p style="margin-top:16px">W każdej chwili możesz zarządzać lub anulować subskrypcję z poziomu <a href="https://mulbox.ch/dashboard" style="color:#7c3aed">panelu klienta</a>.</p>
             <p style="color:#64748b;font-size:13px;margin-top:24px">Zachowaj ten mail – zawiera identyfikatory potrzebne w razie kontaktu z pomocą.</p>`
          ),
        }).catch((e) => console.warn("[stripe mail client]", e));
      }

      // Mail do admina
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `✅ Nowa subskrypcja Mulbox – ${planLabel} (${amount})`,
        html: emailLayout(
          `Nowa subskrypcja – ${planLabel}`,
          `${detailsTable([
            ["Klient", customerName],
            ["E-mail klienta", customerEmail ?? "—"],
            ["Plan", planLabel],
            ["Cena", amount],
            ["Data aktywacji", startDate],
            ["Kolejne odnowienie", nextBilling],
            ["Supabase user ID", userId],
            ["ID klienta Stripe", customerId ?? "—"],
            ["ID subskrypcji", subscriptionId ?? "—"],
            ["ID transakcji", session.id],
          ])}`
        ),
      }).catch((e) => console.warn("[stripe mail admin]", e));
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

      // Pobierz dane klienta z bazy do maila
      const { data: profile } = await admin.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
      const customerEmail = profile?.email;
      const customerName = profile?.full_name ?? "Kliencie";
      const cancelDate = fmtDate(Math.floor(Date.now() / 1000));

      const details = detailsTable([
        ["ID subskrypcji", sub.id],
        ["ID klienta Stripe", typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? "—"],
        ["Data anulowania", cancelDate],
      ]);

      // Mail do klienta
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Subskrypcja Mulbox została anulowana`,
          html: emailLayout(
            `Subskrypcja anulowana`,
            `<p>Witaj <strong>${customerName}</strong>,</p>
             <p>Twoja subskrypcja Mulbox została anulowana. Twój plan został zmieniony na <strong>Free</strong>.</p>
             ${details}
             <p style="margin-top:16px">Możesz ponownie aktywować subskrypcję w dowolnej chwili na <a href="https://mulbox.ch/pricing" style="color:#7c3aed">stronie cennika</a>.</p>`
          ),
        }).catch((e) => console.warn("[stripe mail client]", e));
      }

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `❌ Anulowana subskrypcja Mulbox`,
        html: emailLayout(
          `Subskrypcja anulowana`,
          `${detailsTable([
            ["Klient", customerName],
            ["E-mail klienta", customerEmail ?? "—"],
            ["Supabase user ID", userId],
            ["ID subskrypcji", sub.id],
            ["ID klienta Stripe", typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? "—"],
            ["Data anulowania", cancelDate],
          ])}`
        ),
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
