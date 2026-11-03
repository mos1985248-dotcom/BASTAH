// components/dashboard/StoreSettingsQuickEdit.tsx
// إعدادات المتجر السريعة — الغلاف التركيبي فقط.
// المنطق في store-settings/useStoreSettings.ts (منقول حرفياً) والأقسام في store-settings/*.
// الصور تُرفع عبر POST /api/uploads/store، والبيانات تُحفظ عبر PATCH /api/stores/[slug] و.../public-info.
"use client";

import { AlertTriangle, Check, ExternalLink, Save } from "lucide-react";
import f from "./forms.module.css";
import s from "./store-settings/settings.module.css";
import IdentitySection from "./store-settings/IdentitySection";
import { ContactSection, StorySection } from "./store-settings/InfoSections";
import { OperationsSection, PaymentSection } from "./store-settings/OpsSections";
import LocationSection from "./store-settings/LocationSection";
import { useStoreSettings } from "./store-settings/useStoreSettings";
import type { EditableStoreData } from "./store-settings/types";

export type { EditableStoreData };

export default function StoreSettingsQuickEdit({
  store,
  onSaved,
}: {
  store: EditableStoreData;
  onSaved?: (saved: { nameAr: string }) => void;
}) {
  const ctx = useStoreSettings(store, onSaved);
  const { saving, error, savedMsg, handleSave } = ctx;

  return (
    <div className={s.root}>
      <div className={s.intro}>
        <div className={s.introText}>
          <h2 className={s.introTitle}>إعدادات المتجر</h2>
          <p className={s.introSub}>حدّث معلومات متجرك ومظهره وطرق التواصل والشحن والدفع.</p>
        </div>

        <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer" className={s.preview}>
          <ExternalLink size={15} strokeWidth={1.9} aria-hidden="true" />
          معاينة المتجر
        </a>
      </div>

      <div className={s.cols}>
        <div className={s.col}>
          <IdentitySection slug={store.slug} ctx={ctx} />
          <ContactSection ctx={ctx} />
          <StorySection ctx={ctx} />
        </div>

        <div className={s.col}>
          <LocationSection ctx={ctx} />
          <OperationsSection ctx={ctx} />
          <PaymentSection ctx={ctx} />
        </div>
      </div>

      {error && (
        <div role="alert" className={`${s.alert} ${s.alertErr}`}>
          <AlertTriangle size={17} strokeWidth={1.9} />
          <span>{error}</span>
        </div>
      )}

      {savedMsg && (
        <div role="status" className={s.saved}>
          <Check size={17} strokeWidth={2.2} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className={s.saveBar}>
        <p className={s.saveHint}>تُحفظ كل الأقسام معاً وتظهر على صفحة متجرك مباشرة.</p>
        <button type="button" onClick={handleSave} disabled={saving} className={`${f.cta} ${s.save}`}>
          <Save size={16} strokeWidth={1.9} />
          {saving ? "جاري حفظ التغييرات..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
