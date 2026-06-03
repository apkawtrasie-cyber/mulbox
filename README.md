# Mulbox.ch – Form-as-a-Service

Modularny serwis formularzy: Next.js (App Router, TypeScript) + Tailwind + Supabase + Resend, w pełni responsywny (Mobile First) i instalowalny jako PWA.

## Wymagania

- Node.js ≥ 18.18
- Konto **Supabase** (URL + anon key + service-role key)
- Konto **Resend** (API key + zweryfikowana domena, np. `powiadomienia@mulbox.ch`)
- (opcjonalnie) Klucze **Google reCAPTCHA** (Site/Secret) – per formularz, ustawiane przez użytkownika w panelu

## Szybki start

```bash
# 1) Zależności
npm install

# 2) Konfiguracja środowiska
cp .env.local.example .env.local
# Uzupełnij klucze Supabase / Resend / NEXT_PUBLIC_APP_URL

# 3) Schema bazy danych
# Otwórz Supabase Studio → SQL Editor → wklej i uruchom plik:
#   supabase/schema.sql

# 4) Uruchom dev server
npm run dev
# → http://localhost:3000
```

### Promocja konta na admina

Po założeniu pierwszego konta uruchom w SQL Editor Supabase:

```sql
update public.profiles set role = 'admin' where email = 'twoj@email.tld';
```

Panel admina dostępny jest pod `/admin`.

## Struktura projektu

```
src/
  app/
    (marketing)/        # Strefa publiczna: /, /pricing, /kontakt, /impressum
    (auth)/             # /login, /register
    dashboard/          # Panel klienta (modularne zakładki)
    admin/              # Panel administratora
    api/
      f/[formId]/       # Główny endpoint przyjmujący formularze zewnętrzne
      forms/            # CRUD formularzy użytkownika
      contact/          # Formularz publiczny /kontakt
      admin/            # Endpointy admina
    p/[formId]/         # Dynamiczny landing page formularza (Premium)
  components/
    marketing/          # Header/Footer/Hero/Features/CTA…
    dashboard/          # DashboardTabs + 4 moduły
    admin/              # AdminTable
  lib/
    supabase.ts         # Fabryki klientów (browser/server/service)
    auth.ts             # Guards: requireUser / requireAdmin
    htmlGenerator.ts    # Generator snippetu HTML formularza
    csv.ts              # Eksport JSONB → CSV (UTF-8 BOM, ;)
    email.ts            # Resend + szablony + tagi {key}
    recaptcha.ts        # Weryfikacja Google reCAPTCHA
    types.ts            # Typy domenowe
public/
  manifest.webmanifest  # PWA manifest
  sw.js                 # Service worker
  icon.svg              # Ikona aplikacji
supabase/
  schema.sql            # Pełna schema + RLS + triggery
```

## Logika planów

| Funkcja                          | Free | Personal | Business |
|----------------------------------|:----:|:--------:|:--------:|
| Powiadomienia email              | ✅   | ✅       | ✅       |
| Stopka „Powered by Mulbox"       | wymagana | – | – |
| Custom Redirect URL              | ❌   | ✅       | ✅       |
| Autoresponder z personalizacją   | ❌   | ✅       | ✅       |
| Własne klucze reCAPTCHA          | ❌   | ✅       | ✅       |
| Eksport CSV (UTF-8)              | ❌   | ✅       | ✅       |
| Dynamiczna strona `/p/[id]`      | ❌   | ✅       | ✅       |

## Deployment (Vercel)

1. Połącz repo z Vercel.
2. Dodaj zmienne środowiskowe (te same co w `.env.local.example`).
3. Skonfiguruj domeny mailowe w Resend (SPF/DKIM/DMARC).
4. Deploy.

## Bezpieczeństwo

- `.env.local` jest w `.gitignore` – sekrety nigdy nie trafiają na GitHub.
- Wszystkie klucze pobierane wyłącznie z `process.env`.
- RLS w Supabase chroni dane użytkowników; Service-Role klucz używany **wyłącznie** w endpointach serwerowych (`/api/f/[formId]`, panel admina).

## Licencja

Mulbox.ch © – wszystkie prawa zastrzeżone.
