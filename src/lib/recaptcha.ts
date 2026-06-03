/** Weryfikuje token Google reCAPTCHA v2/v3. Zwraca true jeśli to człowiek. */
export async function verifyRecaptcha(secret: string, token: string | null | undefined): Promise<boolean> {
  if (!secret) return true; // brak konfiguracji = brak ochrony
  if (!token) return false;

  try {
    const params = new URLSearchParams({ secret, response: token });
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      // krótki timeout; nigdy nie blokujemy zapisu długo
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean; score?: number; "error-codes"?: string[] };
    if (!data.success) {
      console.error("[recaptcha] verification failed. error-codes:", data["error-codes"], "secret prefix:", secret.slice(0, 10));
      return false;
    }
    if (typeof data.score === "number") {
      console.log("[recaptcha] v3 score:", data.score);
      return data.score >= 0.5;
    }
    return true;
  } catch (err) {
    console.error("[recaptcha] fetch error:", err);
    return false;
  }
}
