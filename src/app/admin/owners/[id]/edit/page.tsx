import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditOwnerForm } from "@/components/admin/owners/EditOwnerForm";

async function getOwner(id: string) {
  const admin = createAdminClient();
  const { data: owner } = await admin
    .from("users")
    .select(
      "id, full_name, email, phone, national_id, valid_until, company_name, city, notes, avatar_url, id_document_url, deleted_at",
    )
    .eq("id", id)
    .eq("role", "owner")
    .single();

  return owner;
}

export default async function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getOwner(id);

  if (!owner || owner.deleted_at) {
    notFound();
  }

  return (
    <EditOwnerForm
      owner={{
        id: owner.id,
        full_name: owner.full_name,
        email: owner.email,
        phone: owner.phone,
        national_id: owner.national_id,
        valid_until: owner.valid_until,
        company_name: owner.company_name,
        city: owner.city,
        notes: owner.notes,
        avatar_url: owner.avatar_url,
        id_document_url: owner.id_document_url,
      }}
    />
  );
}
