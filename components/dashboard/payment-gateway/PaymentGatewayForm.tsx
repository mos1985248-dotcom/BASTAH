// components/dashboard/payment-gateway/PaymentGatewayForm.tsx
// الحقول الثلاثة هنا تطابق connectGatewaySchema حرفياً (lib/validation.ts):
// publishableKey (pk_test_/pk_live_)، secretKey (sk_test_/sk_live_)،
// webhookSecret (نص، حد أدنى 16 حرف). POST /api/stores/payment-gateway
// يتحقق فعلياً من صلاحية secretKey عند Moyasar قبل القبول (422 لو خاطئ).
// المنطق كما كان حرفياً؛ التغيير في الشكل والصياغة فقط.
"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

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
    <section className={s.panel} style={uiVars} aria-labelledby="gw-form-title">
      <div className={s.panelHead}>
        <div>
          <h2 id="gw-form-title" className={s.panelTitle}>ربط حساب Moyasar</h2>
          <p className={s.panelSub}>كل عملية دفع إلكتروني تمر مباشرة بحسابك أنت، وليس بحساب بسطة</p>
        </div>
      </div>
      <div className={s.panelBody}>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>المفتاح العلني (Publishable Key)</span>
          <input className={`${s.field} ${s.ltr}`} value={publishableKey} onChange={(e) => setPublishableKey(e.target.value)} placeholder="pk_test_..." dir="ltr" autoComplete="off" />
        </label>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>المفتاح السري (Secret Key)</span>
          <input className={`${s.field} ${s.ltr}`} type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="sk_test_..." dir="ltr" autoComplete="off" />
        </label>

        <div className={s.formBox}>
          <p className={s.help} style={{ color: "var(--ui-ink)" }}>
            يتطلب هذا إعداد Webhook <strong>مرة واحدة فقط</strong> بلوحة تحكم Moyasar، بتوجيهه لهذا المسار:
          </p>
          <div className={s.inline} style={{ alignItems: "center" }}>
            <code dir="ltr" className={s.field} style={{ display: "flex", alignItems: "center", overflowX: "auto", whiteSpace: "nowrap", fontSize: 13 }}>{webhookUrl}</code>
            <button type="button" className={s.btnSm} style={{ minHeight: 48 }} onClick={() => navigator.clipboard?.writeText(webhookUrl)}>نسخ</button>
          </div>
          <label className={s.fieldWrap}>
            <span className={s.fieldLabel}>سر الـ Webhook (Webhook Secret)</span>
            <input className={`${s.field} ${s.ltr}`} type="password" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="انسخه من إعدادات الـ Webhook بحساب Moyasar" dir="ltr" autoComplete="off" />
          </label>
        </div>

        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}

        <button type="button" className={s.cta} onClick={handleConnect} disabled={saving || !valid}>
          {saving ? "جاري التحقق والربط..." : "حفظ وربط بوابة الدفع"}
        </button>
        <p className={s.help}>سنتحقق من صحة المفتاح السري مباشرة عند Moyasar قبل حفظه — لن يُقبل إن كان غير صالح.</p>
      </div>
    </section>
  );
}
