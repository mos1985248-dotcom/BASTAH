// components/dashboard/store-settings/InfoSections.tsx
// معلومات المتجر (واتساب، مدينة، فيديو) وقصة المتجر (نص وشارات الثقة).
import { BookOpen, Film, MapPin, MessageCircle, Sparkles, Store } from "lucide-react";
import f from "../forms.module.css";
import Panel from "./Panel";
import { Field, IconLabel, TagField } from "./fields";
import s from "./settings.module.css";
import type { StoreSettingsCtx } from "./useStoreSettings";

export function ContactSection({ ctx }: { ctx: StoreSettingsCtx }) {
  const { form, set } = ctx;

  return (
    <Panel
      icon={Store}
      title="معلومات المتجر"
      description="المعلومات الأساسية التي تظهر للزوار والعملاء."
    >
      <div className={s.grid2}>
        <div className={s.full}>
          <Field
            label={<IconLabel icon={Store} text="اسم المتجر" />}
            value={form.nameAr}
            onChange={(value) => set("nameAr", value)}
            dir="rtl"
            placeholder="اسم متجرك كما يظهر للعملاء"
          />
          <span className={s.note}>رابط متجرك لا يتغير عند تعديل الاسم، فتبقى الروابط المشاركة تعمل.</span>
        </div>

        <Field
          label={<IconLabel icon={MessageCircle} text="واتساب المتجر" />}
          value={form.whatsapp}
          onChange={(value) => set("whatsapp", value)}
          dir="rtl"
          placeholder="+9665XXXXXXXX"
        />

        <Field
          label={<IconLabel icon={MapPin} text="المدينة" />}
          value={form.city}
          onChange={(value) => set("city", value)}
          dir="rtl"
          placeholder="بريدة"
        />

        <div className={s.full}>
          <Field
            label={<IconLabel icon={Film} text="فيديو المتجر — رابط" />}
            value={form.videoUrl}
            onChange={(value) => set("videoUrl", value)}
            dir="ltr"
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>
    </Panel>
  );
}

export function StorySection({ ctx }: { ctx: StoreSettingsCtx }) {
  const { form, set, tagInput, setTagInput, addTag, removeTag } = ctx;

  return (
    <Panel
      icon={BookOpen}
      title="قصة المتجر"
      description="عرّف العملاء بقصتك وشغفك والمنتجات التي تقدمها."
    >
      <label className={f.fieldWrap}>
        <span className={s.lblBlock}>
          <IconLabel icon={BookOpen} text="قصة الأسرة" />
        </span>
        <textarea
          value={form.storyAr}
          onChange={(event) => set("storyAr", event.target.value)}
          rows={5}
          placeholder="اكتب قصة متجرك وشغف أسرتك..."
          className={`${f.field} ${f.area}`}
        />
      </label>

      <TagField
        label={<IconLabel icon={Sparkles} text="شارات الثقة" />}
        items={form.storyTags}
        onRemove={removeTag}
        inputValue={tagInput}
        onInputChange={setTagInput}
        onAdd={addTag}
        placeholder="مثال: صناعة يدوية"
      />
    </Panel>
  );
}
