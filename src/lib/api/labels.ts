import type { Database } from "@/lib/supabase/database.types";

type UnitType = Database["public"]["Enums"]["unit_type"];
type ExpenseType = Database["public"]["Enums"]["expense_type"];
type MaintenanceIssueType = Database["public"]["Enums"]["maintenance_issue_type"];

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  apartment: "شقة",
  studio: "استوديو",
  villa: "فيلا",
  office: "مكتب",
  shop: "محل",
  warehouse: "مستودع",
  other: "وحدة",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseType, string> = {
  maintenance: "صيانة",
  electricity: "كهرباء",
  water: "مياه",
  cleaning: "تنظيف",
  services: "خدمات",
  other: "أخرى",
};

export const MAINTENANCE_ISSUE_LABELS: Record<MaintenanceIssueType, string> = {
  plumbing: "سباكة",
  electrical: "كهرباء",
  ac: "تكييف",
  appliances: "أجهزة منزلية",
  doors_locks: "أبواب وأقفال",
  paint: "دهان",
  water_leak: "تسرب مياه",
  other: "صيانة عامة",
};

/** e.g. "شقة 402" */
export function unitTypeLabel(unitType: UnitType, unitNumber: string): string {
  return `${UNIT_TYPE_LABELS[unitType] || UNIT_TYPE_LABELS.other} ${unitNumber}`;
}

/** e.g. "برج الياسمين - 402" */
export function propertyUnitLabel(propertyName: string, unitNumber: string): string {
  return `${propertyName} - ${unitNumber}`;
}
