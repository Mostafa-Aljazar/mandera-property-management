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
