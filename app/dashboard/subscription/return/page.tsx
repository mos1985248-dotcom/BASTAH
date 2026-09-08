// app/dashboard/subscription/return/page.tsx
// Moyasar يُعيد المستخدم هنا بعد الدفع (success_url). لا نعتبر مجرد
// الوصول لهذه الصفحة دليل نجاح — نستدعي verify-payment فوراً (نفس نمط
// orders/[id]/page.tsx تماماً) لأن الـwebhook قد يتأخر أو يفشل الوصول.
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PartyPopper, AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";

export default function SubscriptionReturnPage() {
  const params = useSearchParams();
  const router = useRouter();
  const invoiceId = params.get("invoiceId");

  const [status, setStatus] = useState<"checking" | "paid" | "failed" | "error">("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!invoiceId) {
      setStatus("error");
      setMessage("رابط غير صالح — لا يوجد معرّف فاتورة");
      return;
    }

    fetch("/api/subscription/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    })
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          setStatus("error");
          setMessage(body?.error ?? "تعذّر التحقق من حالة الدفع");
          return;
        }
        if (body.invoiceStatus === "PAID") {
          setStatus("paid");
        } else {
          setStatus("failed");
          setMessage("لم تكتمل عملية الدفع — يمكنك المحاولة مجدداً من صفحة الباقات");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("تعذّر الاتصال بالخادم للتحقق من حالة الدفع");
      });
  }, [invoiceId]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: t.spacing["6"] }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        {status === "checking" && <LoadingState label="جاري التحقق من عملية الدفع..." />}

        {status === "paid" && (
          <>
            <PartyPopper size={44} strokeWidth={1.5} color={t.colors.gold[600]} style={{ margin: `0 auto ${t.spacing["3"]}` }} />
            <h1 style={{ fontSize: t.typography.fontSize.lg, color: t.colors.primary[800], margin: `0 0 ${t.spacing["2"]}` }}>
              تم تفعيل اشتراكك بنجاح
            </h1>
            <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["5"] }}>باقتك الجديدة فعّالة الآن</p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
            >
              الذهاب للوحة التحكم
            </button>
          </>
        )}

        {(status === "failed" || status === "error") && (
          <>
            <AlertTriangle size={44} strokeWidth={1.5} color={t.colors.semantic.danger} style={{ margin: `0 auto ${t.spacing["3"]}` }} />
            <h1 style={{ fontSize: t.typography.fontSize.lg, color: t.colors.semantic.danger, margin: `0 0 ${t.spacing["2"]}` }}>
              لم تكتمل عملية الدفع
            </h1>
            <p style={{ color: t.colors.text.mid, marginBottom: t.spacing["5"] }}>{message}</p>
            <button
              onClick={() => router.push("/pricing")}
              style={{ padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
            >
              العودة للباقات
            </button>
          </>
        )}
      </div>
    </div>
  );
}
