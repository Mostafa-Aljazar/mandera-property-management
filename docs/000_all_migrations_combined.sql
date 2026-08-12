-- ============================================================
-- Migration 001: Enums + Users (Profile Table)
-- ============================================================

-- ---------- ENUMS ----------
create type user_role as enum ('master_admin', 'owner');
create type property_type as enum ('building', 'villa', 'complex', 'other');
create type unit_type as enum ('apartment', 'shop', 'office', 'other');
create type unit_status as enum ('vacant', 'occupied', 'maintenance');
create type payment_cycle as enum ('monthly', 'quarterly', 'yearly');
create type contract_status as enum ('active', 'expiring_soon', 'expired', 'terminated', 'renewed');
create type payment_method as enum ('cash', 'bank_transfer', 'card');
create type payment_status as enum ('pending', 'paid', 'overdue');
create type expense_type as enum ('maintenance', 'water', 'electricity', 'other');
create type maintenance_issue_type as enum ('plumbing', 'electrical', 'ac', 'other');
create type maintenance_priority as enum ('low', 'medium', 'high');
create type maintenance_status as enum ('pending', 'in_progress', 'closed');
create type notification_type as enum ('overdue_payment', 'contract_expiring', 'payment_recorded', 'maintenance_update');
create type device_type as enum ('android', 'ios');

-- ---------- USERS (Profile table linked to auth.users) ----------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  is_active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_users_role on public.users(role);
create index idx_users_deleted_at on public.users(deleted_at);

-- trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

comment on table public.users is 'Profile table for both master_admin and owner roles, linked 1:1 to auth.users';
-- ============================================================
-- Migration 002: Properties + Units
-- ============================================================

-- ---------- PROPERTIES ----------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type property_type not null default 'building',
  city text,
  address text,
  latitude numeric,
  longitude numeric,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_properties_owner_id on public.properties(owner_id);
create index idx_properties_deleted_at on public.properties(deleted_at);

create trigger trg_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

-- ---------- UNITS ----------
create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  unit_number text not null,
  floor text,
  unit_type unit_type not null default 'apartment',
  area numeric,
  bedrooms integer,
  bathrooms integer,
  rent_amount numeric not null default 0,
  status unit_status not null default 'vacant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (property_id, unit_number)
);

create index idx_units_property_id on public.units(property_id);
create index idx_units_owner_id on public.units(owner_id);
create index idx_units_status on public.units(status);
create index idx_units_deleted_at on public.units(deleted_at);

create trigger trg_units_updated_at
before update on public.units
for each row execute function public.set_updated_at();
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
-- ============================================================
-- Migration 005: Notifications + Device Tokens
-- ============================================================

