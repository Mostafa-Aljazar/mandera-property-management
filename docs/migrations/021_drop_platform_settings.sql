-- ============================================================
-- Migration 021: Drop platform_settings
-- Subscription price is entered manually per payment (see
-- subscription_payments.amount) instead of a single global price,
-- so this settings table is no longer used.
-- ============================================================

drop table if exists public.platform_settings;
