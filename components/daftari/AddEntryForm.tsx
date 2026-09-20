// components/daftari/AddEntryForm.tsx

import { AlertTriangle, BookOpen, Plus, Wallet } from "lucide-react";
import { t } from "@/theme";
import { EXPENSE_CATEGORY_LABEL } from "./types";

export interface EntryFormState {
  type: string;
  amount: string;
  expenseCategory: string;
  description: string;
}

export default function AddEntryForm({
  form,
  onChange,
  onSubmit,
  submitting,
  error,
}: {
  form: EntryFormState;
  onChange: (patch: Partial<EntryFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 40,
    padding: "8px 11px",
    border: `1px solid ${t.colors.cream.border}`,
    borderRadius: t.radius.md,
    background: t.colors.white,
    color: t.colors.text.dark,
    fontSize: 13,
    lineHeight: 1.5,
    direction: "rtl",
    boxSizing: "border-box",
    outline: "none",
    transition:
      "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
  };

  return (
    <section
      dir="rtl"
      className="basita-add-entry-form"
      aria-labelledby="add-entry-title"
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        overflow: "hidden",
        boxShadow: "0 3px 13px rgba(75, 56, 34, 0.035)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
          background: t.colors.cream.bg,
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: 0,
            top: 0,
            width: 3,
            height: "100%",
            background: t.colors.gold[600],
          }}
        />

        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            color: t.colors.primary[800],
            boxShadow: "0 2px 6px rgba(75, 56, 34, 0.035)",
          }}
        >
          <BookOpen
            size={17}
            strokeWidth={1.7}
          />
        </span>

        <div style={{ minWidth: 0 }}>
          <h3
            id="add-entry-title"
            style={{
              margin: 0,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.45,
            }}
          >
            تسجيل قيد جديد
          </h3>

          <p
            style={{
              margin: "2px 0 0",
              color: t.colors.text.light,
              fontSize: 11,
              lineHeight: 1.45,
            }}
          >
            أضف حركة مالية إلى دفاترك
          </p>
        </div>
      </div>

      {/* Form */}
      <div
        className="basita-add-entry-fields"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["2"],
          padding: t.spacing["4"],
        }}
      >
        {/* Entry type */}
        <div>
          <label
            htmlFor="entry-type"
            style={{
              display: "block",
              marginBottom: 5,
              color: t.colors.text.dark,
              fontSize: 12,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            نوع القيد
          </label>

          <select
            id="entry-type"
            value={form.type}
            onChange={(e) =>
              onChange({ type: e.target.value })
            }
            style={inputStyle}
            className="basita-entry-input"
          >
            <option value="SALE">بيع (دخل)</option>
            <option value="EXPENSE">مصروف</option>
            <option value="REFUND">استرداد</option>
            <option value="WITHDRAWAL">سحب أرباح</option>
            <option value="ADJUSTMENT">تعديل يدوي</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="entry-amount"
            style={{
              display: "block",
              marginBottom: 5,
              color: t.colors.text.dark,
              fontSize: 12,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            المبلغ
          </label>

          <div
            style={{
              position: "relative",
            }}
          >
            <Wallet
              aria-hidden="true"
              size={15}
              strokeWidth={1.7}
              color={t.colors.text.light}
              style={{
                position: "absolute",
                insetInlineStart: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />

            <input
              id="entry-amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                onChange({ amount: e.target.value })
              }
              placeholder="المبلغ (ر.س)"
              style={{
                ...inputStyle,
                paddingInlineStart: 36,
                direction: "ltr",
                textAlign: "right",
              }}
              className="basita-entry-input"
            />
          </div>
        </div>

        {/* Expense category */}
        {form.type === "EXPENSE" && (
          <div>
            <label
              htmlFor="entry-expense-category"
              style={{
                display: "block",
                marginBottom: 5,
                color: t.colors.text.dark,
                fontSize: 12,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              تصنيف المصروف
            </label>

            <select
              id="entry-expense-category"
              value={form.expenseCategory}
              onChange={(e) =>
                onChange({
                  expenseCategory: e.target.value,
                })
              }
              style={inputStyle}
              className="basita-entry-input"
            >
              <option value="">
                تصنيف المصروف (اختياري)
              </option>

              {Object.entries(EXPENSE_CATEGORY_LABEL).map(
                ([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label
            htmlFor="entry-description"
            style={{
              display: "block",
              marginBottom: 5,
              color: t.colors.text.dark,
              fontSize: 12,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            الوصف
          </label>

          <input
            id="entry-description"
            value={form.description}
            onChange={(e) =>
              onChange({
                description: e.target.value,
              })
            }
            placeholder="وصف مختصر (اختياري)"
            style={inputStyle}
            className="basita-entry-input"
          />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 7,
              padding: "8px 10px",
              borderRadius: t.radius.md,
              border: `1px solid ${t.colors.semantic.danger}22`,
              background: t.colors.semantic.dangerBg,
              color: t.colors.semantic.danger,
              fontSize: 11,
              lineHeight: 1.65,
            }}
          >
            <AlertTriangle
              size={15}
              strokeWidth={1.8}
              style={{
                flexShrink: 0,
                marginTop: 2,
              }}
            />

            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="basita-add-entry-button"
          style={{
            width: "100%",
            minHeight: 43,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 14px",
            marginTop: 2,
            background: submitting
              ? t.colors.primary[600]
              : t.colors.primary[800],
            color: t.colors.white,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: 13,
            fontWeight: t.typography.fontWeight.bold,
            cursor: submitting
              ? "not-allowed"
              : "pointer",
            opacity: submitting ? 0.78 : 1,
            boxShadow: submitting
              ? "none"
              : "0 4px 12px rgba(75, 56, 34, 0.10)",
            transition:
              "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
          }}
        >
          {!submitting && (
            <Plus
              size={16}
              strokeWidth={2.2}
            />
          )}

          <span>
            {submitting ? "جاري الحفظ..." : "إضافة القيد"}
          </span>
        </button>
      </div>

      <style>{`
        .basita-entry-input:hover {
          border-color: ${t.colors.primary[600]} !important;
        }

        .basita-entry-input:focus {
          border-color: ${t.colors.primary[800]} !important;
          box-shadow: 0 0 0 3px rgba(75, 56, 34, 0.07);
        }

        .basita-add-entry-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(75, 56, 34, 0.14);
        }

        .basita-add-entry-button:not(:disabled):active {
          transform: translateY(0);
        }

        .basita-add-entry-button:focus-visible {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 3px;
        }

        @media (max-width: 480px) {
          .basita-add-entry-fields {
            padding: ${t.spacing["3"]} !important;
            gap: ${t.spacing["2"]} !important;
          }

          .basita-add-entry-form > div:first-child {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-entry-input {
            min-height: 40px !important;
          }

          .basita-add-entry-button {
            min-height: 42px !important;
          }
        }

        @media (max-width: 360px) {
          .basita-add-entry-fields {
            padding: 10px !important;
          }

          .basita-add-entry-form > div:first-child {
            padding: 10px !important;
          }

          .basita-entry-input {
            min-height: 39px !important;
            font-size: 12px !important;
          }

          .basita-add-entry-button {
            min-height: 41px !important;
            font-size: 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-entry-input,
          .basita-add-entry-button {
            transition: none !important;
          }

          .basita-add-entry-button:not(:disabled):hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}