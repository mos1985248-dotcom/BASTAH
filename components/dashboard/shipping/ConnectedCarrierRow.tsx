// components/dashboard/shipping/ConnectedCarrierRow.tsx
// PATCH /api/stores/shipping/[id] لتبديل isActive، DELETE لفصل الشركة.
// لا يعرض ولا يعدّل credentialsEnc إطلاقاً — الـAPI أصلاً لا يرجعه.
"use client";

import { useState } from "react";
import { Truck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

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
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: t.radius.md, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={16} strokeWidth={1.7} color={t.colors.primary[800]} />
          </span>
          <div>
            <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{displayNameAr}</p>
            <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light, display: "flex", alignItems: "center", gap: 4 }}>
              {link.lastTestOk === true ? (
                <>آخر اختبار: نجح <CheckCircle2 size={11} strokeWidth={2} color={t.colors.semantic.success} /></>
              ) : link.lastTestOk === false ? (
                <>آخر اختبار: فشل <XCircle size={11} strokeWidth={2} color={t.colors.semantic.danger} /></>
              ) : (
                "لم يُختبَر بعد"
              )}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {link.isActive ? (
            <StatusBadge label="مفعّلة" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
          ) : (
            <StatusBadge label="معطّلة" color={t.colors.text.light} bg={t.colors.cream.warm} />
          )}
          <button
            onClick={toggle}
            disabled={busy}
            style={{ padding: "7px 14px", borderRadius: t.radius.full, border: `1px solid ${t.colors.cream.border}`, background: t.colors.white, color: t.colors.primary[800], fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: busy ? "not-allowed" : "pointer" }}
          >
            {link.isActive ? "تعطيل" : "تفعيل"}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            style={{ padding: "7px 14px", borderRadius: t.radius.full, border: `1px solid ${t.colors.semantic.danger}`, background: t.colors.white, color: t.colors.semantic.danger, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: busy ? "not-allowed" : "pointer" }}
          >
            فصل
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
        title={`فصل ${displayNameAr}؟`}
        body="سيتم حذف بيانات الاعتماد المحفوظة لهذه الشركة نهائياً من متجرك. يمكنك ربطها مجدداً لاحقاً بإدخال البيانات من جديد."
        confirmLabel="فصل نهائياً"
        danger
        onConfirm={disconnect}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
