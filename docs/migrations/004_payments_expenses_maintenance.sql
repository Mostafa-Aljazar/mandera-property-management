-- ============================================================
-- Migration 004: Payments + Expenses + Maintenance Requests
-- ============================================================

-- ---------- PAYMENTS ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  amount numeric not null,
  due_date date not null,
  paid_date date,
  payment_method payment_method,
  receipt_url text,
  status payment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_owner_id on public.payments(owner_id);
create index idx_payments_contract_id on public.payments(contract_id);
create index idx_payments_unit_id on public.payments(unit_id);
create index idx_payments_tenant_id on public.payments(tenant_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_due_date on public.payments(due_date);

create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- ---------- EXPENSES ----------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  expense_type expense_type not null default 'other',
  amount numeric not null,
  expense_date date not null,
  description text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_expenses_owner_id on public.expenses(owner_id);
create index idx_expenses_property_id on public.expenses(property_id);
create index idx_expenses_expense_date on public.expenses(expense_date);

create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

-- ---------- MAINTENANCE REQUESTS ----------
create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  issue_type maintenance_issue_type not null default 'other',
  priority maintenance_priority not null default 'low',
  description text not null,
  images text[] default '{}',
  status maintenance_status not null default 'pending',
  technician_name text,
  cost numeric,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_maintenance_owner_id on public.maintenance_requests(owner_id);
create index idx_maintenance_unit_id on public.maintenance_requests(unit_id);
create index idx_maintenance_status on public.maintenance_requests(status);

create trigger trg_maintenance_updated_at
before update on public.maintenance_requests
for each row execute function public.set_updated_at();
