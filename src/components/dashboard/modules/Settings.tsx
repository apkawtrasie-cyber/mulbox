"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save, Lock, Globe, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import type { FormRecord, PlanType } from "@/lib/types";

interface Props {
  forms: FormRecord[];
  selectedForm: FormRecord | null;
  onSelectForm: (id: string) => void;
  plan: PlanType;
}

/** Moduł 4: Zaawansowane ustawienia – Free vs Premium. */
export function Settings({ forms, selectedForm, onSelectForm, plan }: Props) {
  const t = useTranslations("Dashboard");
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
    formpage_logo_url: "",
    formpage_bg_color: "#f8fafc",
    formpage_accent_color: "#7c3aed",
    formpage_footer: "",
    formpage_wide: false,
  });
  const autoBodyRef = useRef<HTMLTextAreaElement>(null);
  const customTplRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

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
      formpage_logo_url: selectedForm.config?.formpage_logo_url ?? "",
      formpage_bg_color: selectedForm.config?.formpage_bg_color ?? "#f8fafc",
      formpage_accent_color: selectedForm.config?.formpage_accent_color ?? "#7c3aed",
      formpage_footer: selectedForm.config?.formpage_footer ?? "",
      formpage_wide: selectedForm.config?.formpage_wide ?? false,
    });
  }, [selectedForm]);

  if (!selectedForm) {
    return <div className="card text-center py-12 text-slate-500">{t("settingsNoForm")}</div>;
  }

  async function save() {
    if (!selectedForm) return;
    setSaving(true);
    setToast(null);
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
          formpage_logo_url: state.formpage_logo_url || undefined,
          formpage_bg_color: state.formpage_bg_color,
          formpage_accent_color: state.formpage_accent_color,
          formpage_footer: state.formpage_footer || undefined,
          formpage_wide: isPremium && state.formpage_wide,
        },
      };
      const res = await fetch(`/api/forms/${selectedForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        setToast({ type: "err", msg: err.error ?? `Błąd serwera (${res.status})` });
        return;
      }
      setToast({ type: "ok", msg: t("settingsSaved") });
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    } catch (e) {
      setToast({ type: "err", msg: e instanceof Error ? e.message : "Błąd połączenia" });
    } finally { setSaving(false); }
  }

  function set<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function insertTag(tag: string, ref: React.RefObject<HTMLTextAreaElement>, field: "autoresponder_body" | "custom_email_template") {
    const el = ref.current;
    const token = `{${tag}}`;
    if (!el) { set(field, (state[field] as string) + token); return; }
    const start = el.selectionStart ?? (state[field] as string).length;
    const end = el.selectionEnd ?? start;
    const cur = state[field] as string;
    set(field, cur.slice(0, start) + token + cur.slice(end));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); }, 0);
  }

  const fieldTags = selectedForm?.config?.fields?.map((f) => f.name) ?? [];

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("settingsTitle")}</h1>
          <p className="text-sm text-slate-500">{t("settingsSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedForm.id} onChange={(e) => onSelectForm(e.target.value)} className="input max-w-xs">
            {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="flex items-center gap-2">
            {toast && (
              <span className={`flex items-center gap-1.5 text-sm font-medium ${
                toast.type === "ok" ? "text-emerald-600" : "text-rose-600"
              }`}>
                {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {toast.msg}
              </span>
            )}
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
              <Save size={16} /> {saving ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </header>

      <Card title={t("notifEmailSection")} icon={<Mail size={18} />}>
        <label className="label">{t("notifEmailLabel")}</label>
        <input
          type="email"
          value={state.notification_email}
          onChange={(e) => set("notification_email", e.target.value)}
          placeholder={t("notifEmailPlaceholder")}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">{t("notifEmailHint")}</p>
      </Card>

      <Card title={t("redirectSection")} icon={<Globe size={18} />} premium={!isPremium}>
        <label className="label">{t("redirectLabel")}</label>
        <input disabled={!isPremium} value={state.redirect_url} onChange={(e) => set("redirect_url", e.target.value)}
          placeholder="https://twojastrona.pl/dziekujemy" className="input disabled:bg-slate-50" />
        <p className="mt-1 text-xs text-slate-500">{t("redirectHint")}</p>
      </Card>

      <Card title={t("notifCustomSection")} icon={<Mail size={18} />}>
        <label className="label">{t("notifTemplateLabel")}</label>
        <textarea
          ref={customTplRef}
          rows={4} value={state.custom_email_template}
          onChange={(e) => set("custom_email_template", e.target.value)}
          placeholder={"Cześć! Masz nowego leada od {name} ({email}).\n\nWiadomość:\n{message}"}
          className="input resize-none font-mono text-xs"
        />
        {fieldTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400">{t("insertTag")}</span>
            {fieldTags.map((tag) => (
              <button key={tag} type="button"
                onClick={() => insertTag(tag, customTplRef, "custom_email_template")}
                className="rounded bg-violet-50 px-2 py-0.5 font-mono text-xs text-violet-700 hover:bg-violet-100">
                {`{${tag}}`}
              </button>
            ))}
          </div>
        )}

        <label className="label mt-4">{t("notifSignatureLabel")}</label>
        <textarea rows={2} value={state.notification_signature} onChange={(e) => set("notification_signature", e.target.value)}
          placeholder={t("notifSignaturePlaceholder")} className="input resize-none" />
      </Card>

      <Card title={t("autoresponderSection")} icon={<Mail size={18} />} premium={!isPremium}>
        <label className="flex items-center gap-2 text-sm">
          <input disabled={!isPremium} type="checkbox" checked={state.autoresponder_enabled} onChange={(e) => set("autoresponder_enabled", e.target.checked)} />
          {t("autoresponderEnable")}
        </label>
        <label className="label mt-4">{t("autoresponderSubjectLabel")}</label>
        <input disabled={!isPremium} value={state.autoresponder_subject} onChange={(e) => set("autoresponder_subject", e.target.value)}
          placeholder={t("autoresponderSubjectPlaceholder")} className="input disabled:bg-slate-50" />
        <label className="label mt-3">{t("autoresponderBodyLabel")}</label>
        <textarea
          ref={autoBodyRef}
          disabled={!isPremium} rows={5}
          value={state.autoresponder_body}
          onChange={(e) => set("autoresponder_body", e.target.value)}
          placeholder={"Cześć {name},\n\ndziękujemy za wiadomość. Odezwiemy się najszybciej jak to możliwe."}
          className="input resize-none disabled:bg-slate-50"
        />
        {fieldTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400">Wstaw:</span>
            {fieldTags.map((tag) => (
              <button key={tag} type="button" disabled={!isPremium}
                onClick={() => insertTag(tag, autoBodyRef, "autoresponder_body")}
                className="rounded bg-violet-50 px-2 py-0.5 font-mono text-xs text-violet-700 hover:bg-violet-100 disabled:opacity-40">
                {`{${tag}}`}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card title={t("formpageSection")} icon={<Globe size={18} />} premium={!isPremium}>
        <label className="flex items-center gap-2 text-sm">
          <input disabled={!isPremium} type="checkbox" checked={state.formpage_enabled} onChange={(e) => set("formpage_enabled", e.target.checked)} />
          {t("formpageEnable")}
        </label>
        <label className="flex items-center gap-2 text-sm mt-3">
          <input disabled={!isPremium} type="checkbox" checked={state.formpage_wide} onChange={(e) => set("formpage_wide", e.target.checked)} />
          {t("formpageWide")}
        </label>
        <label className="label mt-4">{t("formpageTitleLabel")}</label>
        <input disabled={!isPremium} value={state.formpage_title} onChange={(e) => set("formpage_title", e.target.value)} className="input disabled:bg-slate-50" placeholder={t("formpageTitlePlaceholder")} />
        <label className="label mt-3">{t("formpageDescLabel")}</label>
        <textarea disabled={!isPremium} rows={2} value={state.formpage_description} onChange={(e) => set("formpage_description", e.target.value)}
          placeholder={t("formpageDescPlaceholder")} className="input resize-none disabled:bg-slate-50" />

        <label className="label mt-4">{t("formpageLogoLabel")}</label>
        <input disabled={!isPremium} value={state.formpage_logo_url} onChange={(e) => set("formpage_logo_url", e.target.value)}
          placeholder={t("formpageLogoPlaceholder")} className="input disabled:bg-slate-50" />
        {state.formpage_logo_url && (
          <img src={state.formpage_logo_url} alt="podgląd logo" className="mt-2 h-12 object-contain rounded border border-slate-100" />
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t("formpageBgColorLabel")}</label>
            <div className="flex items-center gap-2">
              <input disabled={!isPremium} type="color" value={state.formpage_bg_color}
                onChange={(e) => set("formpage_bg_color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200 disabled:opacity-50" />
              <input disabled={!isPremium} value={state.formpage_bg_color}
                onChange={(e) => set("formpage_bg_color", e.target.value)}
                className="input font-mono text-xs disabled:bg-slate-50" />
            </div>
          </div>
          <div>
            <label className="label">{t("formpageAccentColorLabel")}</label>
            <div className="flex items-center gap-2">
              <input disabled={!isPremium} type="color" value={state.formpage_accent_color}
                onChange={(e) => set("formpage_accent_color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200 disabled:opacity-50" />
              <input disabled={!isPremium} value={state.formpage_accent_color}
                onChange={(e) => set("formpage_accent_color", e.target.value)}
                className="input font-mono text-xs disabled:bg-slate-50" />
            </div>
          </div>
        </div>

        <label className="label mt-4">{t("formpageFooterLabel")}</label>
        <textarea disabled={!isPremium} rows={2} value={state.formpage_footer}
          onChange={(e) => set("formpage_footer", e.target.value)}
          placeholder={t("formpageFooterPlaceholder")}
          className="input resize-none disabled:bg-slate-50" />
      </Card>
    </section>
  );
}

function Card({ title, icon, premium, children }: { title: string; icon: React.ReactNode; premium?: boolean; children: React.ReactNode }) {
  const t = useTranslations("Dashboard");
  return (
    <section className="card relative">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900"><span className="text-brand-700">{icon}</span> {title}</h2>
        {premium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-0.5"><Lock size={12} /> {t("premiumBadge")}</span>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
