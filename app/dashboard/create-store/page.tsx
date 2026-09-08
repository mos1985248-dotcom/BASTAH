// app/dashboard/create-store/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser } from "../../providers";
import { t } from "@/theme";
import { DashboardField } from "@/components/dashboard/DashboardField";

const FIELDS: { key: "nameAr" | "city" | "whatsapp" | "shortDesc"; label: string }[] = [
  { key: "nameAr", label: "اسم المتجر" },
  { key: "city", label: "المدينة" },
  { key: "whatsapp", label: "واتساب (+9665XXXXXXXX)" },
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
    <div style={{ minHeight: "100vh", background: t.colors.cream.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: t.spacing["5"] }}>
      <div style={{ width: "100%", maxWidth: 420, background: t.colors.white, borderRadius: t.radius.xl, padding: `${t.spacing["8"]} ${t.spacing["6"]}` }}>
        <h1 style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], textAlign: "center" }}>إنشاء متجرك</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          {FIELDS.map((f) => (
            <DashboardField key={f.key} label={f.label} value={form[f.key]} onChange={(v) => set(f.key, v)} />
          ))}
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger }}>
              <AlertTriangle size={13} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: 13, background: loading ? t.colors.primary[600] : t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.lg, fontWeight: t.typography.fontWeight.bold, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "جاري الإنشاء..." : "إنشاء المتجر"}
          </button>
        </div>
      </div>
    </div>
  );
}
