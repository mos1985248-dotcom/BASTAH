// app/dashboard/marketing/page.tsx
// بنية فقط (القسم ٣) — يستخدم /api/marketing/content و/api/marketing/campaigns
// الجاهزين فعلياً. كل محتوى/حملة تُنشأ بحالة DRAFT دائماً؛ لا تكامل فعلي
// مع أي منصة، وكل المقاييس صفر حقيقي حتى يتوفر Provider فعلي لاحقاً.
"use client";

import { useEffect, useState } from "react";
import { Film, Megaphone, Plus, Eye, MousePointerClick, ShoppingBag, Info, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import MarketingStatusBadge from "@/components/dashboard/marketing/MarketingStatusBadge";

interface ConversionMetric {
  views: number;
  clicksToProduct: number;
  purchasesAttributed: number;
  lastSyncedAt: string | null;
}
interface MarketingContentRow {
  id: string;
  title: string;
  videoUrl: string | null;
  providerName: string | null;
  status: string;
  createdAt: string;
  metric: ConversionMetric | null;
}
interface AdCampaignRow {
  id: string;
  name: string;
  budget: number;
  status: string;
  createdAt: string;
}

const cardStyle: React.CSSProperties = { background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: 13, boxSizing: "border-box" };

export default function MarketingPage() {
  const [content, setContent] = useState<MarketingContentRow[] | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaignRow[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([
      api.get<{ content: MarketingContentRow[] }>("/api/marketing/content"),
      api.get<{ campaigns: AdCampaignRow[] }>("/api/marketing/campaigns"),
    ])
      .then(([c, camp]) => {
        setContent(c.content);
        setCampaigns(camp.campaigns);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل بيانات التسويق"));
  };

  useEffect(load, []);

  if (error) return <div style={{ padding: t.spacing["4"] }}><ErrorState message={error} onRetry={load} /></div>;
  if (!content || !campaigns) return <LoadingState label="جاري تحميل لوحة التسويق..." />;

  return (
    <div style={{ padding: t.spacing["4"] }}>
      <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: t.spacing["5"] }}>
        <div>
          <h1 style={{ fontSize: t.typography.fontSize.xl, color: t.colors.primary[800], margin: `0 0 ${t.spacing["1"]}` }}>التسويق</h1>
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.text.mid }}>
            <Info size={13} strokeWidth={1.8} />
            هذه بنية أولية — لا يوجد ربط فعلي بإنستقرام أو أي منصة بعد. المقاييس تبدأ من صفر حتى يتوفر الربط.
          </p>
        </div>

        <ContentSection content={content} onChanged={load} />
        <CampaignsSection campaigns={campaigns} onChanged={load} />
      </div>
    </div>
  );
}

function ContentSection({ content, onChanged }: { content: MarketingContentRow[]; onChanged: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await api.post("/api/marketing/content", { title, videoUrl: videoUrl || undefined });
      setTitle("");
      setVideoUrl("");
      setShowForm(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إنشاء المحتوى");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
          <Film size={16} strokeWidth={1.8} color={t.colors.primary[800]} />
          المحتوى التسويقي
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: showForm ? t.colors.cream.warm : t.colors.primary[800], color: showForm ? t.colors.primary[800] : t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
        >
          <Plus size={13} strokeWidth={2.2} />
          {showForm ? "إلغاء" : "محتوى جديد"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>عنوان المحتوى</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: جولة داخل مطبخ الأسرة" dir="rtl" style={{ ...inputStyle }} />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>رابط الفيديو (اختياري)</span>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." dir="ltr" style={{ ...inputStyle }} />
          </label>
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
              <AlertTriangle size={12} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button
            onClick={handleCreate}
            disabled={saving || title.trim().length < 2}
            style={{ padding: 10, borderRadius: t.radius.md, border: "none", background: t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: title.trim().length < 2 ? 0.6 : 1 }}
          >
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
        </div>
      )}

      {content.length === 0 ? (
        <p style={{ ...cardStyle, textAlign: "center", color: t.colors.text.mid, fontSize: 13 }}>ما فيه محتوى تسويقي بعد.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {content.map((c) => (
            <div key={c.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{c.title}</p>
                <MarketingStatusBadge status={c.status} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>
                {c.providerName ?? "غير مربوط بأي منصة بعد"}
              </p>
              <div style={{ display: "flex", gap: t.spacing["4"], marginTop: 2 }}>
                <Metric icon={Eye} label="مشاهدات" value={c.metric?.views ?? 0} />
                <Metric icon={MousePointerClick} label="نقرات للمنتج" value={c.metric?.clicksToProduct ?? 0} />
                <Metric icon={ShoppingBag} label="مبيعات منسوبة" value={c.metric?.purchasesAttributed ?? 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CampaignsSection({ campaigns, onChanged }: { campaigns: AdCampaignRow[]; onChanged: () => void }) {
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
    <section style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.base, color: t.colors.text.dark }}>
          <Megaphone size={16} strokeWidth={1.8} color={t.colors.primary[800]} />
          الحملات الإعلانية
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: showForm ? t.colors.cream.warm : t.colors.primary[800], color: showForm ? t.colors.primary[800] : t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}
        >
          <Plus size={13} strokeWidth={2.2} />
          {showForm ? "إلغاء" : "حملة جديدة"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>اسم الحملة</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: حملة رمضان" dir="rtl" style={{ ...inputStyle }} />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 4, color: t.colors.text.dark }}>الميزانية (ريال)</span>
            <input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500" dir="ltr" style={{ ...inputStyle }} />
          </label>
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 11, color: t.colors.text.light }}>
            <Info size={12} strokeWidth={1.8} />
            الحملة تُحفَظ كمسودة فقط — لا يوجد تفعيل فعلي أو خصم من أي وسيلة دفع حالياً.
          </p>
          {error && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: t.colors.semantic.danger }}>
              <AlertTriangle size={12} strokeWidth={1.8} />
              {error}
            </p>
          )}
          <button
            onClick={handleCreate}
            disabled={saving || name.trim().length < 2 || !validBudget}
            style={{ padding: 10, borderRadius: t.radius.md, border: "none", background: t.colors.primary[800], color: t.colors.white, fontWeight: t.typography.fontWeight.bold, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: name.trim().length < 2 || !validBudget ? 0.6 : 1 }}
          >
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <p style={{ ...cardStyle, textAlign: "center", color: t.colors.text.mid, fontSize: 13 }}>ما فيه حملات إعلانية بعد.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
          {campaigns.map((c) => (
            <div key={c.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{c.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>الميزانية: {c.budget.toLocaleString("ar-SA")} ريال</p>
              </div>
              <MarketingStatusBadge status={c.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={13} strokeWidth={1.8} color={t.colors.text.light} />
      <span style={{ fontSize: 12, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>{value}</span>
      <span style={{ fontSize: 11, color: t.colors.text.light }}>{label}</span>
    </div>
  );
}
