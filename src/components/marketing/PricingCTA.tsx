"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase";

interface Props {
  plan: "free" | "personal" | "business";
  label: string;
  className?: string;
}

export function PricingCTA({ plan, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (plan === "free") {
      router.push("/register");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/register?plan=${plan}`);
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Błąd Stripe – sprawdź konfigurację.");
      }
    } catch {
      alert("Błąd połączenia ze Stripe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${className} flex items-center justify-center gap-2 disabled:opacity-60`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {label}
    </button>
  );
}
