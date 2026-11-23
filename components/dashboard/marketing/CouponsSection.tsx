"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api-client";
import s from "./marketing.module.css";

type Coupon = { id: string; code: string; discountType: string; discountValue: number };
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
      });
      form.reset();
      await load();
      setNotice("تم حفظ الكوبون.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذّر الحفظ."); }
    finally { setBusy(false); }
  }

  return <section className={s.sec}>
    <h2 className={s.h2}>كوبونات الخصم</h2>
    <p>يمكن حفظ مسودات الكوبونات. استخدام الرموز عند الدفع قيد الإعداد.</p>
    <form onSubmit={submit}>
      <label>رمز الخصم <input name="code" required minLength={3} maxLength={32} dir="ltr" /></label>
      <label>النوع <select name="type"><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></label>
      <label>القيمة <input name="amount" type="number" min="0.01" step="0.01" required /></label>
      <button disabled={busy}>حفظ الكوبون</button>
    </form>
    {notice && <p role="status">{notice}</p>}
    <ul>{coupons.map(coupon => <li key={coupon.id}><bdi>{coupon.code}</bdi> · {coupon.discountValue} {coupon.discountType === "percentage" ? "%" : "ر.س"}</li>)}</ul>
  </section>;
}
