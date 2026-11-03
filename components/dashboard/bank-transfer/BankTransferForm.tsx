// components/dashboard/bank-transfer/BankTransferForm.tsx
// الحقول الثلاثة تطابق bankTransferSetupSchema حرفياً (lib/validation.ts):
// iban (SA + 22 رقم)، accountHolder، bankName. POST /api/stores/bank-transfer
// يفعّلها فوراً — لا موافقة إدارية، بأي باقة (مجانية أو مدفوعة).
// المنطق كما كان حرفياً؛ التغيير في الشكل فقط.
"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "../forms.module.css";

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

  return (
    <section className={s.panel} style={uiVars} aria-labelledby="bt-form-title">
      <div className={s.panelHead}>
        <div className={s.itemLead}>
          <span className={s.itemIcon}><Landmark size={18} strokeWidth={1.7} aria-hidden="true" /></span>
          <div>
            <h2 id="bt-form-title" className={s.panelTitle}>بيانات الحساب البنكي</h2>
            <p className={s.panelSub}>أدخل بيانات حسابك لتفعيل التحويل البنكي</p>
          </div>
        </div>
      </div>
      <div className={s.panelBody}>
        <label className={s.fieldWrap}>
          <span className={s.fieldLabel}>رقم الآيبان (IBAN)</span>
          <input className={`${s.field} ${s.ltr}`} value={iban} onChange={(e) => setIban(e.target.value)} placeholder="SA0000000000000000000000" dir="ltr" maxLength={24} aria-label="رقم الآيبان" autoComplete="off" />
          <span className={s.help} style={{ display: "block", marginTop: 4 }}>24 خانة، ويبدأ بـ SA</span>
        </label>
        <div className={s.two}>
          <label className={s.fieldWrap}>
            <span className={s.fieldLabel}>اسم صاحب الحساب</span>
            <input className={s.field} value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="كما هو مسجّل لدى البنك" />
          </label>
          <label className={s.fieldWrap}>
            <span className={s.fieldLabel}>اسم البنك</span>
            <input className={s.field} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="مثال: مصرف الراجحي" />
          </label>
        </div>

        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}

        <button type="button" className={s.cta} onClick={handleEnable} disabled={saving || !valid}>
          <CheckCircle2 size={16} strokeWidth={1.9} aria-hidden="true" />
          {saving ? "جاري التفعيل..." : "تفعيل التحويل البنكي"}
        </button>
        <p className={s.help}>رقم الآيبان الكامل لا يظهر هنا، ويُعرض للمشتري فقط عند اختيار التحويل البنكي أثناء الدفع.</p>
      </div>
    </section>
  );
}
