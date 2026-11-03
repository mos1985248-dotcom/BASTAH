// components/orders/BankTransferPayment.tsx
// يظهر فقط لطلبات paymentMethod=BANK_TRANSFER. ثلاث حالات:
// 1) لم يرفع المشتري إثباتاً بعد → نموذج رفع (رقم مرجعي إلزامي + صورة إلزامية)
// 2) رفع الإثبات وبانتظار مراجعة التاجر → رسالة "قيد المراجعة"
// 3) paymentStatus=PAID → لا يظهر هذا المكوّن أصلاً (الصفحة الأم تتحقق)
// عرض فقط: منطق الرفع (POST /api/orders/:id/bank-transfer-proof) كما كان حرفياً.
"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Landmark, MapPin, UploadCloud } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "./order.module.css";

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
  const [copied, setCopied] = useState(false);

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

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(bankAccount?.iban ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* النسخ غير متاح في هذا المتصفح: يبقى الرقم ظاهراً للنسخ اليدوي */
    }
  };

  return (
    <section className={c.card} style={uiVars} aria-labelledby="bank-title">
      <div className={c.cardHead}>
        <Landmark size={19} strokeWidth={1.7} aria-hidden="true" />
        <h2 id="bank-title" className={c.cardTitle}>الدفع بتحويل بنكي</h2>
      </div>

      <div className={`${c.cardBody} ${c.bank}`}>
        {bankAccount && (
          <div className={c.info}>
            <InfoRow label="اسم صاحب الحساب" value={bankAccount.accountHolder} />
            <InfoRow label="البنك" value={bankAccount.bankName} />
            <InfoRow label="رقم الآيبان" value={bankAccount.iban} dir="ltr">
              {bankAccount.iban && (
                <button type="button" className={c.copy} onClick={copyIban}>
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
              )}
            </InfoRow>
          </div>
        )}

        {pickupInfo && (
          <div className={c.pickup}>
            <p className={c.pickupTitle}>
              <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
              استلام شخصي من موقع التاجر
            </p>
            <p className={c.pickupText}>
              {pickupInfo.city}
              {pickupInfo.region ? `، ${pickupInfo.region}` : ""}
            </p>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={c.mapLink}>
                فتح الموقع بخرائط قوقل ←
              </a>
            )}
          </div>
        )}

        {bankTransferSubmittedAt ? (
          <p className={c.sent} role="status">
            <CheckCircle2 size={18} strokeWidth={1.8} aria-hidden="true" />
            تم رفع إثبات التحويل — بانتظار مراجعة التاجر لتأكيد الطلب
          </p>
        ) : (
          <>
            <p className={c.proofNote}>بعد إتمام التحويل، ارفع رقم العملية وصورة الإيصال:</p>
            <input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="الرقم المرجعي للتحويل"
              aria-label="الرقم المرجعي للتحويل"
              dir="rtl"
              className={c.input}
            />
            <label className={c.upload}>
              <UploadCloud size={18} strokeWidth={1.8} aria-hidden="true" />
              {file ? file.name : "اختيار صورة إيصال التحويل"}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {error && (
              <p className={c.err} role="alert">
                <AlertTriangle size={15} strokeWidth={1.8} aria-hidden="true" />
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || referenceNumber.trim().length < 3 || !file}
              className={c.submit}
            >
              {uploading ? "جاري الرفع..." : "رفع إثبات التحويل"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  dir = "rtl",
  children,
}: {
  label: string;
  value: string | null;
  dir?: "rtl" | "ltr";
  children?: React.ReactNode;
}) {
  return (
    <div className={c.infoRow}>
      <span className={c.infoLabel}>{label}</span>
      <span className={c.infoValue}>
        <span dir={dir}>{value ?? "—"}</span>
        {children}
      </span>
    </div>
  );
}
