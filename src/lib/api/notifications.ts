import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Notifications RLS only allows owners to SELECT/UPDATE their own rows —
 * INSERT must go through the service_role key from the backend, so this
 * uses the admin client rather than the caller's RLS-scoped client.
 */
export async function notifyPaymentRecorded(
  ownerId: string,
  paymentId: string,
  amount: number,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    owner_id: ownerId,
    type: "payment_recorded",
    title: "دفعة جديدة",
    body: `تم تسجيل دفعة بقيمة ${amount}`,
    related_entity_type: "payment",
    related_entity_id: paymentId,
  });
}

const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  in_progress: "جاري العمل عليه",
  closed: "تم الإغلاق",
};

export async function notifyMaintenanceUpdate(
  ownerId: string,
  requestId: string,
  status: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    owner_id: ownerId,
    type: "maintenance_update",
    title: "تحديث طلب صيانة",
    body: `تحدثت حالة طلب الصيانة إلى: ${MAINTENANCE_STATUS_LABELS[status] ?? status}`,
    related_entity_type: "maintenance_request",
    related_entity_id: requestId,
  });
}
