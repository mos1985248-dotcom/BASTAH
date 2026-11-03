// components/dashboard/store-settings/LocationSection.tsx
// موقع المتجر: تحديد بالخريطة أو بالموقع الحالي أو بالإحداثيات، وتفعيل «الاستلام من موقعي».
import { AlertTriangle, Navigation } from "lucide-react";
import f from "../forms.module.css";
import LocationPicker from "../LocationPicker";
import Panel from "./Panel";
import { CoordinateField } from "./fields";
import s from "./settings.module.css";
import type { StoreSettingsCtx } from "./useStoreSettings";

export default function LocationSection({ ctx }: { ctx: StoreSettingsCtx }) {
  const { form, set, hasCoords, locating, locateError, locateMe } = ctx;

  return (
    <Panel
      icon={Navigation}
      title="موقع المتجر"
      description="حدد موقع متجرك ليسهل على العملاء الوصول إليه."
      tone="sand"
    >
      <button type="button" onClick={locateMe} disabled={locating} className={s.locate}>
        <Navigation size={16} strokeWidth={2} />
        {locating ? "جاري تحديد الموقع..." : "استخدام موقعي الحالي"}
      </button>

      {locateError && (
        <p role="alert" className={s.alert}>
          <AlertTriangle size={15} strokeWidth={1.9} />
          <span>{locateError}</span>
        </p>
      )}

      <LocationPicker
        latitude={form.latitude.trim() !== "" ? Number(form.latitude) : null}
        longitude={form.longitude.trim() !== "" ? Number(form.longitude) : null}
        onChange={(latitude, longitude) => {
          set("latitude", String(latitude));
          set("longitude", String(longitude));
        }}
      />

      <div className={s.coords}>
        <CoordinateField
          label="خط العرض (Latitude)"
          value={form.latitude}
          placeholder="26.3260"
          onChange={(value) => set("latitude", value)}
        />

        <CoordinateField
          label="خط الطول (Longitude)"
          value={form.longitude}
          placeholder="43.9750"
          onChange={(value) => set("longitude", value)}
        />
      </div>

      <label className={`${s.pickup} ${hasCoords ? "" : s.pickupOff}`}>
        <input
          type="checkbox"
          checked={form.pickupEnabled}
          disabled={!hasCoords}
          onChange={(event) => set("pickupEnabled", event.target.checked)}
        />
        <span>تفعيل «الاستلام من موقعي» — يظهر للمشتري عند اختيار التحويل البنكي.</span>
      </label>

      {!hasCoords && <p className={f.help}>حدّد موقع المتجر أولًا لتفعيل هذا الخيار.</p>}
    </Panel>
  );
}
