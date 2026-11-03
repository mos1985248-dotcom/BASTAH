// components/dashboard/shipping/ConnectedCarrierRow.tsx
// PATCH /api/stores/shipping/[id] لتبديل isActive، DELETE لفصل الشركة.
// لا يعرض ولا يعدّل credentialsEnc إطلاقاً — الـAPI أصلاً لا يرجعه.
"use client";

import { useState } from "react";
import { Truck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ui/ConfirmDialog";
import f from "../forms.module.css";
import s from "./shipping.module.css";

interface ConnectedCarrier {
  id: string;
  carrier: string;
  isActive: boolean;
  connectedAt: string;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
}

export default function ConnectedCarrierRow({
  link,
  displayNameAr,
  onChange,
}: {
  link: ConnectedCarrier;
  displayNameAr: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/api/stores/shipping/${link.id}`, { isActive: !link.isActive });
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحديث الحالة");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/api/stores/shipping/${link.id}`);
      setConfirmOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر فصل الشركة");
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${s.card} ${link.isActive ? "" : s.cardOff}`}>
      <div className={s.cardTop}>
        <div className={s.lead}>
          <span className={s.iconBox}>
            <Truck size={19} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <p className={s.name}>{displayNameAr}</p>
            <p className={s.meta}>
              {link.lastTestOk === true ? (
                <>آخر اختبار: نجح <CheckCircle2 size={13} strokeWidth={2} color="var(--ui-green)" aria-hidden="true" /></>
              ) : link.lastTestOk === false ? (
                <>آخر اختبار: فشل <XCircle size={13} strokeWidth={2} color="var(--ui-danger)" aria-hidden="true" /></>
              ) : (
                "لم يُختبَر بعد"
              )}
            </p>
          </div>
        </div>
        <StatusBadge label={link.isActive ? "مفعّلة" : "معطّلة"} tone={link.isActive ? "ok" : "off"} />
      </div>

      <div className={s.actions}>
        <button type="button" className={f.btnSm} onClick={toggle} disabled={busy}>{link.isActive ? "تعطيل" : "تفعيل"}</button>
        <button type="button" className={`${f.btnSm} ${f.btnDanger}`} onClick={() => setConfirmOpen(true)} disabled={busy}>فصل</button>
      </div>

      {error && (
        <p className={f.err} role="alert">
          <AlertTriangle size={13} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`فصل ${displayNameAr}؟`}
        body="سيتوقف حساب سعر الشحن عبر هذه الشركة لمتجرك فورًا. يمكنك تفعيلها مجدداً بضغطة واحدة في أي وقت."
        confirmLabel="فصل نهائياً"
        danger
        onConfirm={disconnect}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
