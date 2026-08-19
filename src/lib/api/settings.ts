import "server-only";
import type { Json } from "@/lib/supabase/database.types";
import type { IOwnerSettings } from "@/types/owner.type";

export const DEFAULT_OWNER_SETTINGS: IOwnerSettings = {
  language: "ar",
  notification_preferences: {
    overdue_payment: true,
    contract_expiring: true,
    payment_recorded: true,
    maintenance_update: true,
  },
};

/**
 * `users.settings` only ever stores what an owner explicitly overrode —
 * this fills in anything missing (including a totally empty `{}`) so
 * every response always has the full, predictable shape.
 */
export function mergeOwnerSettings(stored: Json): IOwnerSettings {
  const raw =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, Json>)
      : {};

  const storedPrefs =
    raw.notification_preferences &&
    typeof raw.notification_preferences === "object" &&
    !Array.isArray(raw.notification_preferences)
      ? (raw.notification_preferences as Record<string, Json>)
      : {};

  return {
    language: raw.language === "en" ? "en" : DEFAULT_OWNER_SETTINGS.language,
    notification_preferences: {
      overdue_payment:
        typeof storedPrefs.overdue_payment === "boolean"
          ? storedPrefs.overdue_payment
          : DEFAULT_OWNER_SETTINGS.notification_preferences.overdue_payment,
      contract_expiring:
        typeof storedPrefs.contract_expiring === "boolean"
          ? storedPrefs.contract_expiring
          : DEFAULT_OWNER_SETTINGS.notification_preferences.contract_expiring,
      payment_recorded:
        typeof storedPrefs.payment_recorded === "boolean"
          ? storedPrefs.payment_recorded
          : DEFAULT_OWNER_SETTINGS.notification_preferences.payment_recorded,
      maintenance_update:
        typeof storedPrefs.maintenance_update === "boolean"
          ? storedPrefs.maintenance_update
          : DEFAULT_OWNER_SETTINGS.notification_preferences.maintenance_update,
    },
  };
}
