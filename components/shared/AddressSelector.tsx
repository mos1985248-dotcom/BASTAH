// components/shared/AddressSelector.tsx
// مشترك بين صفحة المنتج والدفع. عرض فقط؛ المنطق (useAddressBook) من الصفحات كما هو.
import { MapPin } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "@/components/checkout/checkout.module.css";
import { Address } from "./address-types";

interface AddrForm {
  name: string;
  phone: string;
  city: string;
  region: string;
  address: string;
}

const FIELDS: { key: keyof AddrForm; label: string; full?: boolean }[] = [
  { key: "name", label: "الاسم" },
  { key: "phone", label: "الجوال (+9665XXXXXXXX)" },
  { key: "city", label: "المدينة" },
  { key: "region", label: "المنطقة" },
  { key: "address", label: "العنوان التفصيلي", full: true },
];

export default function AddressSelector({
  hasUser,
  userLoading,
  addresses,
  selectedAddressId,
  onSelect,
  showForm,
  onShowForm,
  form,
  onFormChange,
  onSave,
}: {
  hasUser: boolean;
  userLoading: boolean;
  addresses: Address[];
  selectedAddressId: string;
  onSelect: (id: string) => void;
  showForm: boolean;
  onShowForm: () => void;
  form: AddrForm;
  onFormChange: (k: keyof AddrForm, v: string) => void;
  onSave: () => void;
}) {
  return (
    <section className={c.card} style={uiVars} aria-labelledby="address-title">
      <div className={c.cardHead}>
        <span className={c.cardIcon}><MapPin size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <h2 id="address-title" className={c.cardTitle}>عنوان الشحن</h2>
      </div>

      <div className={c.cardBody}>
        {!hasUser && !userLoading && <p className={c.hint}>سجّل دخولك لإضافة عنوان والشراء</p>}

        {hasUser && addresses.length > 0 && !showForm && (
          <div className={c.addrList} role="radiogroup" aria-labelledby="address-title">
            {addresses.map((a) => (
              <label key={a.id} className={`${c.addr} ${selectedAddressId === a.id ? c.addrOn : ""}`}>
                <input type="radio" name="addressId" checked={selectedAddressId === a.id} onChange={() => onSelect(a.id)} />
                <span className={c.addrText}>
                  <span className={c.addrLabel}>{a.label}</span> — {a.name} — {a.city}، {a.address}
                </span>
              </label>
            ))}
            <button type="button" onClick={onShowForm} className={c.linkBtn}>+ إضافة عنوان آخر</button>
          </div>
        )}

        {hasUser && (addresses.length === 0 || showForm) && (
          <div className={c.form}>
            {FIELDS.map((f) => (
              <div key={f.key} className={`${c.fieldWrap} ${f.full ? c.fieldFull : ""}`}>
                <label htmlFor={`addr-${f.key}`} className={c.fieldLabel}>{f.label}</label>
                <input
                  id={`addr-${f.key}`}
                  className={c.field}
                  value={form[f.key]}
                  onChange={(e) => onFormChange(f.key, e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={onSave} className={c.save}>حفظ العنوان</button>
          </div>
        )}
      </div>
    </section>
  );
}
