// app/api/stores/nearby/route.ts
// GET /api/stores/nearby?lat=&lng=&radius_km=&limit=
//
// عام (لا يحتاج تسجيل دخول) — نفس نمط GET /api/stores.
// يرجع المتاجر مرتبة حسب الأقرب فعلياً (Haversine)، مع distance_km
// محسوب حقيقي. لا نرجّع latitude/longitude الخام — فقط المسافة والمدينة/
// الحي (خصوصية التاجر، راجع تعليق Store.latitude بالـschema).
//
// ⚠️ لا يوجد PostGIS بهذا المشروع، فالفلترة الدقيقة بالمسافة تتم بكود
// التطبيق بعد فلترة أولية بـbounding box على مستوى قاعدة البيانات (WHERE)
// لتقليل عدد الصفوف المحمَّلة بالذاكرة — مقبول لحجم المتاجر الحالي.
// لو كبر عدد المتاجر بشكل كبير مستقبلاً، الخطوة التالية PostGIS/earthdistance.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nearbyStoresQuerySchema, formatZodError } from "@/lib/validation";
import { calculateDistance, boundingBox } from "@/lib/geolocation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = nearbyStoresQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  const { lat, lng, radius_km, limit } = parsed.data;

  try {
    const box = boundingBox(lat, lng, radius_km);

    // فلترة أولية بصندوق تقريبي بالـDB — يستبعد المتاجر بدون إحداثيات
    // تلقائياً (latitude/longitude كلاهما NOT NULL بالشرط أدناه)
    const candidates = await prisma.store.findMany({
      where: {
        status: "ACTIVE",
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLon, lte: box.maxLon },
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        logo: true,
        shortDesc: true,
        city: true,
        region: true,
        isVerified: true,
        avgRating: true,
        totalReviews: true,
        latitude: true,
        longitude: true,
        pickupEnabled: true,
        subscription: { select: { bankTransferEnabled: true } },
      },
      // حد أعلى معقول على عدد المرشّحين قبل الحساب الدقيق — يحمي من
      // تحميل آلاف الصفوف بالذاكرة لو كان نطاق البحث كبير جداً
      take: 500,
    });

    const withDistance = candidates
      .map((store) => ({
        ...store,
        distance_km:
          store.latitude != null && store.longitude != null
            ? calculateDistance(lat, lng, store.latitude, store.longitude)
            : null,
      }))
      // استبعاد أي متجر بدون إحداثيات صالحة، وأي متجر خارج نصف القطر
      // الفعلي (bounding box تقريبي فقط، يحتاج فلترة دقيقة بعده)
      .filter(
        (store): store is typeof store & { distance_km: number } =>
          store.distance_km !== null && store.distance_km <= radius_km
      )
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit)
      // لا نرجّع الإحداثيات الخام بالاستجابة — خصوصية موقع التاجر.
      // نسطّح bankTransferEnabled من subscription المتداخلة لشكل أنظف.
      .map(({ latitude, longitude, subscription, ...rest }) => ({
        ...rest,
        distance_km: Math.round(rest.distance_km * 10) / 10, // خانة عشرية واحدة
        bankTransferEnabled: subscription?.bankTransferEnabled ?? false,
      }));

    return NextResponse.json({ stores: withDistance });
  } catch (err) {
    console.error("[GET /api/stores/nearby]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب أقرب المتاجر" }, { status: 500 });
  }
}
