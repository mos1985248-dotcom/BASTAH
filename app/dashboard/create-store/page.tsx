// app/dashboard/create-store/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Store } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../../providers";
import { DashboardField } from "@/components/dashboard/DashboardField";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/dashboard/create-store.module.css";

const FIELDS: { key: "nameAr" | "city" | "whatsapp" | "shortDesc"; label: string; placeholder?: string }[] = [
  { key: "nameAr", label: "اسم المتجر" },
  { key: "city", label: "المدينة" },
  { key: "whatsapp", label: "واتساب المتجر", placeholder: "+966512345678" },
  { key: "shortDesc", label: "وصف مختصر" },
];

export default function CreateStorePage() {
  const router = useRouter();
  const { refresh } = useCurrentUser();
  const [form, setForm] = useState({ nameAr: "", city: "", whatsapp: "", shortDesc: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nameAr || !form.city) {
      setError("اسم المتجر والمدينة مطلوبان");
      return;
    }
    // تغيير سلوكي: واتساب المتجر إلزامي (عليه يتواصل العملاء وتُرسل طلبات المناديب)
    if (!form.whatsapp.trim()) {
      setError("رقم واتساب المتجر مطلوب");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/stores", form);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إنشاء المتجر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.wrap}>
      <section className={`${f.panel} ${s.card}`}>
        <header className={s.head}>
          <span className={s.icon}>
            <Store size={24} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <h1 className={s.title}>إنشاء متجرك</h1>
          <p className={s.sub}>أدخل بيانات متجرك الأساسية، ويمكنك تعديل الاسم وبقية المعلومات لاحقًا من إعدادات المتجر.</p>
        </header>

        <div className={s.body}>
          {FIELDS.map((field) => (
            <DashboardField key={field.key} label={field.label} value={form[field.key]} onChange={(v) => set(field.key, v)} placeholder={field.placeholder} />
          ))}
          <p className={f.help}>رقم واتساب المتجر يستقبل عليه العملاء طلباتهم، وتُرسل إليه تفاصيل الشحن، فاكتبه بالصيغة الدولية.</p>

          {error && (
            <p className={f.err} role="alert">
              <AlertTriangle size={15} strokeWidth={1.8} />
              {error}
            </p>
          )}

          <button type="button" onClick={handleSubmit} disabled={loading} className={`${f.cta} ${s.submit}`}>
            {loading ? "جاري الإنشاء..." : "إنشاء المتجر"}
          </button>
        </div>
      </section>
    </div>
  );
}
