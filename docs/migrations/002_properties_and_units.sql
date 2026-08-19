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
