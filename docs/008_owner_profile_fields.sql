-- ============================================================
-- Migration 008: Owner profile fields
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

do $$ begin
  create type owner_account_status as enum ('active', 'inactive', 'pending');
exception
  when duplicate_object then null;
end $$;

alter table public.users
  add column if not exists national_id text,
  add column if not exists valid_until date,
  add column if not exists account_status owner_account_status not null default 'active',
  add column if not exists company_name text,
  add column if not exists city text,
  add column if not exists notes text,
  add column if not exists id_document_url text;

-- backfill status from is_active for existing owners
update public.users
set account_status = case when is_active then 'active'::owner_account_status else 'inactive'::owner_account_status end
where role = 'owner';

create index if not exists idx_users_account_status on public.users(account_status);
create index if not exists idx_users_national_id on public.users(national_id);

comment on column public.users.national_id is 'National / government ID number';
comment on column public.users.valid_until is 'Account validity end date — expired → pending';
comment on column public.users.account_status is 'active | inactive | pending';
comment on column public.users.company_name is 'Company / office name (optional)';
comment on column public.users.city is 'City (optional)';
comment on column public.users.notes is 'Internal admin notes (optional)';
comment on column public.users.id_document_url is 'Scanned ID document URL (optional)';
