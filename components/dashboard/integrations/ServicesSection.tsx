// components/dashboard/integrations/ServicesSection.tsx — الخدمات الجاهزة فعلاً (قراءة فقط).
// لا تظهر خدمة إلا إن فعّلتها الإدارة ووُجد لها مزوّد مضبوط؛ لا نعلن ما لم يُفعَّل.
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import f from "../forms.module.css";
import s from "./integrations.module.css";
import type { ServiceView } from "./types";

export default function ServicesSection({ services }: { services: ServiceView[] }) {
  return (
    <section className={s.section}>
      <h2 className={s.h2}>الخدمات المتاحة</h2>
      {services.length === 0 ? (
        <p className={s.notice}>
          <AlertTriangle size={14} strokeWidth={1.8} />
          لم تُفعِّل إدارة بسطة أي خدمة تكامل بعد. يمكنك حفظ حساباتك الآن وستعمل الخدمات فور تفعيلها.
        </p>
      ) : (
        <div className={f.stackCol}>
          {services.map((sv) => (
            <div key={sv.key} className={s.service}>
              <CheckCircle2 size={16} strokeWidth={1.8} />
              <div>
                <p className={s.sName}>{sv.label}</p>
                <p className={s.sDesc}>{sv.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
