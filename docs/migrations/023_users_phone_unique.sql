-- ============================================================
-- Migration 023: Enforce global uniqueness on users.phone
-- ============================================================
-- Prevents duplicate phone numbers across the whole system (not just per
-- company), which would otherwise break identifier-based login: phone
-- lookup in resolveIdentifierToEmail() uses .maybeSingle() and errors out
-- if more than one row matches.

alter table public.users
  drop constraint if exists users_phone_key;
alter table public.users
  add constraint users_phone_key unique (phone);
