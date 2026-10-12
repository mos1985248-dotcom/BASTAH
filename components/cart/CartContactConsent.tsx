// components/cart/CartContactConsent.tsx
// موافقة صريحة (غير مفعّلة افتراضياً) على مشاركة الاسم والجوال مع متجر واحد
// لتذكير المشتري بسلته. تُسحب في أي وقت؛ السحب يسري على الإرسال التالي.
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";

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
      setError("تعذّر حفظ اختيارك، حاولي مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: `${t.spacing["2"]} 0 ${t.spacing["4"]}`, fontSize: 12, color: t.colors.text.mid, cursor: "pointer" }}>
      <input type="checkbox" checked={granted} disabled={busy} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 2 }} />
      <span>
        أوافق على مشاركة اسمي ورقم جوالي مع بسطة ومتجر «{storeName}» وحده، ليتواصلا معي بخصوص سلتي إن لم أُكمل الطلب.
        يمكنني سحب الموافقة في أي وقت من هنا، ولن تُشارك بياناتي بعد السحب.
        {error && <strong style={{ display: "block", color: t.colors.semantic.danger }}>{error}</strong>}
      </span>
    </label>
  );
}
