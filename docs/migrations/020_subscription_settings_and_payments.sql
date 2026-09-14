-- ============================================================
-- Migration 020: Platform subscription price + payments log
-- Adds a global subscription price setting and an append-only
-- log of owner subscription payments/renewals, so the admin
-- revenue report has real historical data to aggregate.
-- ============================================================

-- ---------- PLATFORM SETTINGS (singleton) ----------
create table public.platform_settings (
  id smallint primary key default 1 check (id = 1),
  subscription_price numeric not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null
);

create trigger trg_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

insert into public.platform_settings (id, subscription_price)
values (1, 0)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

-- ---------- SUBSCRIPTION PAYMENTS (append-only log) ----------
-- One row per owner-subscription extension (initial signup or
-- renewal), recording the price frozen at that moment. Admin-only
-- data — accessed exclusively via the service-role client, so no
-- policies are defined (RLS defaults to deny for anon/authenticated).
create table public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  amount numeric not null,
  period_start date not null,
  period_end date not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_subscription_payments_owner_id on public.subscription_payments(owner_id);
create index idx_subscription_payments_created_at on public.subscription_payments(created_at);

alter table public.subscription_payments enable row level security;
