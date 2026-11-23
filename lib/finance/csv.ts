// lib/finance/csv.ts — تصدير CSV: ترميز UTF-8 مع BOM ليفتح بالعربية في Excel، وحماية من حقن المعادلات.
import { formatSar } from "./money";

export type Cell = string | number | null | undefined | { sar: number };

const FORMULA_START = /^[=+\-@\t\r]/;

/** النصوص التي تبدأ بمحرف معادلة تُسبق بفاصلة عليا فلا يُنفَّذها Excel/Sheets. الأرقام تُكتب كما هي. */
export function csvCell(cell: Cell): string {
  let text: string;
  if (cell === null || cell === undefined) text = "";
  else if (typeof cell === "number") text = Number.isFinite(cell) ? String(cell) : "";
  else if (typeof cell === "object") text = formatSar(cell.sar);
  else text = FORMULA_START.test(cell) ? `'${cell}` : cell;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
