const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  numberingSystem: "latn",
};

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", dateOptions).format(date);
}

export function formatDateShort(value: string | null | undefined) {
  return formatDate(value);
}
