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
        gap: t.spacing["3"],
        minWidth: 0,
        padding: `${t.spacing["2"]} ${t.spacing["3"]}`,
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
          gap: t.spacing["2"],
          minWidth: 0,
          flex: 1,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
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
            size={15}
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
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 20,
                padding: "2px 7px",
                borderRadius: t.radius.full,
                background: style.bg,
                color: style.color,
                fontSize: 10,
                fontWeight:
                  t.typography.fontWeight.bold,
                lineHeight: 1.35,
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
              fontSize: 13,
              fontWeight:
                t.typography.fontWeight.medium,
              lineHeight: 1.45,
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
              gap: 4,
              margin: "2px 0 0",
              color: t.colors.text.light,
              fontSize: 10,
              lineHeight: 1.4,
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
          gap: 1,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            color: isNegative
              ? t.colors.semantic.danger
              : t.colors.semantic.success,
            fontSize: 13,
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
            fontSize: 9,
            lineHeight: 1.4,
          }}
        >
          {isNegative
            ? "خصم من الرصيد"
            : "إضافة للرصيد"}
        </span>
      </div>

      <style>{`
        .basita-entry-row:hover {
          border-color: ${t.colors.primary[600]};
          box-shadow: 0 3px 11px rgba(75, 56, 34, 0.05);
          transform: translateY(-1px);
        }

        @media (max-width: 520px) {
          .basita-entry-row {
            align-items: flex-start !important;
            padding: ${t.spacing["2"]} !important;
          }

          .basita-entry-row > div:first-child {
            gap: 7px !important;
          }

          .basita-entry-row > div:first-child > span {
            width: 30px !important;
            height: 30px !important;
          }

          .basita-entry-row > div:first-child > span svg {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-entry-row > div:last-child {
            padding-top: 1px;
          }

          .basita-entry-row > div:last-child > span:last-child {
            display: none !important;
          }

          .basita-entry-row p {
            font-size: 12px !important;
          }
        }

        @media (max-width: 380px) {
          .basita-entry-row {
            gap: 7px !important;
          }

          .basita-entry-row p {
            max-width: 135px;
          }

          .basita-entry-row > div:first-child > span {
            width: 28px !important;
            height: 28px !important;
          }

          .basita-entry-row > div:last-child > span:first-child {
            font-size: 12px !important;
          }

          .basita-entry-row > div:last-child > span:first-child span:last-child {
            font-size: 11px !important;
          }
        }

        @media (max-width: 320px) {
          .basita-entry-row {
            padding: 7px !important;
          }

          .basita-entry-row p {
            max-width: 115px;
          }

          .basita-entry-row > div:first-child > span {
            width: 27px !important;
            height: 27px !important;
          }

          .basita-entry-row > div:first-child > span svg {
            width: 13px !important;
            height: 13px !important;
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