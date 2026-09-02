-- ============================================================
-- Migration 019: Brokers + vacant-unit report storage
-- New source added by docs/new/openapi.yaml (v0.2.0-draft):
-- POST/GET /brokers, POST /units/vacant-report/send.
-- See docs/new/backend-decisions.md points 1, 3, 4.
-- ============================================================

-- ---------- BROKERS ----------
create table public.brokers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  company_name text,
  commercial_license_number text not null,
  nationality text,
  nationality_code text,
  email text,
  phone text,
  mobile text,
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_brokers_owner_id on public.brokers(owner_id);
create index idx_brokers_deleted_at on public.brokers(deleted_at);

create trigger trg_brokers_updated_at
before update on public.brokers
for each row execute function public.set_updated_at();

alter table public.brokers enable row level security;

create policy "Owners can view their own brokers"
on public.brokers for select
using (owner_id = auth.uid());

create policy "Owners can insert their own brokers"
on public.brokers for insert
with check (owner_id = auth.uid());

create policy "Owners can update their own brokers"
on public.brokers for update
using (owner_id = auth.uid());

create policy "Owners can delete their own brokers"
on public.brokers for delete
using (owner_id = auth.uid());

-- ---------- VACANT UNIT REPORTS ----------
-- Records each report sent to a broker. Actual delivery mechanism
-- (email/WhatsApp/etc.) is an open decision — see
-- docs/new/backend-decisions.md point 1. This table only tracks that
-- a report was generated and stored; delivery is a TODO in the route.
create table public.vacant_unit_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  broker_id uuid not null references public.brokers(id) on delete cascade,
  report_url text not null,
  created_at timestamptz not null default now()
);

create index idx_vacant_unit_reports_owner_id on public.vacant_unit_reports(owner_id);
create index idx_vacant_unit_reports_broker_id on public.vacant_unit_reports(broker_id);

alter table public.vacant_unit_reports enable row level security;

create policy "Owners can view their own vacant unit reports"
on public.vacant_unit_reports for select
using (owner_id = auth.uid());

create policy "Owners can insert their own vacant unit reports"
on public.vacant_unit_reports for insert
with check (owner_id = auth.uid());

-- ---------- STORAGE: broker-photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('broker-photos', 'broker-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Broker photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'broker-photos');

create policy "Owners can upload their own broker photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'broker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own broker photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'broker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own broker photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'broker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------- STORAGE: vacant-reports ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vacant-reports', 'vacant-reports', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "Vacant reports are publicly accessible"
on storage.objects for select
using (bucket_id = 'vacant-reports');

create policy "Owners can upload their own vacant reports"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'vacant-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own vacant reports"
on storage.objects for update
to authenticated
using (
  bucket_id = 'vacant-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own vacant reports"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'vacant-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);
