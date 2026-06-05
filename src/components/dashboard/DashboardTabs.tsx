"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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


interface Props {
  profile: Profile;
  forms: FormRecord[];
  submissions: SubmissionRecord[];
}

export function DashboardTabs({ profile, forms, submissions }: Props) {
  const t = useTranslations("Dashboard");
  const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "forms", label: t("tabForms"), icon: LayoutGrid },
    { id: "builder", label: t("tabBuilder"), icon: Wand2 },
    { id: "brief", label: t("tabBrief"), icon: FileText },
    { id: "inbox", label: t("tabInbox"), icon: InboxIcon },
    { id: "settings", label: t("tabSettings"), icon: SettingsIcon },
    { id: "billing", label: t("tabBilling"), icon: CreditCard },
  ];
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
        <p className="text-xs uppercase tracking-wide text-slate-500">{t("welcome")}</p>
        <p className="text-xl sm:text-lg font-semibold text-slate-900 truncate">{profile.full_name || profile.email}</p>
        {profile.plan_expires_at && (
          <p className="mt-1 text-xs text-amber-600">
            {t("planExpires")} {new Date(profile.plan_expires_at).toLocaleDateString()}
          </p>
        )}
        <nav className="mt-5 grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-col gap-2 lg:gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex flex-col sm:flex-row lg:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 rounded-xl px-2 py-3 sm:px-3 sm:py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} /><span>{tab.label}</span>
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
