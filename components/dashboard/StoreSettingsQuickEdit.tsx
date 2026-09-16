// components/dashboard/StoreSettingsQuickEdit.tsx
// إعدادات المتجر السريعة.
// الصور تُرفع مباشرة عبر POST /api/uploads/store.
// بيانات المتجر تُحفظ عبر PATCH /api/stores/[slug]
// والمعلومات العامة عبر PATCH /api/stores/[slug]/public-info.

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Image as ImageIcon,
  Tag,
  Film,
  MessageCircle,
  MapPin,
  BookOpen,
  Sparkles,
  Clock,
  FileBadge,
  Truck,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  Navigation,
  Settings,
  Save,
  Store,
} from "lucide-react";

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
  latitude: number | null;
  longitude: number | null;
  pickupEnabled: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  border: `1px solid ${t.colors.cream.border}`,
  borderRadius: 13,
  fontFamily: t.typography.fontFamily.base,
  fontSize: t.typography.fontSize.sm,
  boxSizing: "border-box",
  background: t.colors.cream.card,
  color: t.colors.text.dark,
  outline: "none",
  transition:
    `border-color ${t.motion.fast} ${t.motion.ease}, ` +
    `box-shadow ${t.motion.fast} ${t.motion.ease}, ` +
    `background ${t.motion.fast} ${t.motion.ease}`,
};

