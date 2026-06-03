"use client";

import { useState } from "react";
import { Ticket, CheckCircle2, AlertCircle } from "lucide-react";

export function RedeemCode({ onSuccess }: { onSuccess?: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json() as { ok?: boolean; error?: string; plan?: string; duration_days?: number };
      if (json.ok) {
        setResult({ ok: true, message: `Plan ${json.plan?.toUpperCase()} aktywny przez ${json.duration_days} dni!` });
        setCode("");
        setTimeout(() => { onSuccess?.(); window.location.reload(); }, 1500);
      } else {
        setResult({ ok: false, message: json.error ?? "Nieznany błąd." });
      }
    } catch {
      setResult({ ok: false, message: "Błąd połączenia." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRedeem} className="mt-5 border-t border-slate-100 pt-5 space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Ticket size={13} /> Kod promocyjny
      </p>
      <div className="flex gap-1.5">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="MULBOX-XXXX-XXXX"
          className="input py-2 text-xs font-mono flex-1 min-w-0"
          maxLength={16}
        />
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="btn-primary py-2 px-3 text-xs shrink-0 disabled:opacity-60"
        >
          {loading ? "…" : "Aktywuj"}
        </button>
      </div>
      {result && (
        <p className={`flex items-center gap-1.5 text-xs ${result.ok ? "text-green-700" : "text-rose-600"}`}>
          {result.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {result.message}
        </p>
      )}
    </form>
  );
}
