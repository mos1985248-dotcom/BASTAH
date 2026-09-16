// components/dashboard/bank-transfer/BankTransferStatus.tsx
// عرض فقط — يعكس حرفياً ما يرجعه GET /api/stores/bank-transfer
// (enabled, accountHolder, bankName, ibanPreview). الآيبان الكامل لا
// يظهر هنا (نفس الـAPI لا يعيده — يعرض مقنَّعاً فقط).

"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";

interface Props {
  accountHolder: string | null;
  bankName: string | null;
  ibanPreview: string | null;
  onDisabled: () => void;
}

export default function BankTransferStatus({
  accountHolder,
  bankName,
  ibanPreview,
  onDisabled,
}: Props) {
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async () => {
    if (
      !confirm(
        "تعطيل التحويل البنكي؟ المشترون الحاليون ما راح يقدرون يختارونه بعدها."
      )
    ) {
      return;
    }

    setDisabling(true);
    setError("");

    try {
      await api.delete("/api/stores/bank-transfer");
      onDisabled();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "تعذّر تعطيل التحويل البنكي"
      );
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        padding: t.spacing["4"],
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: t.spacing["4"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
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
              borderRadius: t.radius.md,
              background: t.colors.primary[100],
            }}
          >
            <Landmark
              size={17}
              strokeWidth={1.8}
              color={t.colors.primary[800]}
            />
          </span>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
              }}
            >
              التحويل البنكي
            </p>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.light,
              }}
            >
              يستقبل المدفوعات مباشرة في حسابك
            </p>
          </div>
        </div>

        <StatusBadge
          label="مفعَّل"
          color={t.colors.semantic.success}
          bg={t.colors.semantic.successBg}
        />
      </div>

      {/* Bank details */}
      <div
        style={{
          display: "grid",
          gap: t.spacing["2"],
          padding: `${t.spacing["3"]} 0`,
          borderTop: `1px solid ${t.colors.cream.borderLight}`,
          borderBottom: `1px solid ${t.colors.cream.borderLight}`,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: t.colors.text.light,
            }}
          >
            صاحب الحساب
          </p>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.body,
              lineHeight: 1.7,
            }}
          >
            {accountHolder ?? "—"}
          </p>
        </div>

        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: t.colors.text.light,
            }}
          >
            البنك
          </p>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.body,
              lineHeight: 1.7,
            }}
          >
            {bankName ?? "—"}
          </p>
        </div>

        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: t.colors.text.light,
            }}
          >
            رقم الآيبان
          </p>

          <code
            dir="ltr"
            style={{
              display: "inline-block",
              marginTop: 2,
              fontSize: 13,
              color: t.colors.text.body,
              letterSpacing: "0.02em",
              wordBreak: "break-all",
            }}
          >
            {ibanPreview ?? "—"}
          </code>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            fontSize: 12,
            color: t.colors.semantic.danger,
            lineHeight: 1.7,
          }}
        >
          {error}
        </p>
      )}

      {/* Disable */}
      <button
        type="button"
        onClick={handleDisable}
        disabled={disabling}
        style={{
          width: "100%",
          marginTop: t.spacing["3"],
          minHeight: 40,
          padding: "9px 14px",
          borderRadius: t.radius.md,
          border: `1px solid ${t.colors.semantic.danger}`,
          background: t.colors.white,
          color: t.colors.semantic.danger,
          fontSize: 12,
          fontWeight: t.typography.fontWeight.bold,
          cursor: disabling ? "not-allowed" : "pointer",
          opacity: disabling ? 0.65 : 1,
          transition: "background-color 0.18s ease, color 0.18s ease",
        }}
      >
        {disabling ? "جاري التعطيل..." : "تعطيل التحويل البنكي"}
      </button>
    </div>
  );
}