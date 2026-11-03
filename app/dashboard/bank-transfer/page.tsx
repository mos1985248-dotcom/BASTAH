// app/dashboard/bank-transfer/page.tsx
// يستخدم GET/POST/DELETE /api/stores/bank-transfer الجاهزين فعلياً بلا
// أي تعديل عليهما أو على السكيما أو الـcheckout.
// المنطق كما كان حرفياً؛ التغيير في التخطيط والعرض فقط.
"use client";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import BankTransferForm from "@/components/dashboard/bank-transfer/BankTransferForm";
import BankTransferStatus from "@/components/dashboard/bank-transfer/BankTransferStatus";
import s from "@/components/dashboard/forms.module.css";

interface BankTransferStatusResponse {
  enabled: boolean;
  accountHolder: string | null;
  bankName: string | null;
  ibanPreview: string | null;
}

export default function BankTransferPage() {
  const [status, setStatus] = useState<BankTransferStatusResponse | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<BankTransferStatusResponse>("/api/stores/bank-transfer")
      .then(setStatus)
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل حالة التحويل البنكي"));
  };

  useEffect(load, []);

  const wrap = (children: React.ReactNode) => <div className={s.page} style={uiVars}>{children}</div>;

  if (error) return wrap(<ErrorState message={error} onRetry={load} />);
  if (!status) return wrap(<LoadingState label="جاري تحميل التحويل البنكي..." />);

  return wrap(
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>التحويل البنكي</h1>
          <p className={s.sub}>استقبل دفعات المشترين مباشرة في حسابك البنكي دون ربط بوابة دفع إلكترونية</p>
        </div>
      </div>
      <div className={s.layoutEq}>
        {status.enabled ? (
          <BankTransferStatus accountHolder={status.accountHolder} bankName={status.bankName} ibanPreview={status.ibanPreview} onDisabled={load} />
        ) : (
          <BankTransferForm onConnected={load} />
        )}
        <section className={s.panel} aria-labelledby="bt-info">
          <div className={s.panelHead}><h2 id="bt-info" className={s.panelTitle}>كيف يعمل؟</h2></div>
          <div className={s.panelBody}>
            <p className={s.note}>
              <Info size={15} strokeWidth={1.8} aria-hidden="true" />
              التحويل البنكي متاح أيضًا على الباقة المجانية.
            </p>
            <ol className={s.help} style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2.2 }}>
              <li>يحوّل المشتري المبلغ إلى حسابك ثم يرفع إثبات التحويل.</li>
              <li>تراجع الإثبات من صفحة الطلب قبل التجهيز.</li>
              <li>تؤكد استلام التحويل فيبدأ تجهيز الطلب.</li>
            </ol>
          </div>
        </section>
      </div>
    </>,
  );
}
