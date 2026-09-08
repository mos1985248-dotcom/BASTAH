// components/dashboard/shipping/ShippingZoneRow.tsx
"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import ShippingZoneForm, { ShippingZoneFormValues } from "./ShippingZoneForm";

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
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{zone.nameAr}</p>
            {zone.isActive ? (
              <StatusBadge label="مفعّلة" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
            ) : (
              <StatusBadge label="معطّلة" color={t.colors.text.light} bg={t.colors.cream.warm} />
            )}
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: t.colors.text.mid }}>{zone.regions.join("، ")}</p>
          <p style={{ margin: 0, fontSize: 12, color: t.colors.text.mid }}>
            {zone.isFree ? "شحن مجاني" : `${zone.price} ر.س`}
            {zone.minOrderAmt != null && ` — مجاني فوق ${zone.minOrderAmt} ر.س`}
            {" · "}
            {zone.minDays}-{zone.maxDays} يوم
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={{ padding: "6px 12px", borderRadius: t.radius.full, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.primary[800], fontSize: 12, cursor: "pointer" }}>
            تعديل
          </button>
          <button onClick={toggleActive} disabled={busy} style={{ padding: "6px 12px", borderRadius: t.radius.full, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.text.mid, fontSize: 12, cursor: busy ? "not-allowed" : "pointer" }}>
            {zone.isActive ? "تعطيل" : "تفعيل"}
          </button>
          <button onClick={() => setConfirmOpen(true)} disabled={busy} style={{ padding: "6px 12px", borderRadius: t.radius.full, border: `1px solid ${t.colors.semantic.danger}`, background: t.colors.white, color: t.colors.semantic.danger, fontSize: 12, cursor: busy ? "not-allowed" : "pointer" }}>
            حذف
          </button>
        </div>
      </div>

      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["2"]} 0 0`, fontSize: 12, color: t.colors.semantic.danger }}>
          <AlertTriangle size={12} strokeWidth={1.8} />
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
