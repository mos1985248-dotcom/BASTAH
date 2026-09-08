// components/orders/BankTransferPayment.tsx
// يظهر فقط لطلبات paymentMethod=BANK_TRANSFER. ثلاث حالات:
// 1) لسه ما رفع المشتري إثبات → نموذج رفع (رقم مرجعي إلزامي + صورة إلزامية)
// 2) رفع الإثبات وبانتظار مراجعة التاجر → رسالة "قيد المراجعة"
// 3) paymentStatus=PAID → لا يظهر هذا المكوّن أصلاً (الصفحة الأم تتحقق)
"use client";

import { useState } from "react";
import { Landmark, MapPin, UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";
import { t } from "@/theme";

interface BankAccount { iban: string | null; accountHolder: string | null; bankName: string | null }
interface PickupInfo { city: string | null; region: string | null; latitude: number | null; longitude: number | null }

interface Props {
  orderId: string;
  bankAccount: BankAccount | null | undefined;
  pickupInfo: PickupInfo | null | undefined;
  bankTransferSubmittedAt: string | null;
  onSubmitted: () => void;
}

export default function BankTransferPayment({ orderId, bankAccount, pickupInfo, bankTransferSubmittedAt, onSubmitted }: Props) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const mapsUrl =
    pickupInfo?.latitude != null && pickupInfo?.longitude != null
      ? `https://www.google.com/maps?q=${pickupInfo.latitude},${pickupInfo.longitude}`
      : null;

  const handleSubmit = async () => {
    if (!file) {
      setError("صورة إثبات التحويل مطلوبة");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("referenceNumber", referenceNumber);
      fd.append("file", file);
      const res = await fetch(`/api/orders/${orderId}/bank-transfer-proof`, { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "فشل رفع الإثبات");
      onSubmitted();
    } catch (err: any) {
      setError(err.message ?? "تعذّر رفع الإثبات");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], textAlign: "right", marginBottom: t.spacing["4"] }}>
      <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
        <Landmark size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
        الدفع بتحويل بنكي
      </p>

      {bankAccount && (
        <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: t.spacing["3"], marginBottom: t.spacing["3"], display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoRow label="اسم صاحب الحساب" value={bankAccount.accountHolder} />
          <InfoRow label="البنك" value={bankAccount.bankName} />
          <InfoRow label="رقم الآيبان" value={bankAccount.iban} dir="ltr" />
        </div>
      )}

      {pickupInfo && (
        <div style={{ background: t.colors.white, borderRadius: t.radius.md, padding: t.spacing["3"], marginBottom: t.spacing["3"] }}>
          <p style={{ display: "flex", alignItems: "center", gap: 5, margin: "0 0 4px", fontSize: 12, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            <MapPin size={13} strokeWidth={1.8} />
            استلام شخصي من موقع التاجر
          </p>
          <p style={{ margin: 0, fontSize: 12, color: t.colors.text.body }}>{pickupInfo.city}{pickupInfo.region ? `، ${pickupInfo.region}` : ""}</p>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold, display: "inline-block", marginTop: 6 }}>
              فتح الموقع بخرائط قوقل ←
            </a>
          )}
        </div>
      )}

      {bankTransferSubmittedAt ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.success, background: t.colors.semantic.successBg, padding: t.spacing["3"], borderRadius: t.radius.md }}>
          <CheckCircle2 size={14} strokeWidth={1.8} />
          تم رفع إثبات التحويل — بانتظار مراجعة التاجر لتأكيد الطلب
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.mid }}>بعد إتمام التحويل، ارفعي رقم العملية وصورة الإيصال:</p>
          <input
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="الرقم المرجعي للتحويل"
            dir="rtl"
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" }}
          />
          <label
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", border: `1.5px dashed ${t.colors.cream.border}`, borderRadius: t.radius.md, cursor: "pointer", fontSize: 12, color: t.colors.text.mid, background: t.colors.white }}
          >
            <UploadCloud size={14} strokeWidth={1.8} />
            {file ? file.name : "اختيار صورة إيصال التحويل"}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
          </label>
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 5, margin: 0, fontSize: 11, color: t.colors.semantic.danger }}>
              <AlertTriangle size={11} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={uploading || referenceNumber.trim().length < 3 || !file}
            style={{ padding: 10, borderRadius: t.radius.md, border: "none", background: t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 13, cursor: uploading ? "not-allowed" : "pointer", opacity: referenceNumber.trim().length < 3 || !file ? 0.6 : 1 }}
          >
            {uploading ? "جاري الرفع..." : "رفع إثبات التحويل"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, dir = "rtl" }: { label: string; value: string | null; dir?: "rtl" | "ltr" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: t.colors.text.light }}>{label}</span>
      <span dir={dir} style={{ fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{value ?? "—"}</span>
    </div>
  );
}
