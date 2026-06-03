import Link from "next/link";

/** Logotyp marki Mulbox – fioletowa "kostka" + tekst. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Mulbox – strona główna">
      <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M12 11v10" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight">Mulbox</span>
    </Link>
  );
}
