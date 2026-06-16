"use client";

import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { ArrowRight, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";

interface Props {
  formId: string;
  intro?: string;
  accentColor?: string;
  footer?: string;
  siteKey?: string;
}

interface Turn { q: string; a: string }
interface Lead { name: string; email: string }
type Phase = "gate" | "loading" | "question" | "summary" | "sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConversationalForm({ formId, intro, accentColor, footer, siteKey }: Props) {
  const accent = accentColor || "#7c3aed";
  const storageKey = `mulbox_conv_${formId}`;
  // reCAPTCHA nie działa na localhost (klucz zarejestrowany dla domeny produkcyjnej),
  // więc na localhoście pomijamy weryfikację, by dało się testować.
  const [isLocal, setIsLocal] = useState(false);
  useEffect(() => {
    const h = window.location.hostname;
    setIsLocal(h === "localhost" || h === "127.0.0.1" || h.endsWith(".local"));
  }, []);
  const hasCaptcha = !!siteKey && siteKey.length > 0 && !isLocal;

  const [phase, setPhase] = useState<Phase>("gate");
  const [lead, setLead] = useState<Lead>({ name: "", email: "" });
  const [captchaOk, setCaptchaOk] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [history, setHistory] = useState<Turn[]>([]);
  const [currentQ, setCurrentQ] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [multi, setMulti] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [anim, setAnim] = useState(true);
  const [resumed, setResumed] = useState(false);
  const [sending, setSending] = useState(false);
  const restored = useRef(false);

  // Wznowienie przerwanej sesji (dane + historia)
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as { lead?: Lead; history?: Turn[] };
        if (saved.lead?.email && Array.isArray(saved.history) && saved.history.length > 0) {
          setLead(saved.lead);
          setHistory(saved.history);
          setResumed(true);
          void converse(saved.history);
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(h: Turn[], l: Lead) {
    try { localStorage.setItem(storageKey, JSON.stringify({ lead: l, history: h })); } catch { /* ignore */ }
  }

  function startConversation() {
    if (!lead.name.trim()) { setError("Podaj imię i nazwisko."); return; }
    if (!EMAIL_RE.test(lead.email.trim())) { setError("Podaj poprawny adres e-mail."); return; }
    if (hasCaptcha && !captchaOk) { setError("Potwierdź, że nie jesteś robotem."); return; }
    setError(null);
    void converse([]);
  }

  async function converse(nextHistory: Turn[]) {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/ai/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, history: nextHistory }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        done?: boolean; question?: string; options?: string[]; multi?: boolean;
        summary?: string; error?: string;
      };
      if (!res.ok) { setError(json.error ?? "Wystąpił błąd. Spróbuj ponownie."); setPhase("question"); return; }

      if (json.done) {
        setSummary(json.summary ?? "");
        setPhase("summary");
      } else {
        setCurrentQ(json.question ?? "");
        setOptions(json.options ?? []);
        setMulti(Boolean(json.multi));
        setPicked([]);
        setOtherText("");
        setText("");
        setPhase("question");
        setAnim(false);
        requestAnimationFrame(() => setAnim(true));
      }
    } catch {
      setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
      setPhase("question");
    }
  }

  function toggle(opt: string) {
    if (multi) setPicked((p) => (p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt]));
    else setPicked([opt]);
  }

  function currentAnswer(): string {
    if (options.length > 0) {
      const parts = [...picked];
      if (otherText.trim()) parts.push(otherText.trim());
      return parts.join(", ");
    }
    return text.trim();
  }

  async function next() {
    const answer = currentAnswer();
    if (!answer) return;
    const nextHistory = [...history, { q: currentQ, a: answer }];
    setHistory(nextHistory);
    persist(nextHistory, lead);
    await converse(nextHistory);
  }

  async function submitAll() {
    setSending(true);
    setError(null);
    const data: Record<string, string> = {
      "Imię i nazwisko": lead.name.trim(),
      "E-mail": lead.email.trim(),
    };
    history.forEach((t, i) => { data[`${i + 1}. ${t.q}`] = t.a; });
    data["📋 Podsumowanie AI"] = summary;
    try {
      const res = await fetch(`/api/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      setPhase("sent");
    } catch {
      setError("Nie udało się wysłać. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  }

  function restart() {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setHistory([]);
    setResumed(false);
    setLead({ name: "", email: "" });
    setCaptchaOk(false);
    recaptchaRef.current?.reset();
    setPhase("gate");
  }

  const answered = history.length;

  return (
    <div className="mt-8 rounded-2xl bg-white shadow-xl border border-slate-100 p-6 overflow-hidden">
      {/* FAZA: brama – dane + weryfikacja */}
      {phase === "gate" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {intro || "Zanim zaczniemy, zostaw swoje dane — odezwiemy się z odpowiedzią."}
          </p>
          <div>
            <label className="label">Imię i nazwisko</label>
            <input
              value={lead.name}
              onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
              placeholder="Jan Kowalski"
              className="input"
            />
          </div>
          <div>
            <label className="label">Adres e-mail</label>
            <input
              type="email"
              value={lead.email}
              onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
              placeholder="jan@przyklad.pl"
              className="input"
            />
          </div>
          {hasCaptcha && (
            <div className="flex justify-center py-1">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey!}
                onChange={(t) => setCaptchaOk(!!t)}
                onExpired={() => setCaptchaOk(false)}
              />
            </div>
          )}
          {isLocal && !!siteKey && (
            <p className="text-xs text-amber-600 text-center">Tryb localhost: weryfikacja reCAPTCHA pominięta (zadziała na produkcji).</p>
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 text-center">{error}</p>
          )}
          <button
            onClick={startConversation}
            className="btn-primary w-full"
            style={{ backgroundColor: accent, borderColor: accent }}
          >
            Rozpocznij <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Pasek postępu */}
      {(phase === "loading" || phase === "question" || phase === "summary") && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-medium text-slate-400">
            {phase === "summary" ? "Gotowe" : `Pytanie ${answered + 1}`}
          </p>
          {resumed && phase !== "summary" && (
            <button onClick={restart} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              <RotateCcw size={12} /> Zacznij od nowa
            </button>
          )}
        </div>
      )}

      {resumed && answered > 0 && phase === "question" && (
        <p className="mb-4 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
          Witaj ponownie, {lead.name.split(" ")[0]}! Wróciliśmy do miejsca, w którym skończyłeś.
        </p>
      )}

      {/* FAZA: ładowanie */}
      {phase === "loading" && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-10 justify-center">
          <Sparkles size={16} className="animate-pulse" /> AI przygotowuje pytanie…
        </div>
      )}

      {/* FAZA: pytanie (jedno naraz, wjeżdża od dołu) */}
      {phase === "question" && (
        <div
          className="transition-all duration-300 ease-out"
          style={{ transform: anim ? "translateY(0)" : "translateY(16px)", opacity: anim ? 1 : 0 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 leading-snug">{currentQ}</h2>
          <div className="mt-4">
            {options.length > 0 ? (
              <div className="space-y-2">
                {multi && <p className="text-xs text-slate-400 mb-1">Możesz wybrać kilka odpowiedzi.</p>}
                {options.map((opt) => {
                  const active = picked.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggle(opt)}
                      className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                        active ? "text-white" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                      style={active ? { backgroundColor: accent, borderColor: accent } : {}}
                    >
                      {opt}
                    </button>
                  );
                })}
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Coś nie pasuje albo chcesz dodać coś od siebie? Napisz tutaj…"
                  rows={2}
                  className="input resize-none text-sm mt-2"
                />
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void next(); } }}
                placeholder="Wpisz odpowiedź…"
                rows={3}
                autoFocus
                className="input resize-none w-full"
              />
            )}
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 text-center">{error}</p>
          )}
          <button
            onClick={() => void next()}
            disabled={!currentAnswer()}
            className="btn-primary w-full mt-5 disabled:opacity-50"
            style={{ backgroundColor: accent, borderColor: accent }}
          >
            Dalej <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* FAZA: podsumowanie dla klienta (Q&A) + streszczenie + wysyłka */}
      {phase === "summary" && (
        <div>
          <QARecap history={history} />
          <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-violet-800 mb-2">
              <Sparkles size={16} /> Streszczenie
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{summary}</p>
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 text-center">{error}</p>
          )}
          <button
            onClick={() => void submitAll()}
            disabled={sending}
            className="btn-primary w-full mt-5 disabled:opacity-50"
            style={{ backgroundColor: accent, borderColor: accent }}
          >
            {sending ? "Wysyłanie…" : "Zapisz i wyślij"}
          </button>
        </div>
      )}

      {/* FAZA: wysłano */}
      {phase === "sent" && (
        <div className="text-center py-8">
          <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: accent }} />
          <h2 className="text-xl font-bold text-slate-900">Dziękujemy, {lead.name.split(" ")[0]}!</h2>
          <p className="mt-2 text-sm text-slate-500">Twoje odpowiedzi zostały wysłane.</p>
        </div>
      )}

      {footer && (
        <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 whitespace-pre-line">
          {footer}
        </p>
      )}
    </div>
  );
}

function QARecap({ history }: { history: Turn[] }) {
  if (history.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800 mb-3">Twoje odpowiedzi</p>
      <ul className="space-y-3">
        {history.map((t, i) => (
          <li key={i}>
            <p className="text-xs text-slate-500">{t.q}</p>
            <p className="text-sm text-slate-900 font-medium">{t.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
