import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Trasy wewnętrzne (panel klienta, admin, API, publiczne formularze) – pomijają next-intl,
 * ale nadal odświeżają sesję Supabase.
 */
function isInternalRoute(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/p/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Najpierw routing wielojęzykowy dla tras publicznych.
  // WAŻNE: tej odpowiedzi (z przekierowaniem / rewrite na właściwy język) NIE wolno
  // później nadpisać — inaczej gubimy locale i dostajemy 404 (raz działa, raz nie).
  const response = isInternalRoute(pathname)
    ? NextResponse.next({ request: { headers: request.headers } })
    : intlMiddleware(request);

  // Następnie odświeżenie sesji Supabase (wymagane przed każdym Server Component).
  // Odświeżone ciasteczka DOKLEJAMY do istniejącej odpowiedzi next-intl,
  // zamiast tworzyć nową (co kasowało redirect/rewrite języka).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|logo-bimi\\.svg|logo\\.mulbox\\.ch\\.png|manifest\\.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
