// components/admin/finance/SettingsTab.tsx — إعدادات المركز المالي + شروط حصة الناقل من رسم COD (بنسخ زمنية لا تمسّ القديم).
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import f from "@/components/dashboard/forms.module.css";
import type { SummaryResponse } from "./api-types";
import { dateOnly } from "./format";
import { F, inputClass, ltrClass, useSubmit } from "./forms";
import s from "./finance.module.css";

interface Terms { id: string; carrierKey: string; fixedShare: string | null; percentShare: string | null; percentBasis: string | null; effectiveFrom: string }
const BASIS: Record<string, string> = { ORDER_TOTAL: "من إجمالي الطلب", COD_FEE: "من رسم COD" };

export default function SettingsTab({ data, onChanged }: { data: SummaryResponse; onChanged: () => void }) {
  const [vat, setVat] = useState(data.settings.vatMode);
  const [direct, setDirect] = useState(String(data.settings.localDirectCostSar));
  const [gap, setGap] = useState(String(data.settings.shipmentGapSharePct));
  const set1 = useSubmit();
  const [terms, setTerms] = useState<Terms[]>([]);
  const [t, setT] = useState({ carrierKey: "ARAMEX", fixedShare: "", percentShare: "", percentBasis: "COD_FEE" });
  const set2 = useSubmit();
  const load = useCallback(() => { api.get<{ terms: Terms[] }>("/api/admin/finance/cod-terms").then((r) => setTerms(r.terms)).catch(() => undefined); }, []);
  useEffect(load, [load]);

  return (
    <div className={s.root}>
      <div className={`${f.formBox}`}>
        <h2 className={s.h2}>إعدادات الحساب</h2>
        <div className={s.formGrid}>
          <F label="الضريبة في فواتير الاشتراكات" hint="المبلغ المخصوم من البطاقة = قيمة الفاتورة. هذا الإعداد يحدد كيف تُفصل الضريبة المسجّلة. ما دام غير محدد لا يُحسب الإيراد قبل الضريبة.">
            <select className={inputClass} value={vat} onChange={(e) => setVat(e.target.value as typeof vat)}>
              <option value="UNSET">غير محدد</option><option value="INCLUSIVE">المبلغ شامل الضريبة</option><option value="EXCLUDED_FROM_CHARGE">الضريبة غير محصّلة ضمن المبلغ</option>
            </select></F>
          <F label="تكلفة مباشرة لكل شحنة بسطة (ر.س)" hint="تُثبَّت على الشحنة وقت الإسناد (صفر = لا تكلفة مباشرة)"><input className={ltrClass} type="number" min={0} step="0.01" value={direct} onChange={(e) => setDirect(e.target.value)} dir="ltr" /></F>
          <F label="افتراض التعادل: نسبة الفجوة بالشحنات %" hint="للسيناريو المختلط فقط (قابل للتعديل)"><input className={ltrClass} type="number" min={0} max={100} value={gap} onChange={(e) => setGap(e.target.value)} dir="ltr" /></F>
        </div>
        {set1.error && <p className={f.err} role="alert">{set1.error}</p>}{set1.ok && <p className={s.ok}>{set1.ok}</p>}
        <button type="button" className={f.cta} disabled={set1.busy} onClick={async () => { if (await set1.run(() => api.patch("/api/admin/finance/settings", { vatMode: vat, localDirectCostSar: direct, shipmentGapSharePct: gap }), "تم حفظ الإعدادات")) onChanged(); }}>{set1.busy ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
      </div>

      <div className={f.formBox}>
        <h2 className={s.h2}>حصة شركة الشحن من رسم COD</h2>
        <p className={s.sub}>تُحدَّد لكل ناقل (مبلغ ثابت أو نسبة أو الاثنان) بنسخة سارية من تاريخها، وتُحفظ على الطلب وقت إنشائه فلا يتأثر القديم. بلا شروط يبقى الطلب «إعداد تكلفة ناقص». الناقل الخارجي برمزه (مثل ARAMEX أو SPL أو CUSTOM)، ومناديب بسطة بالرمز LOCAL.</p>
        <div className={s.formGrid}>
          <F label="رمز الناقل"><input className={ltrClass} value={t.carrierKey} onChange={(e) => setT((p) => ({ ...p, carrierKey: e.target.value }))} dir="ltr" /></F>
          <F label="مبلغ ثابت (ر.س)"><input className={ltrClass} type="number" min={0} step="0.01" value={t.fixedShare} onChange={(e) => setT((p) => ({ ...p, fixedShare: e.target.value }))} dir="ltr" /></F>
          <F label="نسبة %"><input className={ltrClass} type="number" min={0} max={100} step="0.01" value={t.percentShare} onChange={(e) => setT((p) => ({ ...p, percentShare: e.target.value }))} dir="ltr" /></F>
          {t.percentShare && <F label="أساس النسبة (إلزامي)"><select className={inputClass} value={t.percentBasis} onChange={(e) => setT((p) => ({ ...p, percentBasis: e.target.value }))}><option value="COD_FEE">من رسم COD</option><option value="ORDER_TOTAL">من إجمالي الطلب</option></select></F>}
        </div>
        {set2.error && <p className={f.err} role="alert">{set2.error}</p>}{set2.ok && <p className={s.ok}>{set2.ok}</p>}
        <button type="button" className={f.cta} disabled={set2.busy || (!t.fixedShare && !t.percentShare)} onClick={async () => { if (await set2.run(() => api.post("/api/admin/finance/cod-terms", { carrierKey: t.carrierKey, fixedShare: t.fixedShare || null, percentShare: t.percentShare || null, percentBasis: t.percentShare ? t.percentBasis : null }), "تمت إضافة الشروط")) { setT((p) => ({ ...p, fixedShare: "", percentShare: "" })); load(); } }}>{set2.busy ? "جاري الحفظ..." : "إضافة شروط جديدة"}</button>
        <div className={s.scroll}><table className={s.table}><thead><tr><th>الناقل</th><th>ثابت</th><th>نسبة</th><th>سارية من</th></tr></thead><tbody>
          {terms.length === 0 ? <tr><td colSpan={4} className={s.muted}>لا شروط — طلبات COD ستظهر «إعداد التكلفة ناقص»</td></tr> : terms.map((x) => <tr key={x.id}><td>{x.carrierKey}</td><td className={s.num}>{x.fixedShare ? Number(x.fixedShare).toFixed(2) : "—"}</td><td>{x.percentShare ? `${Number(x.percentShare)}% ${BASIS[x.percentBasis ?? ""] ?? ""}` : "—"}</td><td className={s.num}>{dateOnly(x.effectiveFrom)}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
