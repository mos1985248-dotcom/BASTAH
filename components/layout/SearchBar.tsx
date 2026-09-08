// components/layout/SearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { t } from "@/theme";

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
  const isOnDark = variant === "onDark";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: isOnDark ? t.colors.white : t.colors.cream.bg,
        border: `1.5px solid ${isOnDark ? "transparent" : t.colors.cream.border}`,
        borderRadius: t.radius.full,
        padding: "6px 6px 6px 18px",
        flex: 1,
        maxWidth: 540,
        boxShadow: isOnDark ? t.shadows.sm : "none",
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: t.typography.fontSize.base,
          direction: "rtl",
          color: t.colors.text.dark,
          padding: `8px ${t.spacing["1"]}`,
        }}
      />
      <button
        onClick={onSubmit}
        aria-label="بحث"
        className="basita-btn-interactive"
        style={{
          border: "none",
          borderRadius: t.radius.full,
          width: 40,
          height: 40,
          background: t.colors.primary[800],
          color: t.colors.text.onDark,
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Search size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}