// app/dashboard/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, AlertTriangle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import { DashboardField, DashboardTextarea } from "@/components/dashboard/DashboardField";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nameAr: "", price: "", quantity: "", shortDescAr: "" });
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (publish: boolean) => {
    if (!form.nameAr || !form.price) {
      setError("اسم المنتج والسعر مطلوبان");
      return;
    }
    setLoading(true);
    setError("");
    setUpgradeRequired(false);
    try {
      const { product } = await api.post<{ product: { id: string } }>("/api/products", {
        nameAr: form.nameAr,
        price: Number(form.price),
        quantity: Number(form.quantity || 0),
        shortDescAr: form.shortDescAr || undefined,
        status: publish ? "ACTIVE" : "DRAFT",
      });
      // التوجيه لصفحة التعديل مباشرة — هناك يضيف التاجر الصور (productId لازم يكون موجوداً أولاً)
      router.push(`/dashboard/products/${product.id}/edit`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if ((err.details as any)?.upgradeRequired) setUpgradeRequired(true);
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: t.spacing["5"] }}>
      <div style={{ maxWidth: 460, margin: "0 auto", background: t.colors.white, borderRadius: t.radius.xl, padding: t.spacing["6"] }}>
        <h1 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>إضافة منتج جديد</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <DashboardField label="اسم المنتج" value={form.nameAr} onChange={(v) => set("nameAr", v)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: t.spacing["2"] }}>
            <DashboardField label="السعر (ر.س)" type="number" value={form.price} onChange={(v) => set("price", v)} />
            <DashboardField label="الكمية" type="number" value={form.quantity} onChange={(v) => set("quantity", v)} />
          </div>

          <DashboardTextarea label="وصف مختصر" value={form.shortDescAr} onChange={(v) => set("shortDescAr", v)} />

          <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, background: t.colors.semantic.warningBg, padding: "8px 10px", borderRadius: t.radius.md, margin: 0 }}>
            <Info size={13} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            احفظي المنتج أولاً، بعدها تنتقلين لصفحة إضافة الصور تلقائياً.
          </p>

          {error && (
            <div>
              <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
                <AlertTriangle size={13} strokeWidth={1.8} />
                {error}
              </p>
              {upgradeRequired && (
                <a href="/pricing" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: t.typography.fontSize.xs, color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold }}>
                  ترقية الباقة
                  <ArrowLeft size={12} strokeWidth={2} />
                </a>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: t.spacing["2"] }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              style={{ flex: 1, padding: 12, background: t.colors.white, border: `1.5px solid ${t.colors.cream.border}`, borderRadius: t.radius.lg, cursor: "pointer", fontWeight: t.typography.fontWeight.semibold }}
            >
              حفظ كمسودة
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              style={{
                flex: 2,
                padding: 12,
                background: loading ? t.colors.primary[600] : t.colors.primary[800],
                color: t.colors.text.onDark,
                border: "none",
                borderRadius: t.radius.lg,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              {loading ? "جاري النشر..." : "حفظ ونشر المنتج"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
