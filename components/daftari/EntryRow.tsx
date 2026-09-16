// components/daftari/EntryRow.tsx

import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import {
  DaftariEntryItem,
  ENTRY_TYPE_LABEL,
  EXPENSE_CATEGORY_LABEL,
} from "./types";

const TYPE_COLOR: Record<
  string,
  { color: string; bg: string }
> = {
  SALE: {
    color: t.colors.semantic.success,
    bg: t.colors.semantic.successBg,
  },
  EXPENSE: {
    color: t.colors.semantic.danger,
    bg: t.colors.semantic.dangerBg,
  },
  REFUND: {
    color: t.colors.semantic.warning,
    bg: t.colors.semantic.warningBg,
  },
  WITHDRAWAL: {
    color: t.colors.text.mid,
    bg: t.colors.cream.bg,
  },
  ADJUSTMENT: {
    color: t.colors.primary[800],
    bg: t.colors.primary[100],
  },
};

const TYPE_ICON: Record<string, LucideIcon> = {
  SALE: ArrowUpRight,
  EXPENSE: ArrowDownLeft,
  REFUND: ArrowDownLeft,
  WITHDRAWAL: ArrowDownLeft,
  ADJUSTMENT: CircleDollarSign,
};

export default function EntryRow({
  entry,
}: {
  entry: DaftariEntryItem;
}) {
  const style =
    TYPE_COLOR[entry.type] ?? TYPE_COLOR.ADJUSTMENT;

  const isNegative =
    entry.type === "EXPENSE" ||
    entry.type === "REFUND" ||
    entry.type === "WITHDRAWAL";

  const Icon =
    TYPE_ICON[entry.type] ?? CircleDollarSign;

  const description =
    entry.description ||
    (entry.expenseCategory
      ? EXPENSE_CATEGORY_LABEL[entry.expenseCategory]
      : "—");

  return (
    <article
      dir="rtl"
      className="basita-entry-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: t.spacing["4"],
        minWidth: 0,
        padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.md,
        transition:
          "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
      }}
    >
      {/* Entry information */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: t.spacing["3"],
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.full,
            background: style.bg,
            color: style.color,
          }}
        >
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </span>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
              marginBottom: 3,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 22,
                padding: "2px 9px",
                borderRadius: t.radius.full,
                background: style.bg,
                color: style.color,
                fontSize: t.typography.fontSize.xs,
                fontWeight:
                  t.typography.fontWeight.bold,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              {ENTRY_TYPE_LABEL[entry.type] ??
                entry.type}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight:
                t.typography.fontWeight.medium,
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={description}
          >
            {description}
          </p>

          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              margin: "3px 0 0",
              color: t.colors.text.light,
              fontSize: t.typography.fontSize.xs,
              lineHeight: 1.5,
            }}
          >
            <span aria-hidden="true">•</span>
            <span>
              {new Date(
                entry.entryDate
              ).toLocaleDateString("ar-SA")}
            </span>
          </p>
        </div>
      </div>

      {/* Amount */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: isNegative
              ? t.colors.semantic.danger
              : t.colors.semantic.success,
            fontSize: t.typography.fontSize.sm,
            fontWeight:
              t.typography.fontWeight.bold,
            whiteSpace: "nowrap",
            direction: "rtl",
          }}
        >
          <span aria-hidden="true">
            {isNegative ? "−" : "+"}
          </span>

          <span>{entry.amount} ر.س</span>
        </span>

        <span
          style={{
            color: t.colors.text.light,
            fontSize: 10,
            lineHeight: 1.4,
          }}
        >
          {isNegative ? "خصم من الرصيد" : "إضافة للرصيد"}
        </span>
      </div>

      <style>{`
        .basita-entry-row:hover {
          border-color: ${t.colors.primary[600]};
          box-shadow: 0 4px 14px rgba(75, 56, 34, 0.06);
          transform: translateY(-1px);
        }

        @media (max-width: 520px) {
          .basita-entry-row {
            align-items: flex-start !important;
            padding: ${t.spacing["3"]} !important;
          }

          .basita-entry-row > div:first-child {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-entry-row > div:first-child > span {
            width: 32px !important;
            height: 32px !important;
          }

          .basita-entry-row > div:first-child > span svg {
            width: 15px !important;
            height: 15px !important;
          }

          .basita-entry-row > div:last-child {
            padding-top: 2px;
          }

          .basita-entry-row > div:last-child > span:last-child {
            display: none !important;
          }
        }

        @media (max-width: 380px) {
          .basita-entry-row {
            gap: ${t.spacing["2"]} !important;
          }

          .basita-entry-row p {
            max-width: 150px;
          }

          .basita-entry-row > div:last-child > span:first-child {
            font-size: ${t.typography.fontSize.xs} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-entry-row {
            transition: none !important;
          }

          .basita-entry-row:hover {
            transform: none !important;
          }
        }
      `}</style>
    </article>
  );
}