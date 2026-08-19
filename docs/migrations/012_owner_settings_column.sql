-- ============================================================
-- Migration 012: Owner profile settings column
-- Applied directly via Supabase MCP (apply_migration) — kept here
-- for the repo's migration history record.
-- ============================================================

alter table public.users
  add column if not exists settings jsonb not null default '{}'::jsonb;

comment on column public.users.settings is 'Owner app preferences (language, notification_preferences) — merged with server-side defaults on read; unset keys fall back to defaults.';
