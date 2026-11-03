// components/dashboard/shipping/ShippingZoneRow.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Clock, Gift } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ConfirmDialog from "@/components/dashboard/ui/ConfirmDialog";
import ShippingZoneForm, { ShippingZoneFormValues } from "./ShippingZoneForm";
import f from "../forms.module.css";
import s from "./shipping.module.css";

export interface ShippingZone extends ShippingZoneFormValues {
  id: string;
  isActive: boolean;
}

export default function ShippingZoneRow({ zone, onChange }: { zone: ShippingZone; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggleActive = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/api/stores/shipping-zones/${zone.id}`, { isActive: !zone.isActive });
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحديث الحالة");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/api/stores/shipping-zones/${zone.id}`);
      setConfirmOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حذف المنطقة");
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const save = async (values: ShippingZoneFormValues) => {
    await api.patch(`/api/stores/shipping-zones/${zone.id}`, values);
    setEditing(false);
    onChange();
  };

  if (editing) {
    return <ShippingZoneForm initial={zone} submitLabel="حفظ التعديلات" onSubmit={save} onCancel={() => setEditing(false)} />;
  }

  return (
    <div className={`${s.card} ${zone.isActive ? "" : s.cardOff}`}>
      <div className={s.cardTop}>
        <div className={s.lead}>
          <span className={s.iconBox}>
            <MapPin size={19} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className={s.name}>{zone.nameAr}</p>
        </div>
        <StatusBadge label={zone.isActive ? "مفعّلة" : "معطّلة"} tone={zone.isActive ? "ok" : "off"} />
      </div>

      <div className={s.chips}>
        {zone.regions.map((r) => (
          <span key={r} className={s.chip}>{r}</span>
        ))}
      </div>

      <div className={s.chips}>
        <span className={`${s.chip} ${zone.isFree ? s.chipGreen : s.chipGold}`}>
          {zone.isFree ? "شحن مجاني" : `${zone.price} ر.س`}
        </span>
        {zone.minOrderAmt != null && (
          <span className={s.chip}>
            <Gift size={12} strokeWidth={1.9} aria-hidden="true" />
            مجاني فوق {zone.minOrderAmt} ر.س
          </span>
        )}
        <span className={s.chip}>
          <Clock size={12} strokeWidth={1.9} aria-hidden="true" />
          {zone.minDays}-{zone.maxDays} يوم
        </span>
      </div>

      <div className={s.actions}>
        <button type="button" className={f.btnSm} onClick={() => setEditing(true)}>تعديل</button>
        <button type="button" className={f.btnSm} onClick={toggleActive} disabled={busy}>{zone.isActive ? "تعطيل" : "تفعيل"}</button>
        <button type="button" className={`${f.btnSm} ${f.btnDanger}`} onClick={() => setConfirmOpen(true)} disabled={busy}>حذف</button>
      </div>

      {error && (
        <p className={f.err} role="alert">
          <AlertTriangle size={13} strokeWidth={1.8} aria-hidden="true" />
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`حذف منطقة "${zone.nameAr}"؟`}
        body="لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف نهائياً"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
