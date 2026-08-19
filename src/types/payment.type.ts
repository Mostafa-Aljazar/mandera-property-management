import type { Enums, Tables } from "@/lib/supabase/database.types";

type IPayment = Tables<"payments">;
type IPaymentStatus = Enums<"payment_status">;
type IPaymentMethod = Enums<"payment_method">;

export type { IPayment, IPaymentStatus, IPaymentMethod };
