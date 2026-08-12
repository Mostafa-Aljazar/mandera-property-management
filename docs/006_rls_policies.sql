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
