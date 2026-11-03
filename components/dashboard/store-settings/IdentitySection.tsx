// components/dashboard/store-settings/IdentitySection.tsx
// هوية المتجر: الغلاف والشعار (الرفع المباشر عبر StoreImageUpload دون تغيير).
import { Image as ImageIcon, Tag } from "lucide-react";
import StoreImageUpload from "../StoreImageUpload";
import Panel from "./Panel";
import { IconLabel } from "./fields";
import s from "./settings.module.css";
import type { StoreSettingsCtx } from "./useStoreSettings";

export default function IdentitySection({ slug, ctx }: { slug: string; ctx: StoreSettingsCtx }) {
  const { form, set } = ctx;

  return (
    <Panel
      icon={ImageIcon}
      title="هوية المتجر"
      description="ارفع الشعار والغلاف ليظهر متجرك بشكل احترافي."
    >
      <div className={s.grid2}>
        <StoreImageUpload
          slug={slug}
          field="cover"
          label={<IconLabel icon={ImageIcon} text="صورة الغلاف" />}
          currentUrl={form.coverImage}
          recommendedSize="1600×600 بكسل"
          aspectRatio="8 / 3"
          onUploaded={(url) => set("coverImage", url)}
        />

        <StoreImageUpload
          slug={slug}
          field="logo"
          label={<IconLabel icon={Tag} text="شعار المتجر" />}
          currentUrl={form.logo}
          recommendedSize="500×500 بكسل"
          aspectRatio="1 / 1"
          onUploaded={(url) => set("logo", url)}
        />
      </div>
    </Panel>
  );
}
