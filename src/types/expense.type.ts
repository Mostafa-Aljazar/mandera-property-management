import type { Enums, Tables } from "@/lib/supabase/database.types";

type IExpense = Tables<"expenses">;
type IExpenseType = Enums<"expense_type">;

export type { IExpense, IExpenseType };
