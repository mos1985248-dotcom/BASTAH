// components/store/StoreHeroActions.tsx
"use client";
import { useState } from "react";
import { Check, Heart, MessageCircle, Share2 } from "lucide-react";
import { shareContent } from "@/lib/share";
import type { StoreDetail } from "./types";
import s from "./hero.module.css";

export default function StoreHeroActions({
  store,
  following,
  busy,
  onToggleFollow,
}: {
  store: StoreDetail;
  following: boolean;
  busy: boolean;
  onToggleFollow: () => void;
}) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const result = await shareContent({ title: store.nameAr, text: store.shortDesc ?? store.nameAr });
    if (result === "copied") {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className={s.actions}>
      <a href="#products" className={`${s.btn} ${s.btnGold}`}>
        تصفّح المنتجات
      </a>
      <button
        type="button"
        className={`${s.btn} ${following ? s.btnOn : ""}`}
        onClick={onToggleFollow}
        disabled={busy}
        aria-pressed={following}
      >
        <Heart size={16} strokeWidth={1.9} fill={following ? "currentColor" : "none"} aria-hidden="true" />
        {following ? "بالمفضلة" : "متابعة"}
      </button>
      <button type="button" className={s.btn} onClick={handleShare}>
        {shared ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <Share2 size={16} strokeWidth={1.9} aria-hidden="true" />}
        {shared ? "تم النسخ" : "مشاركة"}
      </button>
      {store.whatsapp && (
        <a
          href={`https://wa.me/${store.whatsapp.replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.btn}
        >
          <MessageCircle size={16} strokeWidth={1.9} aria-hidden="true" />
          واتساب
        </a>
      )}
    </div>
  );
}