function IconLabel({
  icon: Icon,
  text,
}: {
  icon: typeof ImageIcon;
  text: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        color: t.colors.text.dark,
        fontFamily: t.typography.fontFamily.base,
        fontSize: t.typography.fontSize.sm,
        fontWeight: t.typography.fontWeight.bold,
      }}
    >
      <Icon
        size={16}
        strokeWidth={1.8}
        color={t.colors.primary[800]}
      />

      {text}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Settings;
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
        paddingBottom: 13,
        marginBottom: 15,
        borderBottom: `1px solid ${t.colors.cream.borderLight}`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: t.colors.primary[50],
          border: `1px solid ${t.colors.primary[100]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
          color={t.colors.primary[800]}
        />
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: t.typography.fontFamily.heading,
            fontSize: t.typography.fontSize.lg,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>

        {description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.mid,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StoreSettingsQuickEdit({
  store,
}: {
  store: EditableStoreData;
}) {
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
    returnPolicyDays:
      store.returnPolicyDays != null
        ? String(store.returnPolicyDays)
        : "",
    latitude:
      store.latitude != null
        ? String(store.latitude)
        : "",
    longitude:
      store.longitude != null
        ? String(store.longitude)
        : "",
    pickupEnabled: store.pickupEnabled,
  });

  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [paymentInput, setPaymentInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const addTag = () => {
    const value = tagInput.trim();

    if (
      !value ||
      form.storyTags.includes(value) ||
      form.storyTags.length >= 10
    ) {
      return;
    }

    set("storyTags", [
      ...form.storyTags,
      value,
    ]);

    setTagInput("");
  };

  const removeTag = (tag: string) => {
    set(
      "storyTags",
      form.storyTags.filter(
        (item) => item !== tag,
      ),
    );
  };

  const addPayment = () => {
    const value = paymentInput.trim();

    if (
      !value ||
      form.paymentMethods.includes(value) ||
      form.paymentMethods.length >= 8
    ) {
      return;
    }

    set("paymentMethods", [
      ...form.paymentMethods,
      value,
    ]);

    setPaymentInput("");
  };

  const removePayment = (method: string) => {
    set(
      "paymentMethods",
      form.paymentMethods.filter(
        (item) => item !== method,
      ),
    );
  };

  const useCurrentLocation = () => {
    setLocateError("");

    if (!navigator.geolocation) {
      setLocateError(
        "متصفحك لا يدعم تحديد الموقع.",
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        set(
          "latitude",
          String(position.coords.latitude),
        );

        set(
          "longitude",
          String(position.coords.longitude),
        );

        setLocating(false);
      },
      (geoError) => {
        const messages: Record<
          number,
          string
        > = {
          1:
            "لم يتم السماح للمتصفح بالوصول إلى الموقع. فعّل إذن الموقع من إعدادات المتصفح.",
          2:
            "تعذّر تحديد موقعك. تأكد من تفعيل خدمة الموقع على الجهاز.",
          3:
            "استغرق تحديد الموقع وقتًا أطول من المتوقع. حاول مرة أخرى.",
        };

        setLocateError(
          messages[geoError.code] ??
            "تعذّر تحديد موقعك.",
        );

        setLocating(false);
      },
      {
        timeout: 10000,
      },
    );
  };

  const hasCoords =
    form.latitude.trim() !== "" &&
    form.longitude.trim() !== "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedMsg("");

    if (form.pickupEnabled && !hasCoords) {
      setError(
        "حدّد موقع المتجر أولًا قبل تفعيل الاستلام من الموقع.",
      );

      setSaving(false);
      return;
    }

    try {
      await Promise.all([
        api.patch(
          `/api/stores/${store.slug}`,
          {
            whatsapp:
              form.whatsapp || undefined,
            city:
              form.city || undefined,
            latitude: hasCoords
              ? Number(form.latitude)
              : undefined,
            longitude: hasCoords
              ? Number(form.longitude)
              : undefined,
            pickupEnabled:
              form.pickupEnabled,
          },
        ),

        api.patch(
          `/api/stores/${store.slug}/public-info`,
          {
            storyAr:
              form.storyAr || undefined,
            videoUrl: form.videoUrl,
            storyTags: form.storyTags,
            workingHours:
              form.workingHours || undefined,
            licenseNumber:
              form.licenseNumber || undefined,
            deliveryPartner:
              form.deliveryPartner || undefined,
            paymentMethods:
              form.paymentMethods,
            returnPolicyDays:
              form.returnPolicyDays !== ""
                ? Number(
                    form.returnPolicyDays,
                  )
                : undefined,
          },
        ),
      ]);

      setSavedMsg(
        "تم حفظ التغييرات بنجاح، وستظهر على صفحة متجرك مباشرة.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "تعذّر حفظ التغييرات.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="basita-store-settings"
      style={{
        background: t.colors.cream.card,
        borderRadius: 20,
        border: `1px solid ${t.colors.cream.border}`,
        padding: 20,
        direction: "rtl",
        boxShadow:
          "0 6px 18px rgba(67,48,29,0.045)",
      }}
    >
      {/* عنوان القسم الرئيسي */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: t.colors.primary[50],
            border: `1px solid ${t.colors.primary[100]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Settings
            size={20}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontFamily:
                t.typography.fontFamily.heading,
              fontSize:
                t.typography.fontSize.xl,
              fontWeight:
                t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.35,
            }}
          >
            إعدادات المتجر
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              fontSize:
                t.typography.fontSize.xs,
              color: t.colors.text.mid,
            }}
          >
            حدّث معلومات متجرك ومظهره وطرق
            التواصل والشحن والدفع.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* الهوية البصرية */}
        <div className="basita-settings-section">
          <SectionHeader
            icon={ImageIcon}
            title="هوية المتجر"
            description="ارفع الشعار والغلاف ليظهر متجرك بشكل احترافي."
          />

          <div
            className="basita-settings-media-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 18,
            }}
          >
            <StoreImageUpload
              slug={store.slug}
              field="cover"
              label={
                <IconLabel
                  icon={ImageIcon}
                  text="صورة الغلاف"
                />
              }
              currentUrl={form.coverImage}
              recommendedSize="1600×600 بكسل"
              aspectRatio="8 / 3"
              onUploaded={(url) =>
                set("coverImage", url)
              }
            />

            <StoreImageUpload
              slug={store.slug}
              field="logo"
              label={
                <IconLabel
                  icon={Tag}
                  text="شعار المتجر"
                />
              }
              currentUrl={form.logo}
              recommendedSize="500×500 بكسل"
              aspectRatio="1 / 1"
              onUploaded={(url) =>
                set("logo", url)
              }
            />
          </div>
        </div>

        {/* معلومات التواصل */}
        <div className="basita-settings-section">
          <SectionHeader
            icon={Store}
            title="معلومات المتجر"
            description="المعلومات الأساسية التي تظهر للزوار والعملاء."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
            className="basita-settings-two-column"
          >
            <Field
              label={
                <IconLabel
                  icon={MessageCircle}
                  text="واتساب المتجر"
                />
              }
              value={form.whatsapp}
              onChange={(value) =>
                set("whatsapp", value)
              }
              dir="rtl"
              placeholder="+9665XXXXXXXX"
            />

            <Field
              label={
                <IconLabel
                  icon={MapPin}
                  text="المدينة"
                />
              }
              value={form.city}
              onChange={(value) =>
                set("city", value)
              }
              dir="rtl"
              placeholder="بريدة"
            />

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <Field
                label={
                  <IconLabel
                    icon={Film}
                    text="فيديو المتجر — رابط"
                  />
                }
                value={form.videoUrl}
                onChange={(value) =>
                  set("videoUrl", value)
                }
                dir="ltr"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* قصة المتجر */}
        <div className="basita-settings-section">
          <SectionHeader
            icon={BookOpen}
            title="قصة المتجر"
            description="عرّف العملاء بقصتك وشغفك والمنتجات التي تقدمها."
          />

          <label
            style={{
              display: "block",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 7,
                color: t.colors.text.dark,
                fontSize:
                  t.typography.fontSize.sm,
                fontWeight:
                  t.typography.fontWeight.bold,
              }}
            >
              <BookOpen
                size={16}
                strokeWidth={1.8}
                color={t.colors.primary[800]}
              />
              قصة الأسرة
            </span>

            <textarea
              value={form.storyAr}
              onChange={(event) =>
                set(
                  "storyAr",
                  event.target.value,
                )
              }
              rows={5}
              placeholder="اكتب قصة متجرك وشغف أسرتك..."
              className="basita-dashboard-field basita-dashboard-textarea"
              style={{
                ...inputStyle,
                height: "auto",
                minHeight: 130,
                padding: "12px 14px",
                direction: "rtl",
                resize: "vertical",
                lineHeight: 1.8,
              }}
            />
          </label>

          <div
            style={{
              marginTop: 14,
            }}
          >
            <TagField
              label={
                <IconLabel
                  icon={Sparkles}
                  text="شارات الثقة"
                />
              }
              items={form.storyTags}
              onRemove={removeTag}
              inputValue={tagInput}
              onInputChange={setTagInput}
              onAdd={addTag}
              placeholder="مثال: صناعة يدوية"
            />
          </div>
        </div>

        {/* التشغيل والشحن */}
        <div className="basita-settings-section">
          <SectionHeader
            icon={Truck}
            title="التشغيل والخدمات"
            description="معلومات تساعد العملاء على معرفة أوقات العمل والشحن."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
            className="basita-settings-three-column"
          >
            <Field
              label={
                <IconLabel
                  icon={Clock}
                  text="ساعات العمل"
                />
              }
              value={form.workingHours}
              onChange={(value) =>
                set("workingHours", value)
              }
              dir="rtl"
              placeholder="السبت-الخميس 9ص-9م"
            />

            <Field
              label={
                <IconLabel
                  icon={FileBadge}
                  text="رقم الترخيص"
                />
              }
              value={form.licenseNumber}
              onChange={(value) =>
                set("licenseNumber", value)
              }
              dir="rtl"
              placeholder="12456789"
            />

            <Field
              label={
                <IconLabel
                  icon={Truck}
                  text="شركة الشحن"
                />
              }
              value={form.deliveryPartner}
              onChange={(value) =>
                set("deliveryPartner", value)
              }
              dir="rtl"
              placeholder="أرامكس، سمسا..."
            />
          </div>
        </div>

        {/* الدفع والإرجاع */}
        <div className="basita-settings-section">
          <SectionHeader
            icon={CreditCard}
            title="الدفع والإرجاع"
            description="حدد طرق الدفع التي تقبلها وسياسة الإرجاع."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) 220px",
              gap: 16,
              alignItems: "start",
            }}
            className="basita-settings-payment-grid"
          >
            <TagField
              label={
                <IconLabel
                  icon={CreditCard}
                  text="طرق الدفع المتاحة"
                />
              }
              items={form.paymentMethods}
              onRemove={removePayment}
              inputValue={paymentInput}
              onInputChange={setPaymentInput}
              onAdd={addPayment}
              placeholder="مثال: مدى"
            />

            <label
              style={{
                display: "block",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 7,
                  color: t.colors.text.dark,
                  fontSize:
                    t.typography.fontSize.sm,
                  fontWeight:
                    t.typography.fontWeight.bold,
                }}
              >
                <RotateCcw
                  size={16}
                  strokeWidth={1.8}
                  color={t.colors.primary[800]}
                />
                سياسة الإرجاع
              </span>

              <input
                type="number"
                min={0}
                max={90}
                value={
                  form.returnPolicyDays
                }
                onChange={(event) =>
                  set(
                    "returnPolicyDays",
                    event.target.value,
                  )
                }
                placeholder="مثال: 7"
                className="basita-dashboard-field"
                style={{
                  ...inputStyle,
                  direction: "rtl",
                }}
              />

              <span
                style={{
                  display: "block",
                  marginTop: 5,
                  color: t.colors.text.light,
                  fontSize: "11px",
                }}
              >
                عدد أيام الإرجاع المسموحة.
              </span>
            </label>
          </div>
        </div>

        {/* الموقع */}
        <div
          className="basita-settings-section"
          style={{
            background: t.colors.cream.warm,
          }}
        >
          <SectionHeader
            icon={Navigation}
            title="موقع المتجر"
            description="حدد موقع متجرك ليسهل على العملاء الوصول إليه."
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="basita-btn-interactive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "flex-start",
                gap: 8,
                minHeight: 42,
                padding: "0 16px",
                borderRadius: 12,
                border:
                  `1px solid ${t.colors.primary[800]}`,
                background: t.colors.white,
                color: t.colors.primary[800],
                fontFamily:
                  t.typography.fontFamily.base,
                fontSize:
                  t.typography.fontSize.xs,
                fontWeight:
                  t.typography.fontWeight.bold,
                cursor: locating
                  ? "not-allowed"
                  : "pointer",
                opacity: locating ? 0.65 : 1,
              }}
            >
              <Navigation
                size={15}
                strokeWidth={2}
              />

              {locating
                ? "جاري تحديد الموقع..."
                : "استخدام موقعي الحالي"}
            </button>

            {locateError && (
              <p
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  margin: 0,
                  padding: "9px 10px",
                  borderRadius: 11,
                  background:
                    t.colors.semantic.dangerBg,
                  border:
                    "1px solid rgba(220,38,38,0.12)",
                  color:
                    t.colors.semantic.danger,
                  fontSize:
                    t.typography.fontSize.xs,
                  lineHeight: 1.7,
                  fontWeight:
                    t.typography.fontWeight.bold,
                }}
              >
                <AlertTriangle
                  size={14}
                  strokeWidth={1.9}
                  style={{
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                />

                <span>{locateError}</span>
              </p>
            )}

            <LocationPicker
              latitude={
                form.latitude.trim() !== ""
                  ? Number(form.latitude)
                  : null
              }
              longitude={
                form.longitude.trim() !== ""
                  ? Number(form.longitude)
                  : null
              }
              onChange={(latitude, longitude) => {
                set(
                  "latitude",
                  String(latitude),
                );

                set(
                  "longitude",
                  String(longitude),
                );
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 12,
              }}
              className="basita-settings-coordinates"
            >
              <CoordinateField
                label="خط العرض (Latitude)"
                value={form.latitude}
                placeholder="26.3260"
                onChange={(value) =>
                  set("latitude", value)
                }
              />

              <CoordinateField
                label="خط الطول (Longitude)"
                value={form.longitude}
                placeholder="43.9750"
                onChange={(value) =>
                  set("longitude", value)
                }
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                cursor: hasCoords
                  ? "pointer"
                  : "not-allowed",
                opacity: hasCoords ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={form.pickupEnabled}
                disabled={!hasCoords}
                onChange={(event) =>
                  set(
                    "pickupEnabled",
                    event.target.checked,
                  )
                }
                style={{
                  width: 17,
                  height: 17,
                  marginTop: 1,
                  accentColor:
                    t.colors.primary[800],
                  cursor: hasCoords
                    ? "pointer"
                    : "not-allowed",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize:
                    t.typography.fontSize.xs,
                  fontWeight:
                    t.typography.fontWeight.bold,
                  color: t.colors.text.dark,
                  lineHeight: 1.7,
                }}
              >
                تفعيل «الاستلام من موقعي»
                — يظهر للمشتري عند اختيار
                التحويل البنكي.
              </span>
            </label>

            {!hasCoords && (
              <p
                style={{
                  margin: 0,
                  fontSize:
                    t.typography.fontSize.xs,
                  color: t.colors.text.light,
                }}
              >
                حدّد موقع المتجر أولًا لتفعيل
                هذا الخيار.
              </p>
            )}
          </div>
        </div>

        {/* الرسائل */}
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background:
                t.colors.semantic.dangerBg,
              border:
                "1px solid rgba(220,38,38,0.12)",
              borderRight:
                `3px solid ${t.colors.semantic.danger}`,
              color:
                t.colors.semantic.danger,
              fontSize:
                t.typography.fontSize.sm,
              lineHeight: 1.7,
              fontWeight:
                t.typography.fontWeight.semibold,
            }}
          >
            <AlertTriangle
              size={17}
              strokeWidth={1.9}
              style={{
                flexShrink: 0,
                marginTop: 3,
              }}
            />

            <span>{error}</span>
          </div>
        )}

        {savedMsg && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background:
                t.colors.semantic.successBg,
              border:
                "1px solid rgba(22,163,74,0.12)",
              borderRight:
                `3px solid ${t.colors.semantic.success}`,
              color:
                t.colors.semantic.success,
              fontSize:
                t.typography.fontSize.sm,
              lineHeight: 1.7,
              fontWeight:
                t.typography.fontWeight.semibold,
            }}
          >
            <Check
              size={17}
              strokeWidth={2.2}
              style={{
                flexShrink: 0,
                marginTop: 3,
              }}
            />

            <span>{savedMsg}</span>
          </div>
        )}

        {/* الحفظ */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingTop: 3,
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="basita-btn-interactive"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 48,
              padding: "0 24px",
              background: saving
                ? t.colors.primary[600]
                : t.colors.primary[800],
              color: t.colors.white,
              border: "none",
              borderRadius: 14,
              fontFamily:
                t.typography.fontFamily.base,
              fontSize:
                t.typography.fontSize.sm,
              fontWeight:
                t.typography.fontWeight.bold,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              boxShadow:
                "0 6px 14px rgba(18,63,50,0.14)",
              opacity: saving ? 0.72 : 1,
            }}
          >
            <Save
              size={16}
              strokeWidth={1.9}
            />

            {saving
              ? "جاري حفظ التغييرات..."
              : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  dir = "ltr",
  placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  dir?: string;
  placeholder?: string;
}) {
  return (
    <label
      style={{
        display: "block",
        width: "100%",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 7,
        }}
      >
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        dir={dir}
        className="basita-dashboard-field"
        style={{
          ...inputStyle,
          direction:
            dir as "ltr" | "rtl",
          textAlign:
            dir === "ltr"
              ? "left"
              : "right",
        }}
      />
    </label>
  );
}

function CoordinateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label
      style={{
        display: "block",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 6,
          fontSize:
            t.typography.fontSize.xs,
          fontWeight:
            t.typography.fontWeight.medium,
          color: t.colors.text.mid,
        }}
      >
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        dir="ltr"
        inputMode="decimal"
        className="basita-dashboard-field"
        style={{
          ...inputStyle,
          height: 44,
          fontSize:
            t.typography.fontSize.xs,
          textAlign: "left",
        }}
      />
    </label>
  );
}

function TagField({
  label,
  items,
  onRemove,
  inputValue,
  onInputChange,
  onAdd,
  placeholder,
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
    <div>
      <span
        style={{
          display: "block",
          marginBottom: 7,
        }}
      >
        {label}
      </span>

      {items.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 9,
          }}
        >
          {items.map((item) => (
            <span
              key={item}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 30,
                padding: "0 9px",
                background:
                  t.colors.cream.warm,
                border:
                  `1px solid ${t.colors.cream.border}`,
                borderRadius:
                  t.radius.full,
                color:
                  t.colors.text.body,
                fontSize:
                  t.typography.fontSize.xs,
                fontWeight:
                  t.typography.fontWeight.medium,
              }}
            >
              {item}

              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={`حذف ${item}`}
                style={{
                  width: 20,
                  height: 20,
                  padding: 0,
                  border: "none",
                  borderRadius: "50%",
                  background:
                    "rgba(0,0,0,0.04)",
                  color:
                    t.colors.text.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X
                  size={12}
                  strokeWidth={2.2}
                />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={inputValue}
          onChange={(event) =>
            onInputChange(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="basita-dashboard-field"
          style={{
            ...inputStyle,
            direction: "rtl",
            flex: 1,
          }}
        />

        <button
          type="button"
          onClick={onAdd}
          className="basita-btn-interactive"
          style={{
            minWidth: 72,
            minHeight: 48,
            padding: "0 15px",
            borderRadius: 13,
            border:
              `1px solid ${t.colors.cream.border}`,
            background:
              t.colors.cream.warm,
            color:
              t.colors.primary[800],
            fontFamily:
              t.typography.fontFamily.base,
            fontSize:
              t.typography.fontSize.xs,
            fontWeight:
              t.typography.fontWeight.bold,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          إضافة
        </button>
      </div>
    </div>
  );
}