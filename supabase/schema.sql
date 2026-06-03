-- ===========================================================
-- Mulbox.ch – pełna schema bazy danych Supabase
-- Wykonaj w SQL Editor swojego projektu Supabase.
-- ===========================================================

-- 1) Profile użytkowników
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan_type text not null default 'free' check (plan_type in ('free','personal','business')),
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- 2) Formularze
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  config jsonb not null default '{"fields":[]}'::jsonb,
  redirect_url text,
  recaptcha_site_key text,
  recaptcha_secret_key text,
  custom_email_template text,
  autoresponder_enabled boolean not null default false,
  autoresponder_subject text,
  autoresponder_body text,
  notification_signature text,
  created_at timestamptz not null default now()
);

create index if not exists forms_user_id_idx on public.forms(user_id);

-- 3) Wiadomości / submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  data jsonb not null,
  sender_email text,
  is_spam boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists submissions_form_id_idx on public.submissions(form_id);
create index if not exists submissions_sender_email_idx on public.submissions(sender_email);

-- 4) Trigger: po insercie profilu w auth.users -> stwórz profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 5) Trigger: wyizoluj sender_email z JSONB submissions.data
create or replace function public.extract_sender_email()
returns trigger language plpgsql as $$
declare key text; val text;
begin
  if new.sender_email is null then
    for key, val in select * from jsonb_each_text(new.data) loop
      if val ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
        new.sender_email := val; exit;
      end if;
    end loop;
  end if;
  return new;
end; $$;

drop trigger if exists submissions_extract_email on public.submissions;
create trigger submissions_extract_email
before insert on public.submissions
for each row execute procedure public.extract_sender_email();

-- 6) Row Level Security
alter table public.profiles enable row level security;
alter table public.forms enable row level security;
alter table public.submissions enable row level security;

-- profiles: widoczność własnego rekordu + admin widzi wszystko
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using ( id = auth.uid()
       or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using ( id = auth.uid() );

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
  using ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- forms: właściciel zarządza swoimi; admin widzi/edytuje wszystkie
drop policy if exists forms_owner_all on public.forms;
create policy forms_owner_all on public.forms for all
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

drop policy if exists forms_admin_all on public.forms;
create policy forms_admin_all on public.forms for all
  using ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
  with check ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- submissions: tylko właściciel formularza może czytać
drop policy if exists submissions_owner_select on public.submissions;
create policy submissions_owner_select on public.submissions for select
  using ( exists (select 1 from public.forms f
                  where f.id = submissions.form_id and f.user_id = auth.uid())
       or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- INSERT submissions wykonuje wyłącznie service-role (endpoint serwerowy) – brak polityki = brak insertu z anon.
