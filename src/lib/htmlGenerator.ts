import type { FormConfig, PlanType } from "@/lib/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mulbox.ch";

function inputForType(type: string): string {
  if (type === "textarea") {
    return `class="w-full rounded-xl border border-slate-200 px-4 py-3 h-28 focus:outline-none focus:ring-2 focus:ring-violet-500"`;
  }
  return `class="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"`;
}

/** Generuje gotowy snippet HTML z klasami Tailwind dla danego formularza. */
export function generateFormHTML(formId: string, config: FormConfig, plan: PlanType): string {
  const action = `${APP_URL}/api/f/${formId}`;
  const submitLabel = config.submit_label ?? "Wyślij wiadomość";

  const fieldsHTML = (config.fields ?? [])
    .map((f) => {
      const req = f.required ? " required" : "";
      const placeholder = f.placeholder ?? "";
      const cls = inputForType(f.type);

      if (f.type === "textarea") {
        return `  <div>\n    <label class="block text-sm font-medium text-slate-700 mb-1.5">${escapeHtml(f.label)}</label>\n    <textarea name="${escapeHtml(f.name)}" placeholder="${escapeHtml(placeholder)}"${req} ${cls}></textarea>\n  </div>`;
      }

      if (f.type === "select") {
        const opts = (f.options ?? []).filter(Boolean)
          .map((o) => `      <option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`)
          .join("\n");
        return `  <div>\n    <label class="block text-sm font-medium text-slate-700 mb-1.5">${escapeHtml(f.label)}</label>\n    <select name="${escapeHtml(f.name)}"${req} ${cls}>\n      <option value="">${escapeHtml(placeholder || "— Wybierz —")}</option>\n${opts}\n    </select>\n  </div>`;
      }

      if (f.type === "checkbox") {
        const text = escapeHtml(placeholder || f.label);
        return `  <div class="flex items-start gap-3">\n    <input type="checkbox" id="${escapeHtml(f.name)}" name="${escapeHtml(f.name)}"${req} class="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600" />\n    <label for="${escapeHtml(f.name)}" class="text-sm text-slate-700 cursor-pointer">${text}</label>\n  </div>`;
      }

      return `  <div>\n    <label class="block text-sm font-medium text-slate-700 mb-1.5">${escapeHtml(f.label)}</label>\n    <input type="${f.type}" name="${escapeHtml(f.name)}" placeholder="${escapeHtml(placeholder)}"${req} ${cls} />\n  </div>`;
    })
    .join("\n");

  const branding = plan === "free"
    ? `\n  <p class="text-center text-xs text-slate-400">Powered by <a href="${APP_URL}" class="underline">Mulbox.ch</a></p>`
    : "";

  return `<form action="${action}" method="POST" class="w-full max-w-md mx-auto space-y-4 rounded-2xl bg-white p-6 shadow">
${fieldsHTML}
  <button type="submit" class="w-full rounded-xl bg-violet-600 hover:bg-violet-700 transition py-3 font-semibold text-white">${escapeHtml(submitLabel)}</button>${branding}
</form>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
