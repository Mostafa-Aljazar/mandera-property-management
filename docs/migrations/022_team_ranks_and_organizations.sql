-- ============================================================
-- Migration 022: Team ranks and company ownership context
-- ============================================================

do $$ begin
  create type user_rank as enum ('manager', 'administrator', 'assistant');
exception when duplicate_object then null;
end $$;

alter table public.users
  add column if not exists rank user_rank,
  add column if not exists organization_id uuid references public.users(id) on delete cascade;

-- Existing owner accounts are company managers. Their organization is themselves.
update public.users
set rank = 'manager', organization_id = id
where role = 'owner';

create or replace function public.set_user_organization_context()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'owner' then
    new.rank = coalesce(new.rank, 'manager'::user_rank);
    new.organization_id = coalesce(new.organization_id, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_users_organization_context on public.users;
create trigger trg_users_organization_context
before insert or update of role, rank, organization_id on public.users
for each row execute function public.set_user_organization_context();

alter table public.users
  drop constraint if exists users_rank_by_role_check;
alter table public.users
  add constraint users_rank_by_role_check
  check (
    (role = 'master_admin' and rank is null and organization_id is null)
    or (role = 'owner' and rank is not null and organization_id is not null)
  );

create index if not exists idx_users_organization_id on public.users(organization_id);
create index if not exists idx_users_rank on public.users(rank);

-- Resolve every authenticated team member to the company's manager account.
create or replace function public.current_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(organization_id, id)
  from public.users
  where id = auth.uid()
    and role = 'owner'
    and is_active = true
    and deleted_at is null;
$$;

grant execute on function public.current_owner_id() to authenticated;

drop policy if exists "Owners can view their own properties" on public.properties;
drop policy if exists "Owners can insert their own properties" on public.properties;
drop policy if exists "Owners can update their own properties" on public.properties;
drop policy if exists "Owners can delete their own properties" on public.properties;
create policy "Owners can view their own properties" on public.properties for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own properties" on public.properties for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own properties" on public.properties for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own properties" on public.properties for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own units" on public.units;
drop policy if exists "Owners can insert their own units" on public.units;
drop policy if exists "Owners can update their own units" on public.units;
drop policy if exists "Owners can delete their own units" on public.units;
create policy "Owners can view their own units" on public.units for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own units" on public.units for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own units" on public.units for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own units" on public.units for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own tenants" on public.tenants;
drop policy if exists "Owners can insert their own tenants" on public.tenants;
drop policy if exists "Owners can update their own tenants" on public.tenants;
drop policy if exists "Owners can delete their own tenants" on public.tenants;
create policy "Owners can view their own tenants" on public.tenants for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own tenants" on public.tenants for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own tenants" on public.tenants for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own tenants" on public.tenants for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own contracts" on public.contracts;
drop policy if exists "Owners can insert their own contracts" on public.contracts;
drop policy if exists "Owners can update their own contracts" on public.contracts;
drop policy if exists "Owners can delete their own contracts" on public.contracts;
create policy "Owners can view their own contracts" on public.contracts for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own contracts" on public.contracts for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own contracts" on public.contracts for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own contracts" on public.contracts for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own payments" on public.payments;
drop policy if exists "Owners can insert their own payments" on public.payments;
drop policy if exists "Owners can update their own payments" on public.payments;
drop policy if exists "Owners can delete their own payments" on public.payments;
create policy "Owners can view their own payments" on public.payments for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own payments" on public.payments for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own payments" on public.payments for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own payments" on public.payments for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own expenses" on public.expenses;
drop policy if exists "Owners can insert their own expenses" on public.expenses;
drop policy if exists "Owners can update their own expenses" on public.expenses;
drop policy if exists "Owners can delete their own expenses" on public.expenses;
create policy "Owners can view their own expenses" on public.expenses for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own expenses" on public.expenses for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own expenses" on public.expenses for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own expenses" on public.expenses for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own maintenance requests" on public.maintenance_requests;
drop policy if exists "Owners can insert their own maintenance requests" on public.maintenance_requests;
drop policy if exists "Owners can update their own maintenance requests" on public.maintenance_requests;
drop policy if exists "Owners can delete their own maintenance requests" on public.maintenance_requests;
create policy "Owners can view their own maintenance requests" on public.maintenance_requests for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own maintenance requests" on public.maintenance_requests for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own maintenance requests" on public.maintenance_requests for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own maintenance requests" on public.maintenance_requests for delete using (owner_id = public.current_owner_id());

drop policy if exists "Owners can view their own brokers" on public.brokers;
drop policy if exists "Owners can insert their own brokers" on public.brokers;
drop policy if exists "Owners can update their own brokers" on public.brokers;
drop policy if exists "Owners can delete their own brokers" on public.brokers;
create policy "Owners can view their own brokers" on public.brokers for select using (owner_id = public.current_owner_id());
create policy "Owners can insert their own brokers" on public.brokers for insert with check (owner_id = public.current_owner_id());
create policy "Owners can update their own brokers" on public.brokers for update using (owner_id = public.current_owner_id());
create policy "Owners can delete their own brokers" on public.brokers for delete using (owner_id = public.current_owner_id());

-- Existing storage policies use auth.uid() directly. These companion policies
-- allow team members to use the company's owner-scoped storage folders.
drop policy if exists "Team members can read company files" on storage.objects;
drop policy if exists "Team members can upload company files" on storage.objects;
drop policy if exists "Team members can update company files" on storage.objects;
drop policy if exists "Team members can delete company files" on storage.objects;

create policy "Team members can read company files" on storage.objects
for select to authenticated
using (
  bucket_id in ('broker-photos', 'contract-files', 'expense-receipts',
                'maintenance-images', 'payment-receipts', 'tenant-documents',
                'tenant-photos', 'unit-images', 'vacant-reports')
  and (storage.foldername(name))[1] = public.current_owner_id()::text
);

create policy "Team members can upload company files" on storage.objects
for insert to authenticated
with check (
  bucket_id in ('broker-photos', 'contract-files', 'expense-receipts',
                'maintenance-images', 'payment-receipts', 'tenant-documents',
                'tenant-photos', 'unit-images', 'vacant-reports')
  and (storage.foldername(name))[1] = public.current_owner_id()::text
);

create policy "Team members can update company files" on storage.objects
for update to authenticated
using (
  bucket_id in ('broker-photos', 'contract-files', 'expense-receipts',
                'maintenance-images', 'payment-receipts', 'tenant-documents',
                'tenant-photos', 'unit-images', 'vacant-reports')
  and (storage.foldername(name))[1] = public.current_owner_id()::text
)
with check (
  bucket_id in ('broker-photos', 'contract-files', 'expense-receipts',
                'maintenance-images', 'payment-receipts', 'tenant-documents',
                'tenant-photos', 'unit-images', 'vacant-reports')
  and (storage.foldername(name))[1] = public.current_owner_id()::text
);

create policy "Team members can delete company files" on storage.objects
for delete to authenticated
using (
  bucket_id in ('broker-photos', 'contract-files', 'expense-receipts',
                'maintenance-images', 'payment-receipts', 'tenant-documents',
                'tenant-photos', 'unit-images', 'vacant-reports')
  and (storage.foldername(name))[1] = public.current_owner_id()::text
);
