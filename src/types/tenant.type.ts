import type { Tables } from "@/lib/supabase/database.types";

type ITenant = Tables<"tenants">;

interface ICreateTenantInput {
  full_name: string;
  national_id: string | null;
  phone: string | null;
  email: string | null;
}

export type { ITenant, ICreateTenantInput };
