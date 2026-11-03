// components/store/StoreStates.tsx — حالتا التحميل والخطأ لصفحة المتجر
import { AlertTriangle } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import Skeleton from "@/components/ui/Skeleton";
import s from "./sections.module.css";

export function StoreLoading() {
  return (
    <main className={s.section} style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }} aria-busy="true">
      <Skeleton height={36} radius="20px 20px 0 0" />
      <Skeleton height={220} radius="0" />
      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0" }}>
        <Skeleton width={88} height={88} radius="50%" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton width="32%" height={24} />
          <Skeleton width="55%" height={14} />
        </div>
      </div>
      <Skeleton height={280} radius="28px" />
    </main>
  );
}

export function StoreError({ message }: { message: string }) {
  return (
    <main className={s.section} style={{ ...uiVars, maxWidth: 560, minHeight: "55vh", display: "flex", alignItems: "center" }}>
      <div role="alert" style={{ width: "100%", textAlign: "center", padding: 32, borderRadius: 28, border: "1px solid var(--ui-border)", background: "var(--ui-card)" }}>
        <AlertTriangle size={28} strokeWidth={1.8} color="var(--ui-danger)" aria-hidden="true" />
        <h1 style={{ margin: "12px 0 6px", fontSize: 22, color: "var(--ui-ink)" }}>{message ? "تعذّر تحميل المتجر" : "المتجر غير موجود"}</h1>
        <p style={{ margin: 0, color: "var(--ui-ink-muted)", lineHeight: 1.8 }}>
          {message || "قد يكون الرابط غير صحيح أو أن المتجر لم يعد متاحًا."}
        </p>
      </div>
    </main>
  );
}
