-- ============================================================
-- Migration 009: Tenant photo / ID document storage buckets
-- Run in Supabase Dashboard → SQL Editor
--
-- The buckets themselves ("tenant-photos", "tenant-documents") were
-- already created via the Storage Admin API, but RLS policies on
-- storage.objects require direct SQL access which wasn't available
-- when this migration was written (Supabase MCP was disconnected) —
-- so only the policies below still need to be applied.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('tenant-photos', 'tenant-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('tenant-documents', 'tenant-documents', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- tenant-photos: owner reads/writes only their own folder ({owner_id}/...)
create policy "Tenant photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'tenant-photos');

create policy "Owners can upload their own tenant photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tenant-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own tenant photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'tenant-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own tenant photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'tenant-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- tenant-documents: same pattern (ID scans etc.)
create policy "Tenant documents are publicly accessible"
on storage.objects for select
using (bucket_id = 'tenant-documents');

create policy "Owners can upload their own tenant documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tenant-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own tenant documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'tenant-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own tenant documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'tenant-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
