// components/dashboard/LocationPicker.tsx
// خريطة تفاعلية لتحديد موقع المتجر.
// تحتاج NEXT_PUBLIC_MAPBOX_TOKEN؛ وفي حال عدم وجوده
// يبقى الإدخال اليدوي متاحًا بالكامل دون انهيار الصفحة.

"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Map, AlertTriangle } from "lucide-react";
import { t } from "@/theme";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// مركز افتراضي عند عدم وجود موقع محفوظ.
const DEFAULT_CENTER: [number, number] = [
  46.6753,
  24.7136,
];

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [mapError, setMapError] = useState("");

  /*
   * تهيئة الخريطة مرة واحدة.
   */
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (!containerRef.current || mapRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const startCenter: [number, number] =
        latitude != null && longitude != null
          ? [longitude, latitude]
          : DEFAULT_CENTER;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: startCenter,
        zoom: latitude != null ? 14 : 5,
      });

      map.addControl(
        new mapboxgl.NavigationControl(),
        "top-right",
      );

      const marker = new mapboxgl.Marker({
        draggable: true,
        color: t.colors.primary[800],
      })
        .setLngLat(startCenter)
        .addTo(map);

      /*
       * عند تحريك العلامة.
       */
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();

        onChange(lat, lng);
      });

      /*
       * النقر على الخريطة ينقل العلامة مباشرة.
       */
      map.on("click", (event) => {
        marker.setLngLat(event.lngLat);

        onChange(
          event.lngLat.lat,
          event.lngLat.lng,
        );
      });

      mapRef.current = map;
      markerRef.current = marker;
    } catch (error) {
      console.error("[LocationPicker]", error);

      setMapError(
        "تعذّر تحميل الخريطة. تحقّق من إعدادات الخريطة ثم أعد المحاولة.",
      );
    }

    return () => {
      mapRef.current?.remove();

      mapRef.current = null;
      markerRef.current = null;
    };

    // التهيئة مطلوبة مرة واحدة فقط.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * مزامنة العلامة مع الإحداثيات التي قد تتغير
   * من الحقول اليدوية أو أي مصدر آخر.
   */
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    if (latitude == null || longitude == null) return;

    markerRef.current.setLngLat([
      longitude,
      latitude,
    ]);

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 14,
    });
  }, [latitude, longitude]);

  /*
   * في حال عدم وجود Mapbox token.
   */
  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          minHeight: 220,
          padding: t.spacing["5"],
          borderRadius: 16,
          border: `1px dashed ${t.colors.cream.border}`,
          background: t.colors.cream.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: t.colors.text.mid,
          fontSize: t.typography.fontSize.sm,
          lineHeight: t.typography.lineHeight.relaxed,
          textAlign: "center",
          direction: "rtl",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(67,48,29,0.04)",
          }}
        >
          <MapPin
            size={22}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: t.typography.fontFamily.heading,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
          }}
        >
          <Map size={16} strokeWidth={1.8} />
          الخريطة التفاعلية غير مفعّلة
        </div>

        <span
          style={{
            maxWidth: 440,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          يمكنك تحديد الموقع باستخدام حقول الإحداثيات
          اليدوية أو الخيار المتاح أسفل هذا القسم.
        </span>
      </div>
    );
  }

  /*
   * خطأ تحميل الخريطة.
   */
  if (mapError) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
          padding: t.spacing["4"],
          borderRadius: 13,
          background: t.colors.semantic.dangerBg,
          border: "1px solid rgba(220,38,38,0.12)",
          borderRight: `3px solid ${t.colors.semantic.danger}`,
          color: t.colors.semantic.danger,
          fontSize: t.typography.fontSize.sm,
          lineHeight: t.typography.lineHeight.relaxed,
          direction: "rtl",
          textAlign: "right",
        }}
      >
        <AlertTriangle
          size={18}
          strokeWidth={1.9}
          style={{
            flexShrink: 0,
            marginTop: 2,
          }}
        />

        <span>{mapError}</span>
      </div>
    );
  }

  /*
   * الخريطة.
   */
  return (
    <div
      style={{
        width: "100%",
        direction: "rtl",
        textAlign: "right",
      }}
    >
      <div
        ref={containerRef}
        className="basita-location-map"
        style={{
          height: 280,
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: "0 6px 18px rgba(67,48,29,0.06)",
          background: t.colors.cream.warm,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 8,
          color: t.colors.text.mid,
          fontSize: t.typography.fontSize.xs,
          lineHeight: t.typography.lineHeight.relaxed,
        }}
      >
        <MapPin
          size={14}
          strokeWidth={1.8}
          color={t.colors.gold[600]}
        />

        <span>
          انقر على الموقع المطلوب في الخريطة أو اسحب العلامة
          لتحديد موقع المتجر بدقة.
        </span>
      </div>
    </div>
  );
}