-- ---------- NOTIFICATIONS ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean not null default false,
  push_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_owner_id on public.notifications(owner_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_push_sent on public.notifications(push_sent);

-- ---------- DEVICE TOKENS (FCM) ----------
create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  fcm_token text not null unique,
  device_type device_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_device_tokens_owner_id on public.device_tokens(owner_id);

create trigger trg_device_tokens_updated_at
before update on public.device_tokens
for each row execute function public.set_updated_at();
-- ============================================================
-- Migration 006: Row Level Security (RLS) Policies
-- ============================================================
-- المبدأ العام:
-- - كل Owner يشوف/يعدل بس سجلاته (owner_id = auth.uid())
-- - Master Admin ما بيوصل عبر RLS مباشرة، بيمر من الباك إند بـ service_role key
--   (اللي بتجاوز RLS تلقائياً بطبيعتها بـ Supabase)
-- ============================================================

-- ---------- USERS ----------
alter table public.users enable row level security;

create policy "Users can view their own profile"
on public.users for select
using (id = auth.uid());

create policy "Users can update their own profile"
on public.users for update
using (id = auth.uid());

-- ---------- PROPERTIES ----------
alter table public.properties enable row level security;

create policy "Owners can view their own properties"
on public.properties for select
using (owner_id = auth.uid());

create policy "Owners can insert their own properties"
on public.properties for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own properties"
on public.properties for update
using (owner_id = auth.uid());

create policy "Owners can delete their own properties"
on public.properties for delete
using (owner_id = auth.uid());

-- ---------- UNITS ----------
alter table public.units enable row level security;

create policy "Owners can view their own units"
on public.units for select
using (owner_id = auth.uid());

create policy "Owners can insert their own units"
on public.units for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own units"
on public.units for update
using (owner_id = auth.uid());

create policy "Owners can delete their own units"
on public.units for delete
using (owner_id = auth.uid());

-- ---------- TENANTS ----------
alter table public.tenants enable row level security;

create policy "Owners can view their own tenants"
on public.tenants for select
using (owner_id = auth.uid());

create policy "Owners can insert their own tenants"
on public.tenants for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own tenants"
on public.tenants for update
using (owner_id = auth.uid());

create policy "Owners can delete their own tenants"
on public.tenants for delete
using (owner_id = auth.uid());

-- ---------- CONTRACTS ----------
alter table public.contracts enable row level security;

create policy "Owners can view their own contracts"
on public.contracts for select
using (owner_id = auth.uid());

create policy "Owners can insert their own contracts"
on public.contracts for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own contracts"
on public.contracts for update
using (owner_id = auth.uid());

create policy "Owners can delete their own contracts"
on public.contracts for delete
using (owner_id = auth.uid());

-- ---------- PAYMENTS ----------
alter table public.payments enable row level security;

create policy "Owners can view their own payments"
on public.payments for select
using (owner_id = auth.uid());

create policy "Owners can insert their own payments"
on public.payments for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own payments"
on public.payments for update
using (owner_id = auth.uid());

create policy "Owners can delete their own payments"
on public.payments for delete
using (owner_id = auth.uid());

-- ---------- EXPENSES ----------
alter table public.expenses enable row level security;

create policy "Owners can view their own expenses"
on public.expenses for select
using (owner_id = auth.uid());

create policy "Owners can insert their own expenses"
on public.expenses for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own expenses"
on public.expenses for update
using (owner_id = auth.uid());

create policy "Owners can delete their own expenses"
on public.expenses for delete
using (owner_id = auth.uid());

-- ---------- MAINTENANCE REQUESTS ----------
alter table public.maintenance_requests enable row level security;

create policy "Owners can view their own maintenance requests"
on public.maintenance_requests for select
using (owner_id = auth.uid());

create policy "Owners can insert their own maintenance requests"
on public.maintenance_requests for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own maintenance requests"
on public.maintenance_requests for update
using (owner_id = auth.uid());

create policy "Owners can delete their own maintenance requests"
on public.maintenance_requests for delete
using (owner_id = auth.uid());

-- ---------- NOTIFICATIONS ----------
alter table public.notifications enable row level security;

create policy "Owners can view their own notifications"
on public.notifications for select
using (owner_id = auth.uid());

create policy "Owners can update their own notifications"
on public.notifications for update
using (owner_id = auth.uid());

-- (insert بس عبر service_role من الباك إند، مش من الكلاينت مباشرة)

-- ---------- DEVICE TOKENS ----------
alter table public.device_tokens enable row level security;

create policy "Owners can view their own device tokens"
on public.device_tokens for select
using (owner_id = auth.uid());

create policy "Owners can insert their own device tokens"
on public.device_tokens for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own device tokens"
on public.device_tokens for update
using (owner_id = auth.uid());

create policy "Owners can delete their own device tokens"
on public.device_tokens for delete
using (owner_id = auth.uid());
-- ============================================================
-- Migration 007: ملاحظات ومنطق مساعد (ليست إلزامية التنفيذ الفوري،
-- لكن موصى فيها لضمان اتساق البيانات)
-- ============================================================

-- ملاحظة 1:
-- إنشاء حساب Owner جديد لا يتم عبر SQL مباشرة، بل عبر:
--   supabase.auth.admin.createUser({ email, password })  -- من الباك إند (service_role)
-- ثم إدخال سجل في public.users بنفس الـ id الراجع، بـ role='owner'.
-- هاي الخطوة هتُنفذ من كود الـ API (route: POST /admin/owners)، مش من الـ SQL migration.

-- ملاحظة 2:
-- عمود unit_number فريد ضمن نفس property_id فقط (unique constraint موجود بـ migration 002).
-- لو انحذفت وحدة (soft delete) وانضافت وحدة بنفس الرقم بنفس العقار، لازم الكود يتحقق
-- من عدم وجود تعارض مع السجلات غير المحذوفة فقط (deleted_at is null) عند الإدخال.

-- ملاحظة 3 (منطق يُنفذ بكود الـ API عند إنشاء عقد جديد - POST /owner/contracts):
--   1) إدخال سجل في contracts
--   2) توليد صفوف payments تلقائياً حسب payment_cycle (شهري/ربعي/سنوي) بين start_date و end_date
--   3) تحديث units.status = 'occupied' للوحدة المرتبطة

-- ملاحظة 4 (منطق يُنفذ بكود الـ API عند POST /owner/contracts/:id/terminate):
--   1) تحديث contracts.status = 'terminated'
--   2) حذف/إلغاء أي صفوف payments بحالة 'pending' وتاريخ استحقاق مستقبلي
--   3) تحديث units.status = 'vacant'

-- ملاحظة 5 (Cron - Supabase Edge Function مجدولة يومياً):
--   ستُبنى لاحقاً كملف منفصل (Edge Function) وتُجدول عبر pg_cron أو Supabase Scheduled Triggers.
--   سنوثقها في مرحلة الـ backend logic، بعد إتمام الـ CRUD الأساسي.
