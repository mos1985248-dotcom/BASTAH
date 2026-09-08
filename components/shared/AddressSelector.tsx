// components/shared/AddressSelector.tsx
import { MapPin } from "lucide-react";
import { t } from "@/theme";
import { Address } from "./address-types";

interface AddrForm {
  name: string;
  phone: string;
  city: string;
  region: string;
  address: string;
}

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
  const FIELDS: { key: keyof AddrForm; label: string }[] = [
    { key: "name", label: "الاسم" },
    { key: "phone", label: "الجوال (+9665XXXXXXXX)" },
    { key: "city", label: "المدينة" },
    { key: "region", label: "المنطقة" },
    { key: "address", label: "العنوان التفصيلي" },
  ];

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["5"], marginTop: t.spacing["4"] }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 6, margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, color: t.colors.primary[800] }}>
        <MapPin size={16} strokeWidth={1.8} />
        عنوان الشحن
      </h3>

      {!hasUser && !userLoading && (
        <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>سجّلي دخولك لإضافة عنوان والشراء</p>
      )}

      {hasUser && addresses.length > 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {addresses.map((a) => (
            <label
              key={a.id}
              style={{
                display: "flex",
                gap: t.spacing["2"],
                padding: "10px 12px",
                borderRadius: t.radius.md,
                border: `1.5px solid ${selectedAddressId === a.id ? t.colors.primary[800] : t.colors.cream.border}`,
                cursor: "pointer",
              }}
            >
              <input type="radio" checked={selectedAddressId === a.id} onChange={() => onSelect(a.id)} />
              <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.body }}>
                {a.label} — {a.name} — {a.city}، {a.address}
              </span>
            </label>
          ))}
          <button
            onClick={onShowForm}
            style={{ background: "none", border: "none", color: t.colors.gold[600], fontWeight: t.typography.fontWeight.bold, fontSize: t.typography.fontSize.sm, cursor: "pointer", textAlign: "start" }}
          >
            + إضافة عنوان آخر
          </button>
        </div>
      )}

      {hasUser && (addresses.length === 0 || showForm) && (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {FIELDS.map((f) => (
            <input
              key={f.key}
              placeholder={f.label}
              value={form[f.key]}
              onChange={(e) => onFormChange(f.key, e.target.value)}
              style={{ padding: "10px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl" }}
            />
          ))}
          <button
            onClick={onSave}
            style={{ padding: "10px", background: t.colors.primary[800], color: t.colors.text.onDark, border: "none", borderRadius: t.radius.md, cursor: "pointer", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
          >
            حفظ العنوان
          </button>
        </div>
      )}
    </div>
  );
}
