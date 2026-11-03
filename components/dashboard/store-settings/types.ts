// components/dashboard/store-settings/types.ts
// أنواع إعدادات المتجر السريعة (النوع العام يُعاد تصديره من StoreSettingsQuickEdit).
export interface EditableStoreData {
  slug: string;
  nameAr: string;
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

export interface SettingsForm {
  nameAr: string;
  logo: string;
  coverImage: string;
  whatsapp: string;
  city: string;
  storyAr: string;
  videoUrl: string;
  storyTags: string[];
  workingHours: string;
  licenseNumber: string;
  deliveryPartner: string;
  paymentMethods: string[];
  returnPolicyDays: string;
  latitude: string;
  longitude: string;
  pickupEnabled: boolean;
}
