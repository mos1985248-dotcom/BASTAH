// components/dashboard/bank-transfer/BankTransferForm.tsx
// الحقول الثلاثة تطابق bankTransferSetupSchema حرفياً (lib/validation.ts):
// iban (SA + 22 رقم)، accountHolder، bankName. POST /api/stores/bank-transfer
// يفعّلها فوراً — لا موافقة إدارية، بأي باقة (مجانية أو مدفوعة).

"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

export default function BankTransferForm({
  onConnected,
}: {
  onConnected: () => void;
}) {
  const [iban, setIban] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleEnable = async () => {
    setSaving(true);
    setError("");

    try {
      await api.post("/api/stores/bank-transfer", {
        iban: iban.trim().toUpperCase(),
        accountHolder: accountHolder.trim(),
        bankName: bankName.trim(),
      });

      setIban("");
      setAccountHolder("");
      setBankName("");
      onConnected();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "تعذّر تفعيل التحويل البنكي"
      );
    } finally {
      setSaving(false);
    }
  };

  const valid =
    /^SA\d{22}$/i.test(iban.trim()) &&
    accountHolder.trim().length >= 2 &&
    bankName.trim().length >= 2;

  const inputStyle = {
    width: "100%",
    minHeight: 46,
    boxSizing: "border-box" as const,
    padding: "10px 13px",
    border: `1px solid ${t.colors.cream.border}`,
    borderRadius: t.radius.md,
    background: t.colors.white,
    color: t.colors.text.dark,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    outline: "none",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 7,
    color: t.colors.text.dark,
    fontSize: t.typography.fontSize.xs,
    fontWeight: t.typography.fontWeight.bold,
  };

  return (
    <div
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        padding: "22px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.primary[50],
            color: t.colors.primary[800],
          }}
        >
          <CheckCircle2 size={20} strokeWidth={1.8} />
        </div>

        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            بيانات الحساب البنكي
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              maxWidth: 760,
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.sm,
              lineHeight: 1.8,
            }}
          >
            استقبل دفعات المشترين مباشرة في حسابك البنكي دون الحاجة إلى ربط
            بوابة دفع إلكترونية. التحويل البنكي متاح أيضًا على الباقة المجانية.
          </p>

          <p
            style={{
              margin: "3px 0 0",
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.xs,
              lineHeight: 1.8,
            }}
          >
            يحوّل المشتري المبلغ إلى حسابك ثم يرفع إثبات التحويل، ويمكن مراجعة
            الإثبات من صفحة الطلب قبل التجهيز.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* IBAN */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>رقم الآيبان (IBAN)</span>

          <input
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="SA0000000000000000000000"
            dir="ltr"
            maxLength={24}
            inputMode="text"
            autoComplete="off"
            disabled={saving}
            aria-label="رقم الآيبان"
            style={{
              ...inputStyle,
              minHeight: 50,
              fontSize: 15,
              letterSpacing: "0.035em",
              textAlign: "left",
            }}
          />

          <span
            style={{
              display: "block",
              marginTop: 6,
              color: t.colors.text.light,
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            24 خانة، ويبدأ بـ SA
          </span>
        </label>

        {/* Account + Bank */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 14,
          }}
        >
          <label style={{ display: "block" }}>
            <span style={labelStyle}>اسم صاحب الحساب</span>

            <input
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="كما هو مسجّل لدى البنك"
              dir="rtl"
              autoComplete="name"
              disabled={saving}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "block" }}>
            <span style={labelStyle}>اسم البنك</span>

            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="مثال: مصرف الراجحي"
              dir="rtl"
              autoComplete="organization"
              disabled={saving}
              style={inputStyle}
            />
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: t.radius.md,
            background: t.colors.semantic.dangerBg,
            color: t.colors.semantic.danger,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
          }}
        >
          <AlertTriangle size={14} strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      {/* Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 20,
          paddingTop: 18,
          borderTop: `1px solid ${t.colors.cream.borderLight}`,
        }}
      >
        <button
          type="button"
          onClick={handleEnable}
          disabled={saving || !valid}
          style={{
            width: 220,
            minHeight: 46,
            flexShrink: 0,
            border: "none",
            borderRadius: t.radius.md,
            background: valid
              ? t.colors.primary[800]
              : t.colors.primary[100],
            color: valid ? t.colors.white : t.colors.text.light,
            fontFamily: t.typography.fontFamily.base,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: saving || !valid ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "background-color 0.18s ease, opacity 0.18s ease",
          }}
        >
          {saving ? "جاري التفعيل..." : "تفعيل التحويل البنكي"}
        </button>

        <p
          style={{
            margin: 0,
            color: t.colors.text.light,
            fontSize: 11,
            lineHeight: 1.8,
          }}
        >
          رقم الآيبان الكامل لا يظهر هنا، ويُعرض للمشتري فقط عند اختيار
          التحويل البنكي أثناء الدفع.
        </p>
      </div>

      {/* Mobile */}
      <style jsx>{`
        @media (max-width: 720px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="border-top"] {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}