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
      className="basita-search-bar"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 620,
        minHeight: 50,
        boxSizing: "border-box",
        background: isOnDark ? "#FFFFFF" : "#F7F1E5",
        border: isOnDark
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(91,70,45,0.12)",
        borderRadius: 999,
        padding: 5,
        boxShadow: isOnDark
          ? t.shadows.sm
          : "0 4px 12px rgba(67,48,29,0.04)",
        transition:
          "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
      }}
    >
      <Search
        size={18}
        strokeWidth={1.9}
        color={t.colors.gold[700]}
        style={{
          marginInlineStart: 14,
          flexShrink: 0,
        }}
      />

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
        style={{
          flex: 1,
          minWidth: 0,
          height: 42,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: t.typography.fontSize.sm,
          direction: "rtl",
          color: t.colors.text.dark,
          padding: `0 ${t.spacing["3"]}`,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      <button
        type="button"
        onClick={onSubmit}
        aria-label="بحث"
        className="basita-search-button"
        style={{
          width: 42,
          height: 42,
          border: "none",
          borderRadius: 999,
          background: t.colors.primary[800],
          color: t.colors.text.onDark,
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 8px rgba(33,53,42,0.12)",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
        }}
      >
        <Search size={18} strokeWidth={2.1} />
      </button>

      <style>{`
        .basita-search-bar:focus-within {
          border-color: rgba(166,124,45,0.34) !important;
          box-shadow: 0 6px 18px rgba(67,48,29,0.08) !important;
          background: #FFFDF8 !important;
        }

        .basita-search-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(33,53,42,0.18);
        }

        .basita-search-bar input::placeholder {
          color: rgba(91,70,45,0.58);
        }

        @media (max-width: 600px) {
          .basita-search-bar {
            min-height: 46px !important;
          }

          .basita-search-button {
            width: 38px !important;
            height: 38px !important;
          }

          .basita-search-bar input {
            height: 38px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}