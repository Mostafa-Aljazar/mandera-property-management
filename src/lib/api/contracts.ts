import "server-only";
import type { IPaymentCycle } from "@/types/contract.type";

const CYCLE_MONTHS: Record<IPaymentCycle, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

function addMonthsUTC(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
}

/**
 * Generates one payment due-date per cycle step from `startDate` (inclusive)
 * up to `endDate` (exclusive) — mirrors the `POST /owner/contracts` business
 * rule of pre-generating the full payment schedule for a contract.
 */
export function generatePaymentDueDates(
  startDate: string,
  endDate: string,
  cycle: IPaymentCycle,
): string[] {
  const step = CYCLE_MONTHS[cycle];
  const end = new Date(`${endDate}T00:00:00Z`);
  const dueDates: string[] = [];

  let current = new Date(`${startDate}T00:00:00Z`);
  while (current < end) {
    dueDates.push(current.toISOString().slice(0, 10));
    current = addMonthsUTC(current, step);
  }

  return dueDates;
}
