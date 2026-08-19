-- ============================================================
-- Migration 014: Maintenance request images storage bucket
-- Applied directly via Supabase MCP (apply_migration) — kept here
-- for the repo's migration history record.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('maintenance-images', 'maintenance-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- maintenance-images: owner reads/writes only their own folder ({owner_id}/...)
create policy "Maintenance images are publicly accessible"
on storage.objects for select
using (bucket_id = 'maintenance-images');

create policy "Owners can upload their own maintenance images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'maintenance-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can update their own maintenance images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'maintenance-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete their own maintenance images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'maintenance-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
