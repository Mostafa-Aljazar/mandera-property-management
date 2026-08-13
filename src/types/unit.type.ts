import type { Enums, Tables } from "@/lib/supabase/database.types";

type IUnit = Tables<"units">;
type IUnitType = Enums<"unit_type">;
type IUnitStatus = Enums<"unit_status">;

interface ICreateUnitInput {
  property_id: string;
  unit_number: string;
  floor: string | null;
  unit_type: IUnitType;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rent_amount: number;
}

export type { IUnit, IUnitType, IUnitStatus, ICreateUnitInput };
