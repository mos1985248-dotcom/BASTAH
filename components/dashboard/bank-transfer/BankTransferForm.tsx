// components/dashboard/bank-transfer/BankTransferForm.tsx
// الحقول الثلاثة تطابق bankTransferSetupSchema حرفياً (lib/validation.ts):
// iban (SA + 22 رقم)، accountHolder، bankName. POST /api/stores/bank-transfer
// يفعّلها فوراً — لا موافقة إدارية، بأي باقة (مجانية أو مدفوعة).
"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

export default function BankTransferForm({ onConnected }: { onConnected: () => void }) {
  const [iban, setIban] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleEnable = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/stores/bank-transfer", { iban, accountHolder, bankName });
      setIban("");
      setAccountHolder("");
      setBankName("");
      onConnected();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تفعيل التحويل البنكي");
    } finally {
      setSaving(false);
    }
  };

  const valid = /^SA\d{22}$/i.test(iban.trim()) && accountHolder.trim().length >= 2 && bankName.trim().length >= 2;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <div>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
          فعّلي استقبال دفعات المشترين مباشرة بحسابك البنكي — بدون انتظار ربط بوابة دفع إلكتروني. مناسبة بالذات لو متجرك على الباقة المجانية.
        </p>
        <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
          المشتري يحوّل المبلغ لحسابك ويرفع إثبات التحويل، وتراجعينه أنتِ من صفحة الطلب قبل التجهيز.
        </p>
      </div>

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>رقم الآيبان (IBAN)</span>
        <input
          value={iban}
          onChange={(e) => setIban(e.target.value.toUpperCase())}
          placeholder="SA0000000000000000000000"
          dir="ltr"
          maxLength={24}
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
        />
      </label>

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>اسم صاحب الحساب</span>
        <input
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="كما هو مسجَّل بالبنك"
          dir="rtl"
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
        />
      </label>

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>اسم البنك</span>
        <input
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="مثال: مصرف الراجحي"
          dir="rtl"
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
        />
      </label>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <button
        onClick={handleEnable}
        disabled={saving || !valid}
        style={{
          padding: 12, borderRadius: t.radius.md, border: "none",
          background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white,
          fontWeight: t.typography.fontWeight.bold, fontSize: 14,
          cursor: saving || !valid ? "not-allowed" : "pointer",
          opacity: !valid ? 0.6 : 1,
        }}
      >
        {saving ? "جاري التفعيل..." : "تفعيل التحويل البنكي"}
      </button>
      <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>
        رقم الآيبان يُعرَض للمشتري وقت الدفع فقط — لا يظهر لأي طرف آخر.
      </p>
    </div>
  );
}
