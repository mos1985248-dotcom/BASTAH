// components/store/StoreClosingBanner.tsx
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import type { StoreDetail } from "./types";
import s from "./sections.module.css";

export default function StoreClosingBanner({ store: _store }: { store: StoreDetail }) {
  return (
    <section
      aria-label="رسالة ختامية للمتجر"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth, paddingBottom: 56 }}
    >
      <div className={s.closing}>
        <div>
          <h2 className={s.closingTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
            شكرًا لدعمك للأسر المنتجة السعودية
          </h2>
          <p className={s.closingText}>كل عملية شراء منك تدعم أسرة سعودية وتصنع فرقًا حقيقيًا في حياتهم.</p>
        </div>
        <a href="#products" className={s.closingCta}>
          تصفّح جميع المنتجات
        </a>
      </div>
    </section>
  );
}
