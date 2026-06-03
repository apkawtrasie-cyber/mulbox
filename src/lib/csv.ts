import type { SubmissionRecord } from "@/lib/types";

/**
 * Mapuje listę submissions (JSONB) na łańcuch CSV rozdzielany średnikami,
 * z BOM UTF-8 by Excel (PL/CH) prawidłowo wyświetlał diakrytyki.
 */
export function submissionsToCSV(rows: SubmissionRecord[]): string {
  if (rows.length === 0) return "\uFEFFid;created_at;sender_email\n";

  // Dynamicznie zbierz wszystkie klucze JSONB
  const keys = new Set<string>();
  for (const r of rows) Object.keys(r.data ?? {}).forEach((k) => keys.add(k));
  const dataKeys = Array.from(keys);

  const header = ["id", "created_at", "sender_email", "is_spam", ...dataKeys];

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = typeof val === "string" ? val : JSON.stringify(val);
    // Excel: zawsze otaczamy cudzysłowami; podwajamy " w środku.
    return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  };

  const lines = rows.map((r) => {
    const row = [r.id, r.created_at, r.sender_email ?? "", r.is_spam ? "1" : "0",
      ...dataKeys.map((k) => (r.data as Record<string, unknown>)[k] ?? "")];
    return row.map(escape).join(";");
  });

  // BOM dla UTF-8 + nagłówek
  return "\uFEFF" + header.map(escape).join(";") + "\n" + lines.join("\n");
}

/**
 * Eksportuje unikalną listę mailingową (email, imię, telefon).
 * Jeśli ten sam email pojawia się kilka razy – zapisuje tylko pierwsze wystąpienie.
 */
export function submissionsToMailingCSV(rows: SubmissionRecord[]): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = typeof val === "string" ? val : JSON.stringify(val);
    return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  };

  const seen = new Set<string>();
  const lines: string[] = [];

  for (const r of rows) {
    const d = (r.data ?? {}) as Record<string, unknown>;

    // Szukaj emaila – najpierw w danych formularza, potem sender_email
    const emailRaw = (
      d["email"] ?? d["e-mail"] ?? d["mail"] ?? r.sender_email ?? ""
    ) as string;
    const email = emailRaw.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);

    // Szukaj imienia
    const name = (
      d["name"] ?? d["imię i nazwisko"] ?? d["imie i nazwisko"] ??
      d["imię"] ?? d["imie"] ?? d["full_name"] ?? d["fullname"] ?? ""
    ) as string;

    // Szukaj telefonu
    const phone = (
      d["phone"] ?? d["telefon"] ?? d["tel"] ?? d["numer telefonu"] ?? ""
    ) as string;

    lines.push([email, name, phone].map(escape).join(";"));
  }

  const header = [escape("email"), escape("name"), escape("phone")].join(";");
  return "\uFEFF" + header + "\n" + lines.join("\n");
}

/** Wyzwala pobranie pliku CSV w przeglądarce. */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
