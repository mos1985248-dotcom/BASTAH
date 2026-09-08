// components/dashboard/payment-gateway/PaymentGatewayForm.tsx
// الحقول الثلاثة هنا تطابق connectGatewaySchema حرفياً (lib/validation.ts):
// publishableKey (pk_test_/pk_live_)، secretKey (sk_test_/sk_live_)،
// webhookSecret (نص، حد أدنى 16 حرف). POST /api/stores/payment-gateway
// يتحقق فعلياً من صلاحية secretKey عند Moyasar قبل القبول (422 لو خاطئ).
"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";

const WEBHOOK_PATH = "/api/payments/moyasar/webhook";

export default function PaymentGatewayForm({ onConnected }: { onConnected: () => void }) {
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}${WEBHOOK_PATH}` : WEBHOOK_PATH;

  const handleConnect = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/stores/payment-gateway", { publishableKey, secretKey, webhookSecret });
      setPublishableKey("");
      setSecretKey("");
      setWebhookSecret("");
      onConnected();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر ربط بوابة الدفع");
    } finally {
      setSaving(false);
    }
  };

  const valid = /^pk_(test|live)_/.test(publishableKey) && /^sk_(test|live)_/.test(secretKey) && webhookSecret.trim().length >= 16;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <div>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
          اربطي حساب Moyasar الخاص بمتجرك — كل عملية دفع إلكتروني تمر مباشرة بحسابك أنت، وليس بحساب بسطة.
        </p>
        <p style={{ margin: `${t.spacing["1"]} 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
          بسطة لا تخزّن ولا ترى بيانات بطاقة عميلك أبداً — الدفع يتم بالكامل عبر صفحة Moyasar المستضافة.
        </p>
      </div>

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>المفتاح العلني (Publishable Key)</span>
        <input
          value={publishableKey}
          onChange={(e) => setPublishableKey(e.target.value)}
          placeholder="pk_test_..."
          dir="ltr"
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
        />
      </label>

      <label style={{ display: "block" }}>
        <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>المفتاح السري (Secret Key)</span>
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="sk_test_..."
          dir="ltr"
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
        />
      </label>

      <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.md, padding: t.spacing["3"] }}>
        <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: 12, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
          يتطلب هذا إعداد Webhook <strong>مرة واحدة فقط</strong> بلوحة تحكم Moyasar، بتوجيهه لهذا المسار:
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.sm, padding: "8px 10px", marginBottom: t.spacing["2"] }}>
          <code dir="ltr" style={{ fontSize: 12, color: t.colors.primary[800], flex: 1, overflowX: "auto", whiteSpace: "nowrap" }}>{webhookUrl}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(webhookUrl)}
            style={{ flexShrink: 0, padding: "4px 10px", borderRadius: t.radius.full, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.primary[800], fontSize: 11, cursor: "pointer" }}
          >
            نسخ
          </button>
        </div>
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>سر الـ Webhook (Webhook Secret)</span>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="انسخيه من إعدادات الـ Webhook بحساب Moyasar"
            dir="ltr"
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
          />
        </label>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
          {error}
        </p>
      )}

      <button
        onClick={handleConnect}
        disabled={saving || !valid}
        style={{
          padding: 12, borderRadius: t.radius.md, border: "none",
          background: saving ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white,
          fontWeight: t.typography.fontWeight.bold, fontSize: 14,
          cursor: saving || !valid ? "not-allowed" : "pointer",
          opacity: !valid ? 0.6 : 1,
        }}
      >
        {saving ? "جاري التحقق والربط..." : "حفظ وربط بوابة الدفع"}
      </button>
      <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>
        سنتحقق من صحة المفتاح السري مباشرة عند Moyasar قبل حفظه — لن يُقبل إن كان غير صالح.
      </p>
    </div>
  );
}
