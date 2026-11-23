// components/admin/finance/SourcesTable.tsx — مصادر الإيراد: المستحق مقابل المحصَّل مقابل المتبقي، مع مصدر كل رقم وجودته.
import type { SummaryResponse } from "./api-types";
import { sar } from "./format";
import Quality, { type Q } from "./Quality";
import s from "./finance.module.css";

export default function SourcesTable({ data }: { data: SummaryResponse }) {
  const m = data.summary;
  const rows: { name: string; due: string; got: string; left: string; source: string; q: Q; note?: string }[] = [
    { name: "اشتراكات التجار", due: "—", got: sar(m.subscriptions.netCollectedMinor), left: "—", source: "فواتير PAID بتاريخ الدفع، بعد الاستردادات الموثقة", q: m.subscriptions.preVatMinor === null ? "EST" : "OK", note: m.subscriptions.preVatMinor === null ? "إعداد الضريبة غير محدد" : undefined },
    { name: "عمولة الشحن الخارجي (basitaFee)", due: sar(m.external.accruedMinor), got: sar(m.external.receivedMinor), left: sar(m.external.outstandingMinor), source: "ShippingRate المحفوظة وقت الطلب + تسويات التحصيل", q: m.external.undocumentedCount ? "BAD" : "OK", note: m.external.undocumentedCount ? `${m.external.undocumentedCount} بلا قيمة محفوظة` : undefined },
    { name: "بسطة للشحن — قيمة التوصيل", due: sar(m.local.deliveryFeeMinor), got: sar(m.local.receivedMinor), left: sar(m.local.outstandingMinor), source: "لقطة الإسناد + تسويات التحصيل", q: m.local.undocumentedCount ? "BAD" : "OK", note: m.local.undocumentedCount ? `${m.local.undocumentedCount} شحنة غير موثقة` : undefined },
    { name: "COD — صافي حصة بسطة", due: sar(m.cod.netShareMinor), got: sar(m.cod.receivedMinor), left: sar(m.cod.outstandingMinor), source: "رسم الطلب − حصة الناقل المحفوظة", q: m.cod.incompleteCount ? "BAD" : "OK", note: m.cod.incompleteCount ? `${m.cod.incompleteCount} طلب بإعداد تكلفة ناقص` : undefined },
  ];
  return (
    <div className={s.scroll}>
      <table className={s.table}>
        <thead><tr><th>المصدر</th><th>مستحق (الشهر)</th><th>محصَّل (الشهر)</th><th>متبقٍ (تراكمي)</th><th>مصدر الرقم</th><th>الجودة</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td><td className={s.num}>{r.due}</td><td className={s.num}>{r.got}</td><td className={s.num}>{r.left}</td>
              <td className={s.muted}>{r.source}</td><td><Quality q={r.q} title={r.note} />{r.note && <div className={s.muted}>{r.note}</div>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
