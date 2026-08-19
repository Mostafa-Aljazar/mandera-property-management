import type { Enums, Tables } from "@/lib/supabase/database.types";

type IContract = Tables<"contracts">;
type IContractStatus = Enums<"contract_status">;
type IPaymentCycle = Enums<"payment_cycle">;

interface ICreateContractInput {
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  payment_cycle: IPaymentCycle;
  deposit_amount: number | null;
}

export type { IContract, IContractStatus, IPaymentCycle, ICreateContractInput };
