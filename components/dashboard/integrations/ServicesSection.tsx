// components/dashboard/integrations/ServicesSection.tsx — الخدمات الجاهزة فعلاً (قراءة فقط).
// لا تظهر خدمة إلا إن فعّلتها الإدارة ووُجد لها مزوّد مضبوط؛ لا نعلن ما لم يُفعَّل.
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { t } from "@/theme";
import type { ServiceView } from "./types";

export default function ServicesSection({ services }: { services: ServiceView[] }) {
  return (
    <section style={{ marginBottom: t.spacing["6"] }}>
      <h2 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>الخدمات المتاحة</h2>
      {services.length === 0 ? (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, padding: 10, background: t.colors.semantic.warningBg, borderRadius: t.radius.md, fontSize: 12, color: t.colors.semantic.warning }}>
          <AlertTriangle size={13} strokeWidth={1.8} />
          لم تُفعِّل إدارة بسطة أي خدمة تكامل بعد. يمكنك حفظ حساباتك الآن وستعمل الخدمات فور تفعيلها.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {services.map((s) => (
            <div key={s.key} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: "10px 14px" }}>
              <CheckCircle2 size={15} strokeWidth={1.8} color={t.colors.semantic.success} style={{ marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{s.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: t.colors.text.mid }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
