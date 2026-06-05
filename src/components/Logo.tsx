import Link from "next/link";
import Image from "next/image";

/** Logotyp marki Mulbox – oficjalne logo PNG. */
export function Logo({ className = "", height = 36 }: { className?: string; height?: number }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Mulbox – strona główna"
    >
      <Image
        src="/logo.mulbox.ch.png"
        alt="Mulbox"
        width={height * 4}
        height={height}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}
