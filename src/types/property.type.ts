import type { Enums, Tables } from "@/lib/supabase/database.types";

type IProperty = Tables<"properties">;
type IPropertyType = Enums<"property_type">;

interface ICreatePropertyInput {
  name: string;
  type: IPropertyType;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export type { IProperty, IPropertyType, ICreatePropertyInput };
