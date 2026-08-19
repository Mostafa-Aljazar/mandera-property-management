import type { Enums, Tables } from "@/lib/supabase/database.types";

type IMaintenanceRequest = Tables<"maintenance_requests">;
type IMaintenanceIssueType = Enums<"maintenance_issue_type">;
type IMaintenancePriority = Enums<"maintenance_priority">;
type IMaintenanceStatus = Enums<"maintenance_status">;

export type {
  IMaintenanceRequest,
  IMaintenanceIssueType,
  IMaintenancePriority,
  IMaintenanceStatus,
};
