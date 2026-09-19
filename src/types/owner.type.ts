import type { Enums } from "@/lib/supabase/database.types";

interface IOwnerNotificationPreferences {
  overdue_payment: boolean;
  contract_expiring: boolean;
  payment_recorded: boolean;
  maintenance_update: boolean;
}

interface IOwnerSettings {
  language: "ar" | "en";
  notification_preferences: IOwnerNotificationPreferences;
}

interface IOwnerProfile {
  id: string;
  role: Enums<"user_role">;
  rank: Enums<"user_rank"> | null;
  organization_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  account_status: Enums<"owner_account_status">;
  national_id: string | null;
  valid_until: string | null;
  company_name: string | null;
  city: string | null;
  created_at: string;
}

interface IOwnerSession {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
  owner: IOwnerProfile;
}

interface IOwnerProfileDetails extends IOwnerProfile {
  id_document_url: string | null;
  settings: IOwnerSettings;
}

export type {
  IOwnerProfile,
  IOwnerProfileDetails,
  IOwnerSession,
  IOwnerSettings,
  IOwnerNotificationPreferences,
};
