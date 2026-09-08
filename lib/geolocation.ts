// lib/geolocation.ts
// نقطة الدخول الوحيدة لحساب المسافة الجغرافية بالمشروع — بدل تكرار
// معادلة Haversine بأكثر من مكان. حساب رياضي بحت، بدون أي API خارجي
// (Google Maps / Mapbox)، فلا يحتاج مفتاح ولا اتصال شبكة.
//
// TODO: يحتاج مفتاح API فعلي عند التفعيل — لو احتجنا لاحقاً Geocoding
// حقيقي (تحويل عنوان نصي لإحداثيات)، أو خرائط تفاعلية بالفرونت.
// بهذه المرحلة: التاجر يدخل latitude/longitude مباشرة (يدوياً أو عبر
// خريطة تستخدم أي مزود لاحقاً)، ونحن فقط نحسب المسافة بينها وبين الزائر.

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * يحسب المسافة بالكيلومتر بين نقطتين (خط عرض/طول) بمعادلة Haversine.
 * دقّة كافية لعرض "أقرب متجر" — ليست بديلاً عن مسافة طريق فعلية.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/** فحص صحة إحداثيات قبل استخدامها — يمنع أرقام خارج المدى الجغرافي الصالح */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * صندوق تقريبي (bounding box) حول نقطة بمدى معيّن بالكيلومتر — يُستخدم
 * كفلترة أولية بقاعدة البيانات (WHERE) قبل حساب Haversine الدقيق على
 * نتيجة أصغر، بدل تحميل كل المتاجر بالذاكرة في كل استعلام.
 * تقريب مقبول (يفترض الأرض كرة)، وليس حداً نهائياً — نطبّق بعده
 * calculateDistance() للفلترة الدقيقة والترتيب.
 */
export function boundingBox(lat: number, lon: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // كل درجة خط عرض ≈ 111 كم تقريباً
  const lonDelta = radiusKm / (111 * Math.cos(toRadians(lat)) || 1);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}
