import type { Enums, Tables } from "@/lib/supabase/database.types";

type INotification = Tables<"notifications">;
type INotificationType = Enums<"notification_type">;
type IDeviceToken = Tables<"device_tokens">;
type IDeviceType = Enums<"device_type">;

export type { INotification, INotificationType, IDeviceToken, IDeviceType };
