// components/dashboard/store-settings/fields.tsx
// حقول إعدادات المتجر المشتركة (نفس الأنماط والسلوك، بتنسيق الهوية عبر CSS Modules).
import type { ReactNode } from "react";
import { X } from "lucide-react";
import f from "../forms.module.css";
import s from "./settings.module.css";

type IconType = typeof X;

export function IconLabel({ icon: Icon, text }: { icon: IconType; text: string }) {
  return (
    <span className={s.lbl}>
      <Icon size={16} strokeWidth={1.8} />
      {text}
    </span>
  );
}

export function Field({
  label, value, onChange, dir = "ltr", placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  dir?: string;
  placeholder?: string;
}) {
  return (
    <label className={f.fieldWrap}>
      <span className={s.lblBlock}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={`${f.field} ${dir === "ltr" ? f.ltr : ""}`}
      />
    </label>
  );
}

export function CoordinateField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className={f.fieldWrap}>
      <span className={s.coordLbl}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir="ltr"
        inputMode="decimal"
        className={`${f.field} ${f.ltr} ${s.coordField}`}
      />
    </label>
  );
}

export function TagField({
  label, items, onRemove, inputValue, onInputChange, onAdd, placeholder,
}: {
  label: ReactNode;
  items: string[];
  onRemove: (value: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
}) {
  return (
    <div className={s.tagsBox}>
      <span className={s.lblBlock}>{label}</span>

      {items.length > 0 && (
        <div className={f.tagList}>
          {items.map((item) => (
            <span key={item} className={f.tag}>
              {item}
              <button type="button" onClick={() => onRemove(item)} aria-label={`حذف ${item}`}>
                <X size={13} strokeWidth={2.2} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={f.inline}>
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className={f.field}
        />
        <button type="button" onClick={onAdd} className={s.addBtn}>
          إضافة
        </button>
      </div>
    </div>
  );
}
