// components/dashboard/marketing/CampaignsSection.tsx — الحملات الإعلانية (مسودات فقط، بلا إطلاق فعلي).
"use client";

import { useState } from "react";
import { Megaphone, Plus, Info, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import f from "../forms.module.css";
import s from "./marketing.module.css";
import MarketingStatusBadge from "./MarketingStatusBadge";
import type { AdCampaignRow } from "./types";

export default function CampaignsSection({ campaigns, onChanged }: { campaigns: AdCampaignRow[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/marketing/campaigns", { name, budget: Number(budget) });
      setName("");
      setBudget("");
      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إنشاء الحملة");
    } finally {
      setSaving(false);
    }
  };

  const validBudget = Number(budget) > 0;

  return (
    <section className={s.sec}>
      <div className={s.secHead}>
        <h2 className={s.h2}>
          <Megaphone size={18} strokeWidth={1.8} />
          الحملات الإعلانية
        </h2>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={`${f.btnSm} ${showForm ? "" : f.btnPrimary}`}>
          <Plus size={14} strokeWidth={2.2} />
          {showForm ? "إلغاء" : "حملة جديدة"}
        </button>
      </div>

      {showForm && (
        <div className={f.formBox}>
          <label className={f.fieldWrap}>
            <span className={f.fieldLabel}>اسم الحملة</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: حملة رمضان" dir="rtl" className={f.field} />
          </label>
          <label className={f.fieldWrap}>
            <span className={f.fieldLabel}>الميزانية (ريال)</span>
            <input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500" dir="ltr" className={`${f.field} ${f.ltr}`} />
          </label>
          <p className={s.formNote}>
            <Info size={14} strokeWidth={1.8} />
            الحملة تُحفَظ كمسودة فقط — لا يوجد تفعيل فعلي أو خصم من أي وسيلة دفع حالياً.
          </p>
          {error && (
            <p className={f.err} role="alert">
              <AlertTriangle size={14} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button type="button" onClick={handleCreate} disabled={saving || name.trim().length < 2 || !validBudget} className={`${f.cta} ${s.submit}`}>
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <p className={s.empty}>لا توجد حملات إعلانية بعد.</p>
      ) : (
        <div className={s.list}>
          {campaigns.map((c) => (
            <div key={c.id} className={`${s.card} ${s.cardRow}`}>
              <div>
                <p className={s.cardTitle}>{c.name}</p>
                <p className={s.cardMeta}>الميزانية: {c.budget.toLocaleString("ar-SA")} ريال</p>
              </div>
              <MarketingStatusBadge status={c.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
