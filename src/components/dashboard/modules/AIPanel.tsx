"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Loader2, Check, Crown, X } from "lucide-react";
import type { FormField, PlanType } from "@/lib/types";

const FREE_LIMIT = 5;
const FREE_MAX_Q = 10;
const STORAGE_KEY = "mulbox_ai_gen_count";

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
  const [maxQuestions, setMaxQuestions] = useState(8);
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [genCount, setGenCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!isPremium) {
      setGenCount(parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10));
    }
  }, [isPremium]);

  const effectiveMax = isPremium ? maxQuestions : Math.min(maxQuestions, FREE_MAX_Q);
  const freeExhausted = !isPremium && genCount >= FREE_LIMIT;
  const freeRemaining = FREE_LIMIT - genCount;

  async function generate() {
    if (!goal.trim()) return;
    if (freeExhausted) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAdded(new Set());
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, maxQuestions: effectiveMax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Błąd generowania.");
      setQuestions(json.questions ?? []);
      if (!isPremium) {
        const next = genCount + 1;
        setGenCount(next);
        localStorage.setItem(STORAGE_KEY, String(next));
        if (next >= FREE_LIMIT) setShowUpgradeModal(true);
      }
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

  return (
    <>
      {/* Modal upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X size={15} />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mx-auto mb-4">
              <Crown size={26} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">Limit darmowych generacji</h3>
            <p className="text-sm text-slate-500 mb-2">
              Wykorzystałeś <strong>{FREE_LIMIT}/{FREE_LIMIT}</strong> darmowych generacji pytań AI.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Przejdź na plan <strong>Personal lub Business</strong>, aby korzystać bez limitów i generować do 15 pytań jednorazowo.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary flex-1 text-sm">
                Zamknij
              </button>
              <a href="/pricing" className="btn-primary flex-1 text-sm">
                <Crown size={14} /> Ulepsz plan
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Free plan info bar */}
        {!isPremium && (
          <div className={`mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs ${
            freeExhausted
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : freeRemaining <= 2
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-50 text-slate-500 border border-slate-200"
          }`}>
            <span>
              {freeExhausted
                ? "Limit darmowych generacji wyczerpany."
                : `Darmowy limit: ${genCount}/${FREE_LIMIT} generacji · maks. ${FREE_MAX_Q} pytań`}
            </span>
            {freeExhausted && (
              <a href="/pricing" className="font-semibold underline whitespace-nowrap">Ulepsz plan →</a>
            )}
          </div>
        )}

        <label className="label">Opisz cel formularza</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="Np. Ankieta dla klientów warsztatu samochodowego, zbieramy opinie po naprawie."
          className="input resize-none text-sm"
        />

        {/* Slider liczby pytań */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">Liczba pytań</label>
            <span className="text-xs font-semibold text-violet-700">{effectiveMax}</span>
          </div>
          <input
            type="range"
            min={3}
            max={isPremium ? 15 : FREE_MAX_Q}
            step={1}
            value={maxQuestions}
            onChange={(e) => setMaxQuestions(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>3</span>
            <span>{isPremium ? "15" : `${FREE_MAX_Q} (free)`}</span>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !goal.trim() || freeExhausted}
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
    </>
  );
}
