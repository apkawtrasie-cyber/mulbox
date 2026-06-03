import { Mail, Palette, Link2, BarChart3 } from "lucide-react";

/** Wizualizacja telefonu z formularzem (above the fold). Czysty SVG/HTML – brak ciężkich obrazów. */
export function HeroPhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-[5/6]">
      {/* Floating cards */}
      <FloatCard className="hidden sm:flex top-4 -left-4" icon={<Palette size={18} />} title="Dostosuj" subtitle="Kolory, czcionki, układ i treści" />
      <FloatCard className="hidden sm:flex top-32 -right-2" icon={<Mail size={18} />} title="Zbieraj" subtitle="wiadomości i leady" />
      <FloatCard className="hidden sm:flex bottom-32 -left-6" icon={<Link2 size={18} />} title="Udostępnij" subtitle="link, kod QR lub osadzenie" />
      <FloatCard className="hidden sm:flex bottom-8 -right-4" icon={<BarChart3 size={18} />} title="Zarządzaj" subtitle="swoją listą kontaktów" />

      {/* Phone */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[260px] sm:w-[300px] aspect-[9/19] rounded-[2.5rem] bg-slate-900 p-3 shadow-2xl ring-1 ring-black/10">
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="h-full w-full rounded-[2rem] bg-white p-4 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-700" />
              <span className="font-semibold text-sm">Mulbox</span>
            </div>
            <h3 className="mt-5 font-bold text-slate-900">Skontaktuj się z nami</h3>
            <p className="mt-1 text-xs text-slate-500">Wypełnij formularz, a odezwiemy się do Ciebie.</p>
            <div className="mt-4 space-y-3 text-xs">
              <Field label="Imię i nazwisko" placeholder="Jan Kowalski" />
              <Field label="Email" placeholder="jan@przyklad.pl" />
              <FieldArea label="Wiadomość" placeholder="Napisz swoją wiadomość…" />
              <button className="w-full rounded-xl bg-brand-600 py-2.5 text-white font-medium">Wyślij wiadomość ✈</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatCard({ className = "", icon, title, subtitle }: { className?: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className={`absolute z-10 items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg ${className}`}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500 max-w-[140px]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-700">{label}</label>
      <div className="mt-1 rounded-lg border border-slate-200 px-2.5 py-2 text-slate-400">{placeholder}</div>
    </div>
  );
}

function FieldArea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-700">{label}</label>
      <div className="mt-1 h-16 rounded-lg border border-slate-200 px-2.5 py-2 text-slate-400">{placeholder}</div>
    </div>
  );
}
