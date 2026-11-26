"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import s from "./forms.module.css";

export default function StoreSectionSelect({
  value, onChange, disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [sections, setSections] = useState<{ id: string; name: string }[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let latest = 0;
    function load() {
      const request = ++latest;
      api.get<{ sections: { id: string; name: string }[] }>("/api/store-sections")
        .then((result) => {
          if (active && request === latest) {
            setSections(result.sections);
            setFailed(false);
          }
        })
        .catch(() => { if (active && request === latest) setFailed(true); });
    }
    load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);

  return (
    <div>
      <label className={s.fieldWrap}>
        <span className={s.fieldLabel}>قسم المنتج (اختياري)</span>
        <select className={s.field} value={value} disabled={disabled || !sections} onChange={(event) => onChange(event.target.value)}>
          <option value="">{!sections && !failed ? "جاري تحميل الأقسام…" : "بدون قسم"}</option>
          {value && !sections?.some((section) => section.id === value) &&
            <option value={value}>{sections ? "القسم غير متاح" : "القسم الحالي"}</option>}
          {sections?.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
        </select>
      </label>
      {failed && <p className={s.help} role="status">تعذّر تحميل الأقسام. يمكنك إكمال بيانات المنتج.</p>}
      <Link className={s.link} href="/dashboard/products/sections" target="_blank" rel="noopener">
        إدارة الأقسام (تفتح في تبويب جديد)
      </Link>
    </div>
  );
}
