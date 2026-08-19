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
