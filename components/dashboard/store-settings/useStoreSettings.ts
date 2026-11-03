// components/dashboard/store-settings/useStoreSettings.ts
// الحالة والمعالجات كما كانت حرفياً داخل StoreSettingsQuickEdit (نُقلت دون تغيير سلوكي).
// بيانات المتجر تُحفظ عبر PATCH /api/stores/[slug]، والمعلومات العامة عبر PATCH /api/stores/[slug]/public-info.
"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import type { EditableStoreData, SettingsForm } from "./types";

export function useStoreSettings(
  store: EditableStoreData,
  onSaved?: (saved: { nameAr: string }) => void,
) {
  const [form, setForm] = useState<SettingsForm>({
    nameAr: store.nameAr ?? "",
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
      store.returnPolicyDays != null ? String(store.returnPolicyDays) : "",
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

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || form.storyTags.includes(value) || form.storyTags.length >= 10) {
      return;
    }
    set("storyTags", [...form.storyTags, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    set("storyTags", form.storyTags.filter((item) => item !== tag));
  };

  const addPayment = () => {
    const value = paymentInput.trim();
    if (!value || form.paymentMethods.includes(value) || form.paymentMethods.length >= 8) {
      return;
    }
    set("paymentMethods", [...form.paymentMethods, value]);
    setPaymentInput("");
  };

  const removePayment = (method: string) => {
    set("paymentMethods", form.paymentMethods.filter((item) => item !== method));
  };

  // كانت useCurrentLocation داخل المكوّن؛ أُعيدت تسميتها لتفادي التباسها بخطّاف React
  const locateMe = () => {
    setLocateError("");

    if (!navigator.geolocation) {
      setLocateError("متصفحك لا يدعم تحديد الموقع.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        set("latitude", String(position.coords.latitude));
        set("longitude", String(position.coords.longitude));
        setLocating(false);
      },
      (geoError) => {
        const messages: Record<number, string> = {
          1: "لم يتم السماح للمتصفح بالوصول إلى الموقع. فعّل إذن الموقع من إعدادات المتصفح.",
          2: "تعذّر تحديد موقعك. تأكد من تفعيل خدمة الموقع على الجهاز.",
          3: "استغرق تحديد الموقع وقتًا أطول من المتوقع. حاول مرة أخرى.",
        };
        setLocateError(messages[geoError.code] ?? "تعذّر تحديد موقعك.");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  const hasCoords = form.latitude.trim() !== "" && form.longitude.trim() !== "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedMsg("");

    if (form.pickupEnabled && !hasCoords) {
      setError("حدّد موقع المتجر أولًا قبل تفعيل الاستلام من الموقع.");
      setSaving(false);
      return;
    }

    // تغيير سلوكي: اسم المتجر مطلوب (حرفان على الأقل، كما في createStoreSchema)
    if (form.nameAr.trim().length < 2) {
      setError("اسم المتجر مطلوب (حرفان على الأقل).");
      setSaving(false);
      return;
    }

    try {
      await Promise.all([
        api.patch(`/api/stores/${store.slug}`, {
          nameAr: form.nameAr.trim(),
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
          returnPolicyDays:
            form.returnPolicyDays !== "" ? Number(form.returnPolicyDays) : undefined,
        }),
      ]);
      setSavedMsg("تم حفظ التغييرات بنجاح، وستظهر على صفحة متجرك مباشرة.");
      onSaved?.({ nameAr: form.nameAr.trim() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ التغييرات.");
    } finally {
      setSaving(false);
    }
  };

  return {
    form, set, locating, locateError, tagInput, setTagInput, paymentInput,
    setPaymentInput, saving, savedMsg, error, addTag, removeTag, addPayment,
    removePayment, locateMe, hasCoords, handleSave,
  };
}

export type StoreSettingsCtx = ReturnType<typeof useStoreSettings>;
