// components/cart/CartContactConsent.tsx
// موافقة صريحة (غير مفعّلة افتراضياً) على مشاركة الاسم والجوال مع متجر واحد
// لتذكير المشتري بسلته. تُسحب في أي وقت؛ السحب يسري على الإرسال التالي.
// (نص الموافقة القانوني لم يُغيَّر؛ التغيير في الشكل فقط.)
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import c from "./cart.module.css";

export default function CartContactConsent({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [granted, setGranted] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ granted: boolean }>(`/api/cart/contact-consent?storeId=${encodeURIComponent(storeId)}`)
      .then((r) => setGranted(r.granted))
      .catch(() => {})
      .finally(() => setReady(true));
  }, [storeId]);

  if (!ready) return null;

  const toggle = async (next: boolean) => {
    setBusy(true);
    setError("");
    try {
      await api.post("/api/cart/contact-consent", { storeId, granted: next });
      setGranted(next);
    } catch {
      setError("تعذّر حفظ اختيارك، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className={c.consent} style={uiVars}>
      <input type="checkbox" checked={granted} disabled={busy} onChange={(e) => toggle(e.target.checked)} />
      <span>
        أوافق على مشاركة اسمي ورقم جوالي مع بسطة مارت ومتجر «{storeName}» وحده، ليتواصلا معي بخصوص سلتي إن لم أُكمل الطلب.
        يمكنني سحب الموافقة في أي وقت من هنا، ولن تُشارك بياناتي بعد السحب.
        {error && <strong className={c.consentErr}>{error}</strong>}
      </span>
    </label>
  );
}
