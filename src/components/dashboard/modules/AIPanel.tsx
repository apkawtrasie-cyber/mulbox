"use client";

import { useState } from "react";
import { Sparkles, Plus, Lock, Loader2, Check } from "lucide-react";
import type { FormField, PlanType } from "@/lib/types";

interface SuggestedQuestion {
  label: string;
  type: FormField["type"];
  name: string;
  placeholder: string;
}

interface Props {
  plan: PlanType;
  onAddField: (field: Omit<FormField, "id">) => void;
}

export function AIPanel({ plan, onAddField }: Props) {
  const isPremium = plan !== "free";
  const [goal, setGoal] = useState("");
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  async function generate() {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAdded(new Set());
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Błąd generowania.");
      setQuestions(json.questions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nieznany błąd.");
    } finally {
      setLoading(false);
    }
  }

  function addQuestion(q: SuggestedQuestion, idx: number) {
    onAddField({ type: q.type, label: q.label, name: q.name, placeholder: q.placeholder, required: false });
    setAdded((prev) => new Set([...prev, idx]));
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <Lock size={24} />
        </div>
        <h3 className="font-semibold text-slate-900">Funkcja Premium</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Asystent AI dostępny jest w planach Personal i Business. Ulepsz konto, aby generować pytania automatycznie.
        </p>
        <a href="/pricing" className="btn-primary text-sm">
          Sprawdź plany
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <label className="label">Opisz cel formularza</label>
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
        placeholder="Np. Ankieta dla klientów warsztatu samochodowego, zbieramy opinie po naprawie."
        className="input resize-none text-sm"
      />
      <button
        onClick={generate}
        disabled={loading || !goal.trim()}
        className="btn-primary mt-3 disabled:opacity-60"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Generuję…</>
          : <><Sparkles size={15} /> Generuj pytania</>}
      </button>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {questions.length > 0 && (
        <div className="mt-4 flex-1 overflow-auto space-y-2">
          <p className="text-xs text-slate-400 mb-2">Kliknij + aby dodać pytanie do formularza:</p>
          {questions.map((q, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                added.has(i) ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-violet-300"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{q.label}</p>
                <span className="inline-block mt-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-mono text-slate-500 uppercase">
                  {q.type}
                </span>
              </div>
              <button
                onClick={() => addQuestion(q, i)}
                disabled={added.has(i)}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:bg-emerald-500 transition-colors"
                title="Dodaj do formularza"
              >
                {added.has(i) ? <Check size={13} /> : <Plus size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {questions.length === 0 && !loading && !error && (
        <p className="mt-8 text-center text-sm text-slate-400">
          Opisz cel formularza i kliknij „Generuj pytania".
        </p>
      )}
    </div>
  );
}
