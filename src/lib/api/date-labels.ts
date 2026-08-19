const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** "1 يناير 2024" */
export function arabicDateLabel(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${ARABIC_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "مايو 2024" */
export function arabicMonthYearLabel(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${ARABIC_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "مارس" */
export function arabicMonthLabel(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return ARABIC_MONTHS[d.getUTCMonth()];
}

/** "2024/05/02" */
export function slashDateLabel(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}/${mm}/${dd}`;
}
