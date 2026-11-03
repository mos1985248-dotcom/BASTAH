// components/dashboard/bank-transfer/BankTransferStatus.tsx
// عرض فقط — يعكس حرفياً ما يرجعه GET /api/stores/bank-transfer
// (enabled, accountHolder, bankName, ibanPreview). الآيبان الكامل لا
// يظهر هنا (نفس الـAPI لا يعيده — يعرض مقنَّعاً فقط).
// التعطيل: DELETE /api/stores/bank-transfer كما كان؛ استُبدل confirm() الأصلي بنافذة تأكيد التطبيق.
"use client";
import { useState } from "react";
import { AlertTriangle, Landmark } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ui/ConfirmDialog";
import s from "../forms.module.css";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDisable = async () => {
    setConfirmOpen(false);
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
    <section className={s.panel} style={uiVars} aria-labelledby="bt-status-title">
      <div className={s.panelHead}>
        <div className={s.itemLead}>
          <span className={s.itemIcon} style={{ color: "var(--ui-green)" }}><Landmark size={18} strokeWidth={1.7} aria-hidden="true" /></span>
          <div>
            <h2 id="bt-status-title" className={s.panelTitle}>التحويل البنكي</h2>
            <p className={s.panelSub}>يستقبل المدفوعات مباشرة في حسابك</p>
          </div>
        </div>
        <StatusBadge label="مفعَّل" tone="ok" />
      </div>
      <div className={s.panelBody}>
        <div className={s.two}>
          <div>
            <p className={s.help}>صاحب الحساب</p>
            <p className={s.itemName}>{accountHolder ?? "—"}</p>
          </div>
          <div>
            <p className={s.help}>البنك</p>
            <p className={s.itemName}>{bankName ?? "—"}</p>
          </div>
        </div>
        <div>
          <p className={s.help}>رقم الآيبان</p>
          <code dir="ltr" style={{ fontSize: 15, fontWeight: 700, color: "var(--ui-ink)" }}>{ibanPreview ?? "—"}</code>
        </div>
        {error && (
          <p className={s.err} role="alert">
            <AlertTriangle size={14} strokeWidth={1.8} aria-hidden="true" />
            {error}
          </p>
        )}
        <button type="button" className={`${s.btnSm} ${s.btnDanger}`} style={{ alignSelf: "flex-start" }} onClick={() => setConfirmOpen(true)} disabled={disabling}>
          {disabling ? "جاري التعطيل..." : "تعطيل التحويل البنكي"}
        </button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="تعطيل التحويل البنكي؟"
        body="لن يتمكن المشترون من اختيار التحويل البنكي بعد الآن."
        confirmLabel="تعطيل"
        danger
        onConfirm={handleDisable}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
