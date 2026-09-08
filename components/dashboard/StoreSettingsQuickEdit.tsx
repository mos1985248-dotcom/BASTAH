// components/dashboard/StoreSettingsQuickEdit.tsx
// logo/coverImage: تُرفَع وتُحفَظ مباشرة عبر POST /api/uploads/store (فوري،
// بلا زر حفظ منفصل). whatsapp/city عبر PATCH /api/stores/[slug]، والباقي
// (قصة الأسرة، الشارات، الفيديو، ساعات العمل، الترخيص، الشحن، الدفع،
// الإرجاع) عبر PATCH /api/stores/[slug]/public-info.
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Image as ImageIcon, Tag, Film, MessageCircle, MapPin, BookOpen, Sparkles, Clock, FileBadge, Truck, CreditCard, RotateCcw, AlertTriangle, Check, X, Navigation, Settings } from "lucide-react";
import LocationPicker from "./LocationPicker";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import StoreImageUpload from "./StoreImageUpload";

export interface EditableStoreData {
  slug: string;
  logo: string | null;
  coverImage: string | null;
  whatsapp: string | null;
  city: string | null;
  storyAr: string | null;
  videoUrl: string | null;
  storyTags: string[];
  workingHours: string | null;
  licenseNumber: string | null;
  deliveryPartner: string | null;
  paymentMethods: string[];
  returnPolicyDays: number | null;
  // ⚠️ Geolocation — latitude/longitude تُعرَض هنا فقط لأن هذا الـcomponent
  // يُستخدم فقط بلوحة التاجر (مالك المتجر)، وGET /api/stores/[slug] يكشفها
  // له تحديداً (راجع تعليق الخصوصية بذاك الـroute)
  latitude: number | null;
  longitude: number | null;
  pickupEnabled: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid`,
  borderRadius: t.radius.md,
  fontSize: t.typography.fontSize.sm,
  boxSizing: "border-box",
  background: t.colors.white,
  color: t.colors.text.dark,
  outline: "none",
  transition: `border-color ${t.motion.fast} ${t.motion.ease}`,
};

function IconLabel({ icon: Icon, text }: { icon: typeof ImageIcon; text: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.primary[800], fontWeight: t.typography.fontWeight.bold }}>
      <Icon size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
      {text}
    </span>
  );
}

export default function StoreSettingsQuickEdit({ store }: { store: EditableStoreData }) {
  const [form, setForm] = useState({
    logo: store.logo ?? "",
    coverImage: store.coverImage ?? "",
    whatsapp: store.whatsapp ?? "",
    city: store.city ?? "",
    storyAr: store.storyAr ?? "",
    videoUrl: store.videoUrl ?? "",
    storyTags: store.storyTags ?? [],
    workingHours: store.workingHours ?? "",
    licenseNumber: store.licenseNumber ?? "",
    deliveryPartner: store.deliveryPartner ?? "",
    paymentMethods: store.paymentMethods ?? [],
    returnPolicyDays: store.returnPolicyDays != null ? String(store.returnPolicyDays) : "",
    latitude: store.latitude != null ? String(store.latitude) : "",
    longitude: store.longitude != null ? String(store.longitude) : "",
    pickupEnabled: store.pickupEnabled,
  });
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [paymentInput, setPaymentInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const val = tagInput.trim();
    if (!val || form.storyTags.includes(val) || form.storyTags.length >= 10) return;
    set("storyTags", [...form.storyTags, val]);
    setTagInput("");
  };
  const removeTag = (tag: string) => set("storyTags", form.storyTags.filter((x) => x !== tag));

  const addPayment = () => {
    const val = paymentInput.trim();
    if (!val || form.paymentMethods.includes(val) || form.paymentMethods.length >= 8) return;
    set("paymentMethods", [...form.paymentMethods, val]);
    setPaymentInput("");
  };
  const removePayment = (m: string) => set("paymentMethods", form.paymentMethods.filter((x) => x !== m));

  // ⚠️ لا نستخدم أي مزود خرائط مدفوع (Google Maps/Mapbox) — فقط
  // navigator.geolocation المجانية بالمتصفح. راجع تعليق TODO بـ
  // lib/geolocation.ts للـGeocoding الفعلي لاحقاً لو احتجناه.
  const useCurrentLocation = () => {
    setLocateError("");
    if (!navigator.geolocation) {
      setLocateError("متصفحك لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", String(pos.coords.latitude));
        set("longitude", String(pos.coords.longitude));
        setLocating(false);
      },
      (err) => {
        // ⚠️ رسالة مختلفة حسب كود الخطأ الفعلي — بدل رسالة عامة واحدة
        // تخفي السبب الحقيقي (صلاحية مرفوضة ≠ خدمة موقع مقفلة بالنظام ≠ تايم آوت)
        const messages: Record<number, string> = {
          1: "رفضتِ صلاحية الموقع للمتصفح — فعّليها من إعدادات الموقع بجانب شريط العنوان (أيقونة 🔒)",
          2: "تعذّر تحديد الموقع — تأكدي إن خدمة الموقع (Location Services) مفعّلة بجهازك من إعدادات النظام",
          3: "استغرق تحديد الموقع وقتاً أطول من المتوقع — جربي مرة ثانية",
        };
        setLocateError(messages[err.code] ?? "تعذّر تحديد موقعك — تأكدي من السماح للمتصفح بالوصول للموقع");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const hasCoords = form.latitude.trim() !== "" && form.longitude.trim() !== "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedMsg("");
    // نفس تحقق الباكند — تجربة أوضح للتاجر بدل انتظار رد 422
    if (form.pickupEnabled && !hasCoords) {
      setError("لازم تحددي الموقع (بالأعلى) قبل تفعيل الاستلام من موقعك");
      setSaving(false);
      return;
    }
    try {
      await Promise.all([
        api.patch(`/api/stores/${store.slug}`, {
          whatsapp: form.whatsapp || undefined,
          city: form.city || undefined,
          latitude: hasCoords ? Number(form.latitude) : undefined,
          longitude: hasCoords ? Number(form.longitude) : undefined,
          pickupEnabled: form.pickupEnabled,
        }),
        api.patch(`/api/stores/${store.slug}/public-info`, {
          storyAr: form.storyAr || undefined,
          videoUrl: form.videoUrl,
          storyTags: form.storyTags,
          workingHours: form.workingHours || undefined,
          licenseNumber: form.licenseNumber || undefined,
          deliveryPartner: form.deliveryPartner || undefined,
          paymentMethods: form.paymentMethods,
          returnPolicyDays: form.returnPolicyDays !== "" ? Number(form.returnPolicyDays) : undefined,
        }),
      ]);
      setSavedMsg("تم حفظ التغييرات — انعكست على صفحة متجرك مباشرة");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        padding: t.spacing["6"],
        direction: "rtl",
        boxShadow: t.shadows.sm,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: t.spacing["5"] }}>
        <div style={{ width: 34, height: 34, borderRadius: t.radius.full, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Settings size={18} strokeWidth={1.8} color={t.colors.primary[800]} />
        </div>
        <h3 style={{ margin: 0, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          إعدادات المتجر السريعة
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
        <StoreImageUpload
          slug={store.slug}
          field="cover"
          label={<IconLabel icon={ImageIcon} text="صورة الغلاف" />}
          currentUrl={form.coverImage}
          recommendedSize="1600×600 بكسل"
          aspectRatio="8 / 3"
          onUploaded={(url) => set("coverImage", url)}
        />
        <StoreImageUpload
          slug={store.slug}
          field="logo"
          label={<IconLabel icon={Tag} text="شعار المتجر" />}
          currentUrl={form.logo}
          recommendedSize="500×500 بكسل"
          aspectRatio="1 / 1"
          onUploaded={(url) => set("logo", url)}
        />
        <Field label={<IconLabel icon={Film} text="فيديو المتجر (رابط)" />} value={form.videoUrl} onChange={(v) => set("videoUrl", v)} dir="ltr" placeholder="https://youtube.com/..." />
        <Field label={<IconLabel icon={MessageCircle} text="واتساب المتجر" />} value={form.whatsapp} onChange={(v) => set("whatsapp", v)} dir="rtl" placeholder="+9665XXXXXXXX" />
        <Field label={<IconLabel icon={MapPin} text="المدينة" />} value={form.city} onChange={(v) => set("city", v)} dir="rtl" placeholder="بريدة" />

        <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.md, padding: t.spacing["4"], display: "flex", flexDirection: "column", gap: t.spacing["3"], border: `1px solid ${t.colors.cream.border}` }}>
          <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "flex", alignItems: "center", gap: 6, color: t.colors.primary[800] }}>
            <Navigation size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
            موقع متجرك الدقيق
          </span>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium, lineHeight: t.typography.lineHeight.relaxed }}>
            يساعد المشترين القريبين يلقونك بسهولة، ولازم لتفعيل "استلام من موقعي".
          </p>

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="basita-btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: t.radius.md,
              border: `1px solid ${t.colors.primary[800]}`,
              background: t.colors.white,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
              cursor: locating ? "not-allowed" : "pointer",
              boxShadow: t.shadows.sm,
            }}
          >
            <Navigation size={14} strokeWidth={2} />
            {locating ? "جاري تحديد الموقع..." : "استخدمي موقعي الحالي"}
          </button>

          {locateError && (
            <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
              <AlertTriangle size={13} strokeWidth={1.8} />
              {locateError}
            </p>
          )}

          <LocationPicker
            latitude={form.latitude.trim() !== "" ? Number(form.latitude) : null}
            longitude={form.longitude.trim() !== "" ? Number(form.longitude) : null}
            onChange={(lat, lng) => {
              set("latitude", String(lat));
              set("longitude", String(lng));
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.text.mid, display: "block", marginBottom: 4 }}>خط العرض (Latitude)</span>
              <input
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="26.3260"
                dir="ltr"
                style={{ ...inputStyle, borderColor: t.colors.cream.border, fontSize: t.typography.fontSize.xs }}
              />
            </label>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.text.mid, display: "block", marginBottom: 4 }}>خط الطول (Longitude)</span>
              <input
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="43.9750"
                dir="ltr"
                style={{ ...inputStyle, borderColor: t.colors.cream.border, fontSize: t.typography.fontSize.xs }}
              />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: hasCoords ? "pointer" : "not-allowed", opacity: hasCoords ? 1 : 0.6, marginTop: 4 }}>
            <input
              type="checkbox"
              checked={form.pickupEnabled}
              disabled={!hasCoords}
              onChange={(e) => set("pickupEnabled", e.target.checked)}
              style={{ width: 16, height: 16, accentColor: t.colors.primary[800], cursor: hasCoords ? "pointer" : "not-allowed" }}
            />
            <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
              فعّلي "استلام من موقعي" — يظهر للمشتري عند اختيار التحويل البنكي
            </span>
          </label>
          {!hasCoords && (
            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.light, fontWeight: t.typography.fontWeight.medium }}>حدّدي الموقع بالأعلى أولاً لتفعيل هذا الخيار</p>
          )}
        </div>

        <label style={{ display: "block" }}>
          <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: t.colors.text.dark }}>
            <BookOpen size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
            قصة الأسرة
          </span>
          <textarea
            value={form.storyAr}
            onChange={(e) => set("storyAr", e.target.value)}
            rows={4}
            placeholder="اكتبي قصة متجرك وشغف أسرتك..."
            style={{ ...inputStyle, direction: "rtl", resize: "vertical", borderColor: t.colors.cream.border, fontFamily: "inherit" }}
          />
        </label>

        <TagField
          label={<IconLabel icon={Sparkles} text="شارات الثقة (تظهر بصفحة متجرك)" />}
          items={form.storyTags}
          onRemove={removeTag}
          inputValue={tagInput}
          onInputChange={setTagInput}
          onAdd={addTag}
          placeholder="مثال: صناعة يدوية"
        />

        <Field label={<IconLabel icon={Clock} text="ساعات العمل" />} value={form.workingHours} onChange={(v) => set("workingHours", v)} dir="rtl" placeholder="السبت-الخميس 9ص-9م" />
        <Field label={<IconLabel icon={FileBadge} text="رقم الترخيص" />} value={form.licenseNumber} onChange={(v) => set("licenseNumber", v)} dir="rtl" placeholder="12456789" />
        <Field label={<IconLabel icon={Truck} text="شركة الشحن" />} value={form.deliveryPartner} onChange={(v) => set("deliveryPartner", v)} dir="rtl" placeholder="أرامكس، سمسا..." />

        <TagField
          label={<IconLabel icon={CreditCard} text="طرق الدفع المتاحة" />}
          items={form.paymentMethods}
          onRemove={removePayment}
          inputValue={paymentInput}
          onInputChange={setPaymentInput}
          onAdd={addPayment}
          placeholder="مثال: مدى"
        />

        <label style={{ display: "block" }}>
          <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: t.colors.text.dark }}>
            <RotateCcw size={15} strokeWidth={1.8} color={t.colors.primary[800]} />
            سياسة الإرجاع (بالأيام)
          </span>
          <input
            type="number"
            min={0}
            max={90}
            value={form.returnPolicyDays}
            onChange={(e) => set("returnPolicyDays", e.target.value)}
            placeholder="مثال: 7"
            style={{ ...inputStyle, direction: "rtl", borderColor: t.colors.cream.border }}
          />
        </label>

        {error && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.danger, fontWeight: t.typography.fontWeight.bold }}>
            <AlertTriangle size={14} strokeWidth={1.8} />
            {error}
          </p>
        )}
        {savedMsg && (
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.semantic.success, fontWeight: t.typography.fontWeight.bold }}>
            <Check size={14} strokeWidth={2.2} />
            {savedMsg}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="basita-btn-interactive"
          style={{
            padding: "12px 20px",
            background: saving ? t.colors.primary[600] : t.colors.primary[800],
            color: t.colors.white,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: t.shadows.sm,
            marginTop: t.spacing["2"],
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir = "ltr", placeholder }: { label: ReactNode; value: string; onChange: (v: string) => void; dir?: string; placeholder?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 6, color: t.colors.text.dark }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, direction: dir as "ltr" | "rtl", borderColor: t.colors.cream.border }} />
    </label>
  );
}

function TagField({
  label, items, onRemove, inputValue, onInputChange, onAdd, placeholder,
}: {
  label: ReactNode;
  items: string[];
  onRemove: (v: string) => void;
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, display: "block", marginBottom: 6, color: t.colors.text.dark }}>{label}</span>
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {items.map((it) => (
            <span key={it} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: t.typography.fontSize.xs, padding: "5px 10px", background: t.colors.cream.warm, borderRadius: t.radius.full, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium, border: `1px solid ${t.colors.cream.border}` }}>
              {it}
              <button onClick={() => onRemove(it)} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: t.colors.text.light, display: "flex", padding: 0 }}>
                <X size={13} strokeWidth={2.2} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          style={{ ...inputStyle, direction: "rtl", borderColor: t.colors.cream.border }}
        />
        <button
          onClick={onAdd}
          type="button"
          className="basita-btn-interactive"
          style={{ padding: "0 18px", borderRadius: t.radius.md, border: `1px solid ${t.colors.cream.border}`, background: t.colors.cream.warm, color: t.colors.primary[800], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          إضافة
        </button>
      </div>
    </div>
  );
}