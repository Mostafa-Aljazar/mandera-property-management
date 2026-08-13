import type { Enums } from "@/lib/supabase/database.types";

interface IOwnerProfile {
  id: string;
  role: Enums<"user_role">;
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

export type { IOwnerProfile, IOwnerSession };
