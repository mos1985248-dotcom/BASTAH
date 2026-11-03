// components/dashboard/store-settings/OpsSections.tsx
// التشغيل والخدمات (ساعات العمل، الترخيص، شركة الشحن) والدفع والإرجاع.
import { Clock, CreditCard, FileBadge, RotateCcw, Truck } from "lucide-react";
import f from "../forms.module.css";
import Panel from "./Panel";
import { Field, IconLabel, TagField } from "./fields";
import s from "./settings.module.css";
import type { StoreSettingsCtx } from "./useStoreSettings";

export function OperationsSection({ ctx }: { ctx: StoreSettingsCtx }) {
  const { form, set } = ctx;

  return (
    <Panel
      icon={Truck}
      title="التشغيل والخدمات"
      description="معلومات تساعد العملاء على معرفة أوقات العمل والشحن."
    >
      <div className={s.grid}>
        <Field
          label={<IconLabel icon={Clock} text="ساعات العمل" />}
          value={form.workingHours}
          onChange={(value) => set("workingHours", value)}
          dir="rtl"
          placeholder="السبت-الخميس 9ص-9م"
        />

        <Field
          label={<IconLabel icon={FileBadge} text="رقم الترخيص" />}
          value={form.licenseNumber}
          onChange={(value) => set("licenseNumber", value)}
          dir="rtl"
          placeholder="12456789"
        />

        <Field
          label={<IconLabel icon={Truck} text="شركة الشحن" />}
          value={form.deliveryPartner}
          onChange={(value) => set("deliveryPartner", value)}
          dir="rtl"
          placeholder="أرامكس، سمسا..."
        />
      </div>
    </Panel>
  );
}

export function PaymentSection({ ctx }: { ctx: StoreSettingsCtx }) {
  const { form, set, paymentInput, setPaymentInput, addPayment, removePayment } = ctx;

  return (
    <Panel
      icon={CreditCard}
      title="الدفع والإرجاع"
      description="حدد طرق الدفع التي تقبلها وسياسة الإرجاع."
    >
      <div className={s.pay}>
        <TagField
          label={<IconLabel icon={CreditCard} text="طرق الدفع المتاحة" />}
          items={form.paymentMethods}
          onRemove={removePayment}
          inputValue={paymentInput}
          onInputChange={setPaymentInput}
          onAdd={addPayment}
          placeholder="مثال: مدى"
        />

        <label className={f.fieldWrap}>
          <span className={s.lblBlock}>
            <IconLabel icon={RotateCcw} text="سياسة الإرجاع" />
          </span>
          <input
            type="number"
            min={0}
            max={90}
            value={form.returnPolicyDays}
            onChange={(event) => set("returnPolicyDays", event.target.value)}
            placeholder="مثال: 7"
            className={f.field}
          />
          <span className={s.note}>عدد أيام الإرجاع المسموحة.</span>
        </label>
      </div>
    </Panel>
  );
}
