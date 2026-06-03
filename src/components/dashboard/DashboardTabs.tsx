"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Wand2, Inbox as InboxIcon, Settings as SettingsIcon } from "lucide-react";
import type { FormRecord, Profile, SubmissionRecord } from "@/lib/types";
import { FormsList } from "./modules/FormsList";
import { FormBuilder } from "./modules/FormBuilder";
import { Inbox } from "./modules/Inbox";
import { Settings } from "./modules/Settings";

type TabId = "forms" | "builder" | "inbox" | "settings";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "forms", label: "Formularze", icon: LayoutGrid },
  { id: "builder", label: "Kreator", icon: Wand2 },
  { id: "inbox", label: "Skrzynka", icon: InboxIcon },
  { id: "settings", label: "Ustawienia", icon: SettingsIcon },
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
        <p className="text-xs uppercase tracking-wide text-slate-500">Witaj,</p>
        <p className="text-lg font-semibold text-slate-900 truncate">{profile.full_name || profile.email}</p>
        <nav className="mt-5 flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
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
        {active === "inbox" && (
          <Inbox forms={forms} submissions={submissions} plan={profile.plan_type} />
        )}
        {active === "settings" && (
          <Settings forms={forms} selectedForm={selectedForm} onSelectForm={setSelectedFormId} plan={profile.plan_type} />
        )}
      </div>
    </div>
  );
}
