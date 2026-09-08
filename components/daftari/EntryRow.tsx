// components/daftari/EntryRow.tsx
import { t } from "@/theme";
import { DaftariEntryItem, ENTRY_TYPE_LABEL, EXPENSE_CATEGORY_LABEL } from "./types";

const TYPE_COLOR: Record<string, { color: string; bg: string }> = {
  SALE: { color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  EXPENSE: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  REFUND: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  WITHDRAWAL: { color: t.colors.text.mid, bg: t.colors.cream.bg },
  ADJUSTMENT: { color: t.colors.primary[800], bg: t.colors.primary[100] },
};

export default function EntryRow({ entry }: { entry: DaftariEntryItem }) {
  const style = TYPE_COLOR[entry.type] ?? TYPE_COLOR.ADJUSTMENT;
  const isNegative = entry.type === "EXPENSE" || entry.type === "REFUND" || entry.type === "WITHDRAWAL";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: t.colors.white, borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: t.spacing["2"] }}>
        <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: t.radius.full, background: style.bg, color: style.color, fontWeight: t.typography.fontWeight.bold }}>
          {ENTRY_TYPE_LABEL[entry.type] ?? entry.type}
        </span>
        <div>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.dark }}>
            {entry.description || (entry.expenseCategory ? EXPENSE_CATEGORY_LABEL[entry.expenseCategory] : "—")}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: t.colors.text.light }}>{new Date(entry.entryDate).toLocaleDateString("ar-SA")}</p>
        </div>
      </div>
      <span style={{ fontWeight: t.typography.fontWeight.bold, color: isNegative ? t.colors.semantic.danger : t.colors.semantic.success }}>
        {isNegative ? "−" : "+"}{entry.amount} ر.س
      </span>
    </div>
  );
}
