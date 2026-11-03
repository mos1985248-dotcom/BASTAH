// components/layout/SearchBar.tsx
"use client";
import { Search } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./navctl.module.css";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "ابحث عن منتج، متجر أو تصنيف...",
  variant = "light",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  variant?: "light" | "onDark";
}) {
  return (
    <div className={`${s.searchBox} ${variant === "onDark" ? s.searchDark : ""}`} style={uiVars}>
      <Search size={18} strokeWidth={1.9} className={s.searchIcon} aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        placeholder={placeholder}
        aria-label="البحث"
        className={s.searchInput}
      />
      <button type="button" onClick={onSubmit} aria-label="بحث" className={s.searchBtn}>
        <Search size={18} strokeWidth={2.1} />
      </button>
    </div>
  );
}
