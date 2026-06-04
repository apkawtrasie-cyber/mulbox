import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY nie ustawiony – płatności nieaktywne.");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" })
  : null;

export const PRICE_IDS: Record<"personal" | "business", string | undefined> = {
  personal: process.env.STRIPE_PRICE_PERSONAL,
  business: process.env.STRIPE_PRICE_BUSINESS,
};
