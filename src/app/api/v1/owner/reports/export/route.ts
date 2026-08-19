import "server-only";
import ExcelJS from "exceljs";
import { requireOwner } from "@/lib/api/auth";
import {
  buildContractsReport,
  buildFinancialSummaryReport,
  buildMaintenanceReport,
  buildPaymentsReport,
  buildPropertiesReport,
  parseDateRange,
} from "@/lib/api/reports";
import { apiError } from "@/lib/api/response";

const REPORT_TYPES = ["summary", "properties", "contracts", "payments", "maintenance"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

function flattenToMap(obj: Record<string, unknown>, prefix = ""): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(obj)) {
    const label = prefix ? `${prefix}_${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenToMap(value as Record<string, unknown>, label));
    } else if (Array.isArray(value)) {
      out[label] = JSON.stringify(value);
    } else {
      out[label] = (value as string | number) ?? "";
    }
  }
  return out;
}

function addSheet(workbook: ExcelJS.Workbook, sheetName: string, data: unknown) {
  const sheet = workbook.addWorksheet(sheetName);

  if (Array.isArray(data)) {
    const rows = data.map((item) => flattenToMap(item as Record<string, unknown>));
    const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    sheet.columns = columns.map((key) => ({ header: key, key, width: 22 }));
    rows.forEach((row) => sheet.addRow(row));
  } else {
    sheet.columns = [
      { header: "Field", key: "key", width: 32 },
      { header: "Value", key: "value", width: 32 },
    ];
    Object.entries(flattenToMap(data as Record<string, unknown>)).forEach(([key, value]) =>
      sheet.addRow({ key, value }),
    );
  }

  sheet.getRow(1).font = { bold: true };
}

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type") ?? "summary";

  if (!REPORT_TYPES.includes(typeParam as ReportType)) {
    return apiError("validation_error", `type يجب أن يكون أحد: ${REPORT_TYPES.join(", ")}`, 422);
  }
  const type = typeParam as ReportType;

  const parsedRange = parseDateRange(url);
  if (!parsedRange.ok) return apiError("validation_error", parsedRange.error, 422);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mandera Properties Management";
  workbook.created = new Date();

  switch (type) {
    case "summary":
      addSheet(
        workbook,
        "Summary",
        await buildFinancialSummaryReport(supabase, ownerId, parsedRange.range),
      );
      break;
    case "properties":
      addSheet(workbook, "Properties", await buildPropertiesReport(supabase, ownerId));
      break;
    case "contracts": {
      const report = await buildContractsReport(supabase, ownerId);
      addSheet(workbook, "Contracts Summary", { total: report.total, ...report.by_status });
      addSheet(workbook, "Expiring Soon", report.expiring_within_14_days);
      break;
    }
    case "payments":
      addSheet(workbook, "Payments", await buildPaymentsReport(supabase, ownerId, parsedRange.range));
      break;
    case "maintenance":
      addSheet(
        workbook,
        "Maintenance",
        await buildMaintenanceReport(supabase, ownerId, parsedRange.range),
      );
      break;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
