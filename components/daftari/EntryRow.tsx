// components/daftari/EntryRow.tsx
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, type LucideIcon } from "lucide-react";
import { DaftariEntryItem, ENTRY_TYPE_LABEL, EXPENSE_CATEGORY_LABEL } from "./types";
import s from "./daftari.module.css";

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  SALE: { color: "var(--ui-green)", bg: "var(--ui-sand)" },
  EXPENSE: { color: "var(--ui-danger)", bg: "var(--ui-danger-bg)" },
  REFUND: { color: "var(--ui-kicker)", bg: "var(--ui-sand)" },
  WITHDRAWAL: { color: "var(--ui-ink-muted)", bg: "var(--ui-sand)" },
  ADJUSTMENT: { color: "var(--ui-green-deep)", bg: "var(--ui-sand)" },
};

const TYPE_ICON: Record<string, LucideIcon> = {
  SALE: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  REFUND: ArrowUpRight,
  WITHDRAWAL: ArrowUpRight,
  ADJUSTMENT: CircleDollarSign,
};

export default function EntryRow({ entry }: { entry: DaftariEntryItem }) {
  const style = TYPE_STYLE[entry.type] ?? TYPE_STYLE.ADJUSTMENT;
  const isNegative = entry.type === "EXPENSE" || entry.type === "REFUND" || entry.type === "WITHDRAWAL";
  const Icon = TYPE_ICON[entry.type] ?? CircleDollarSign;
  const description = entry.description || (entry.expenseCategory ? EXPENSE_CATEGORY_LABEL[entry.expenseCategory] : "—");

  return (
    <article dir="rtl" className={s.row}>
      <span className={s.rowIcon} style={{ color: style.color, background: style.bg }} aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div style={{ minWidth: 0 }}>
        <span className={s.desc}>{description}</span>
        <span className={s.meta}>{ENTRY_TYPE_LABEL[entry.type] ?? entry.type}</span>
      </div>
      <span className={s.date}>{new Date(entry.entryDate).toLocaleDateString("ar-SA-u-ca-gregory")}</span>
      <span className={s.amount} style={{ color: isNegative ? "var(--ui-danger)" : "var(--ui-green)" }}>
        {isNegative ? "−" : "+"}{entry.amount} ر.س
        <span className={s.amountNote}>{isNegative ? "خصم من الرصيد" : "إضافة للرصيد"}</span>
      </span>
    </article>
  );
}
