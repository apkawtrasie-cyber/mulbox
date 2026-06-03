import { FileText, Users, Globe2, Zap } from "lucide-react";

const STATS = [
  { icon: FileText, value: "10K+", label: "Aktywnych formularzy" },
  { icon: Users, value: "50K+", label: "Zadowolonych użytkowników" },
  { icon: Globe2, value: "150+", label: "Krajów na całym świecie" },
  { icon: Zap, value: "99.9%", label: "Dostępność systemu" },
];

const LOGOS = ["stripe", "PayPal", "_zapier", "Google", "Microsoft", "Notion"];

export function Trust() {
  return (
    <section className="container-fluid pb-16">
      <p className="text-center text-slate-700 font-medium">
        Zaufały nam firmy, freelancerzy i twórcy z całego świata.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-slate-400 text-xl font-semibold">
        {LOGOS.map((l) => (
          <span key={l} className="opacity-70 hover:opacity-100 transition">{l}</span>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
