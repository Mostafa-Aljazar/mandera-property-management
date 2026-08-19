-- ============================================================
-- Migration 013: Expense receipt storage bucket
-- Applied directly via Supabase MCP (apply_migration) — kept here
-- for the repo's migration history record.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('expense-receipts', 'expense-receipts', true, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- expense-receipts: owner reads/writes only their own folder ({owner_id}/...)
create policy "Expense receipts are publicly accessible"
on storage.objects for select
using (bucket_id = 'expense-receipts');

create policy "Owners can upload their own expense receipts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'expense-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own expense receipts"
on storage.objects for update
to authenticated
using (
  bucket_id = 'expense-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own expense receipts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'expense-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);
