"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import s from "./marketing.module.css";

type Coupon = { id: string; code: string; discountType: string; discountValue: number; isActive: boolean; usedCount: number; maxUses: number | null; minOrderAmt: number | null; expiresAt: string | null };
export default function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const result = await api.get<{ coupons: Coupon[] }>("/api/marketing/coupons");
    setCoupons(result.coupons);
  }
  useEffect(() => { void load().catch(() => setNotice("تعذّر تحميل القسائم.")); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    try {
      await api.post("/api/marketing/coupons", {
        code: fields.get("code"),
        discountType: fields.get("type"),
        discountValue: Number(fields.get("amount")),
        minOrderAmt: fields.get("minimum") ? Number(fields.get("minimum")) : undefined,
        maxUses: fields.get("uses") ? Number(fields.get("uses")) : undefined,
        expiryDate: fields.get("expiry") || undefined,
      });
      form.reset();
      await load();
      setNotice("تم حفظ المسودة. فعّلي الكوبون ليصبح متاحًا للعملاء.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذّر الحفظ."); }
    finally { setBusy(false); }
  }

  async function toggle(coupon: Coupon) {
    setBusy(true);
    try {
      await api.patch("/api/marketing/coupons", { id: coupon.id, isActive: !coupon.isActive });
      await load();
      setNotice(coupon.isActive ? "تم إيقاف الكوبون." : "تم تفعيل الكوبون.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذّر تحديث الكوبون."); }
    finally { setBusy(false); }
  }

  return <section className={s.sec}>
    <h2 className={s.h2}>كوبونات الخصم</h2>
    <form onSubmit={submit}>
      <label>رمز الخصم <input name="code" required minLength={3} maxLength={32} dir="ltr" /></label>
      <label>النوع <select name="type"><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></label>
      <label>القيمة <input name="amount" type="number" min="0.01" step="0.01" required /></label>
      <label>الحد الأدنى للطلب (ر.س) <input name="minimum" type="number" min="0" step="0.01" /></label>
      <label>الحد الأقصى للاستخدام <input name="uses" type="number" min="1" step="1" /></label>
      <label>آخر يوم للاستخدام (بتوقيت الرياض) <input name="expiry" type="date" /></label>
      <button disabled={busy}>حفظ المسودة</button>
    </form>
    {notice && <p role="status">{notice}</p>}
    <ul>{coupons.map(coupon => (
      <li key={coupon.id}>
        <bdi>{coupon.code}</bdi> · {coupon.discountValue} {coupon.discountType === "percentage" ? "%" : "ر.س"}
        {" · "}{coupon.isActive ? "مفعّل" : "غير مفعّل"} · الاستخدام {coupon.usedCount}{coupon.maxUses !== null ? ` من ${coupon.maxUses}` : ""}
        {coupon.minOrderAmt !== null && ` · الحد الأدنى ${coupon.minOrderAmt} ر.س`}
        {coupon.expiresAt && ` · آخر يوم ${new Date(new Date(coupon.expiresAt).getTime() - 1).toLocaleDateString("ar-SA-u-ca-gregory", { timeZone: "Asia/Riyadh" })}`}
        {" "}<button type="button" disabled={busy} onClick={() => toggle(coupon)}>{coupon.isActive ? "إيقاف" : "تفعيل"}</button>
      </li>
    ))}</ul>
  </section>;
}
