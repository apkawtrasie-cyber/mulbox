"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Wand2, Inbox as InboxIcon, Settings as SettingsIcon, FileText, CreditCard } from "lucide-react";
import type { FormRecord, Profile, SubmissionRecord } from "@/lib/types";
import { FormsList } from "./modules/FormsList";
import { FormBuilder } from "./modules/FormBuilder";
import { Inbox } from "./modules/Inbox";
import { Settings } from "./modules/Settings";
import { BriefBuilder } from "./modules/BriefBuilder";
import { RedeemCode } from "./RedeemCode";
import { Billing } from "./modules/Billing";

type TabId = "forms" | "builder" | "brief" | "inbox" | "settings" | "billing";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "forms", label: "Formularze", icon: LayoutGrid },
  { id: "builder", label: "Kreator", icon: Wand2 },
  { id: "brief", label: "Brief", icon: FileText },
  { id: "inbox", label: "Skrzynka", icon: InboxIcon },
  { id: "settings", label: "Ustawienia", icon: SettingsIcon },
  { id: "billing", label: "Płatności", icon: CreditCard },
];

interface Props {
  profile: Profile;
  forms: FormRecord[];
  submissions: SubmissionRecord[];
}

export function DashboardTabs({ profile, forms, submissions }: Props) {
  const [active, setActive] = useState<TabId>("forms");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(forms[0]?.id ?? null);
  const selectedForm = forms.find((f) => f.id === selectedFormId) ?? null;

  // Auto-wybór pierwszego formularza gdy lista się zmieni (np. po utworzeniu).
  useEffect(() => {
    if (!selectedFormId && forms.length > 0) setSelectedFormId(forms[0].id);
    if (selectedFormId && !forms.find((f) => f.id === selectedFormId)) {
      setSelectedFormId(forms[0]?.id ?? null);
    }
  }, [forms, selectedFormId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="card lg:sticky lg:top-24 self-start">
        <p className="text-sm sm:text-xs uppercase tracking-wide text-slate-500">Witaj,</p>
        <p className="text-xl sm:text-lg font-semibold text-slate-900 truncate">{profile.full_name || profile.email}</p>
        {profile.plan_expires_at && (
          <p className="mt-1 text-xs text-amber-600">
            Plan wygasa: {new Date(profile.plan_expires_at).toLocaleDateString("pl-PL")}
          </p>
        )}
        <nav className="mt-5 grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-col gap-2 lg:gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex flex-col sm:flex-row lg:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 rounded-xl px-2 py-3 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} /><span>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <RedeemCode />
      </aside>

      {/* Content */}
      <div>
        {active === "forms" && (
          <FormsList forms={forms} onSelect={(id: string) => { setSelectedFormId(id); setActive("builder"); }} />
        )}
        {active === "builder" && (
          <FormBuilder
            forms={forms}
            selectedForm={selectedForm}
            onSelectForm={setSelectedFormId}
            plan={profile.plan_type}
          />
        )}
        {active === "brief" && (
          <BriefBuilder
            briefForms={forms.filter((f) => f.config?.form_type === "brief")}
            plan={profile.plan_type}
            onEditForm={(id) => { setSelectedFormId(id); setActive("builder"); }}
          />
        )}
        {active === "inbox" && (
          <Inbox forms={forms} submissions={submissions} plan={profile.plan_type} />
        )}
        {active === "settings" && (
          <Settings forms={forms} selectedForm={selectedForm} onSelectForm={setSelectedFormId} plan={profile.plan_type} />
        )}
        {active === "billing" && (
          <Billing profile={profile} />
        )}
      </div>
    </div>
  );
}
