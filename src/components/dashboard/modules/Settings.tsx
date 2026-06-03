"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Lock, Globe, Shield, Mail } from "lucide-react";
import type { FormRecord, PlanType } from "@/lib/types";

interface Props {
  forms: FormRecord[];
  selectedForm: FormRecord | null;
  onSelectForm: (id: string) => void;
  plan: PlanType;
}

/** Moduł 4: Zaawansowane ustawienia – Free vs Premium. */
export function Settings({ forms, selectedForm, onSelectForm, plan }: Props) {
  const router = useRouter();
  const isPremium = plan !== "free";
  const [state, setState] = useState({
    notification_email: "",
    redirect_url: "",
    recaptcha_site_key: "",
    recaptcha_secret_key: "",
    autoresponder_enabled: false,
    autoresponder_subject: "",
    autoresponder_body: "",
    custom_email_template: "",
    notification_signature: "",
    formpage_enabled: false,
    formpage_title: "",
    formpage_description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedForm) return;
    setState({
      notification_email: selectedForm.notification_email ?? "",
      redirect_url: selectedForm.redirect_url ?? "",
      recaptcha_site_key: selectedForm.recaptcha_site_key ?? "",
      recaptcha_secret_key: selectedForm.recaptcha_secret_key ?? "",
      autoresponder_enabled: selectedForm.autoresponder_enabled ?? false,
      autoresponder_subject: selectedForm.autoresponder_subject ?? "",
      autoresponder_body: selectedForm.autoresponder_body ?? "",
      custom_email_template: selectedForm.custom_email_template ?? "",
      notification_signature: selectedForm.notification_signature ?? "",
      formpage_enabled: selectedForm.config?.formpage_enabled ?? false,
      formpage_title: selectedForm.config?.formpage_title ?? "",
      formpage_description: selectedForm.config?.formpage_description ?? "",
    });
  }, [selectedForm?.id]);

  if (!selectedForm) {
    return <div className="card text-center py-12 text-slate-500">Wybierz formularz, aby zobaczyć ustawienia.</div>;
  }

  async function save() {
    if (!selectedForm) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        notification_email: state.notification_email || null,
        redirect_url: isPremium ? state.redirect_url || null : null,
        recaptcha_site_key: isPremium ? state.recaptcha_site_key || null : null,
        recaptcha_secret_key: isPremium ? state.recaptcha_secret_key || null : null,
        autoresponder_enabled: isPremium && state.autoresponder_enabled,
        autoresponder_subject: state.autoresponder_subject || null,
        autoresponder_body: state.autoresponder_body || null,
        custom_email_template: state.custom_email_template || null,
        notification_signature: state.notification_signature || null,
        config: {
          ...selectedForm.config,
          formpage_enabled: isPremium && state.formpage_enabled,
          formpage_title: state.formpage_title,
          formpage_description: state.formpage_description,
        },
      };
      await fetch(`/api/forms/${selectedForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.refresh();
    } finally { setSaving(false); }
  }

  function set<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ustawienia formularza</h1>
          <p className="text-sm text-slate-500">Skonfiguruj zaawansowane funkcje wybranego formularza.</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedForm.id} onChange={(e) => onSelectForm(e.target.value)} className="input max-w-xs">
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {saving ? "Zapisuję…" : "Zapisz"}
          </button>
        </div>
      </header>

      <Card title="E-mail powiadomień" icon={<Mail size={18} />}>
        <label className="label">Adres e-mail, na który trafią powiadomienia o nowych zgłoszeniach</label>
        <input
          type="email"
          value={state.notification_email}
          onChange={(e) => set("notification_email", e.target.value)}
          placeholder="twoj@email.pl"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Domyślnie powiadomienia idą na adres Twojego konta. Wpisz inny e-mail, jeśli chcesz je przekierować.
        </p>
      </Card>

      <Card title="Custom Redirect URL" icon={<Globe size={18} />} premium={!isPremium}>
        <label className="label">Adres URL strony sukcesu</label>
        <input disabled={!isPremium} value={state.redirect_url} onChange={(e) => set("redirect_url", e.target.value)}
          placeholder="https://twojastrona.pl/dziekujemy" className="input disabled:bg-slate-50" />
        <p className="mt-1 text-xs text-slate-500">Po wysłaniu formularza klient zostanie przekierowany pod ten adres.</p>
      </Card>

      <Card title="Integracja reCAPTCHA" icon={<Shield size={18} />} premium={!isPremium}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Site Key</label>
            <input disabled={!isPremium} value={state.recaptcha_site_key} onChange={(e) => set("recaptcha_site_key", e.target.value)} className="input font-mono text-xs disabled:bg-slate-50" />
          </div>
          <div>
            <label className="label">Secret Key</label>
            <input disabled={!isPremium} type="password" value={state.recaptcha_secret_key} onChange={(e) => set("recaptcha_secret_key", e.target.value)} className="input font-mono text-xs disabled:bg-slate-50" />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Klucze pobierzesz z konsoli Google reCAPTCHA (v2 lub v3).</p>
      </Card>

      <Card title="Personalizacja powiadomień" icon={<Mail size={18} />}>
        <label className="label">Szablon maila do Ciebie (powiadomienie)</label>
        <textarea rows={4} value={state.custom_email_template} onChange={(e) => set("custom_email_template", e.target.value)}
          placeholder={"Cześć! Masz nowego leada od {name} ({email}).\n\nWiadomość:\n{message}"}
          className="input resize-none font-mono text-xs" />
        <p className="mt-1 text-xs text-slate-500">Tagi dostępne: <code>{"{name}, {email}, {message}"}</code> – wszystkie pola formularza.</p>

        <label className="label mt-4">Twój podpis (footer maila)</label>
        <textarea rows={2} value={state.notification_signature} onChange={(e) => set("notification_signature", e.target.value)}
          placeholder="Pozdrawiamy, Zespół Twojej Firmy" className="input resize-none" />
      </Card>

      <Card title="Autoresponder do klienta" icon={<Mail size={18} />} premium={!isPremium}>
        <label className="flex items-center gap-2 text-sm">
          <input disabled={!isPremium} type="checkbox" checked={state.autoresponder_enabled} onChange={(e) => set("autoresponder_enabled", e.target.checked)} />
          Włącz automatyczną odpowiedź dla klienta
        </label>
        <label className="label mt-4">Temat</label>
        <input disabled={!isPremium} value={state.autoresponder_subject} onChange={(e) => set("autoresponder_subject", e.target.value)}
          placeholder="Dziękujemy za kontakt!" className="input disabled:bg-slate-50" />
        <label className="label mt-3">Treść</label>
        <textarea disabled={!isPremium} rows={4} value={state.autoresponder_body} onChange={(e) => set("autoresponder_body", e.target.value)}
          placeholder={"Cześć {name},\n\ndziękujemy za wiadomość. Odezwiemy się najszybciej jak to możliwe."}
          className="input resize-none disabled:bg-slate-50" />
      </Card>

      <Card title="Dynamiczna strona /p/[id]" icon={<Globe size={18} />} premium={!isPremium}>
        <label className="flex items-center gap-2 text-sm">
          <input disabled={!isPremium} type="checkbox" checked={state.formpage_enabled} onChange={(e) => set("formpage_enabled", e.target.checked)} />
          Aktywuj publiczny landing page formularza
        </label>
        <label className="label mt-4">Tytuł</label>
        <input disabled={!isPremium} value={state.formpage_title} onChange={(e) => set("formpage_title", e.target.value)} className="input disabled:bg-slate-50" placeholder="Skontaktuj się z nami" />
        <label className="label mt-3">Opis</label>
        <textarea disabled={!isPremium} rows={2} value={state.formpage_description} onChange={(e) => set("formpage_description", e.target.value)}
          placeholder="Wypełnij formularz, a odezwiemy się do Ciebie." className="input resize-none disabled:bg-slate-50" />
      </Card>
    </section>
  );
}

function Card({ title, icon, premium, children }: { title: string; icon: React.ReactNode; premium?: boolean; children: React.ReactNode }) {
  return (
    <section className="card relative">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900"><span className="text-brand-700">{icon}</span> {title}</h2>
        {premium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-0.5"><Lock size={12} /> Premium</span>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
