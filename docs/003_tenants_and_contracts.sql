-- ============================================================
-- Migration 003: Tenants + Contracts
-- ============================================================

-- ---------- TENANTS ----------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  national_id text,
  phone text,
  email text,
  photo_url text,
  id_document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_tenants_owner_id on public.tenants(owner_id);
create index idx_tenants_deleted_at on public.tenants(deleted_at);

create trigger trg_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

-- ---------- CONTRACT NUMBER SEQUENCE (system-wide, starts at 10001) ----------
create sequence public.contract_number_seq start 10001;

-- ---------- CONTRACTS ----------
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number integer not null default nextval('public.contract_number_seq') unique,
  owner_id uuid not null references public.users(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  rent_amount numeric not null,
  payment_cycle payment_cycle not null default 'monthly',
  deposit_amount numeric,
  status contract_status not null default 'active',
  contract_file_url text,
  renewed_from_contract_id uuid references public.contracts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint chk_contract_dates check (end_date > start_date)
);

create index idx_contracts_owner_id on public.contracts(owner_id);
create index idx_contracts_unit_id on public.contracts(unit_id);
create index idx_contracts_tenant_id on public.contracts(tenant_id);
create index idx_contracts_status on public.contracts(status);
create index idx_contracts_end_date on public.contracts(end_date);
create index idx_contracts_deleted_at on public.contracts(deleted_at);

create trigger trg_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();
