// components/dashboard/LocationPicker.tsx
// خريطة تفاعلية لتحديد موقع المتجر — بديل اختياري للحقلين الرقميين
// اليدويين. يحتاج NEXT_PUBLIC_MAPBOX_TOKEN (راجع .env.example)؛ بدونه
// يعرض رسالة توضيحية بدل ما ينهار، ويبقى الإدخال اليدوي شغّالاً كاملاً.
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { t } from "@/theme";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// مركز افتراضي (الرياض) لو ما فيه موقع محفوظ بعد
const DEFAULT_CENTER: [number, number] = [46.6753, 24.7136];

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState("");

  // تهيئة الخريطة مرة وحدة فقط
  useEffect(() => {
    if (!MAPBOX_TOKEN) return; // بدون توكن — نعرض رسالة بدل الخريطة (الشرط بالـJSX تحت)
    if (!containerRef.current || mapRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const startCenter: [number, number] =
        latitude != null && longitude != null ? [longitude, latitude] : DEFAULT_CENTER;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: startCenter,
        zoom: latitude != null ? 14 : 5,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      const marker = new mapboxgl.Marker({ draggable: true, color: t.colors.primary[800] })
        .setLngLat(startCenter)
        .addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        onChange(lat, lng);
      });

      // نقرة على أي مكان بالخريطة تنقل العلامة له مباشرة — أسهل من السحب الدقيق
      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        onChange(e.lngLat.lat, e.lngLat.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } catch (err) {
      console.error("[LocationPicker]", err);
      setMapError("تعذّر تحميل الخريطة — تأكدي من صحة التوكن");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // مزامنة العلامة لو التاجر عدّل الإحداثيات يدوياً بالحقول الرقمية
  // (أو ضغط "استخدمي موقعي الحالي") — بدون إعادة إنشاء الخريطة كاملة
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (latitude == null || longitude == null) return;
    markerRef.current.setLngLat([longitude, latitude]);
    mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
  }, [latitude, longitude]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          height: 220, borderRadius: t.radius.md, border: `1px dashed ${t.colors.cream.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          background: t.colors.cream.bg, color: t.colors.text.light, fontSize: t.typography.fontSize.xs, textAlign: "center", padding: t.spacing["4"],
          direction: "rtl",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: t.radius.full, background: t.colors.white, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${t.colors.cream.border}` }}>
          <MapPin size={18} strokeWidth={1.8} color={t.colors.primary[800]} />
        </div>
        <span>الخريطة التفاعلية غير مفعّلة — استخدمي الحقول أو الزر بالأسفل لتحديد موقعك يدوياً</span>
      </div>
    );
  }

  if (mapError) {
    return (
      <div style={{ padding: t.spacing["3"], borderRadius: t.radius.md, background: t.colors.semantic.dangerBg, color: t.colors.semantic.danger, fontSize: t.typography.fontSize.xs, direction: "rtl", textAlign: "right" }}>
        {mapError}
      </div>
    );
  }

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <div ref={containerRef} style={{ height: 220, borderRadius: t.radius.md, overflow: "hidden", border: `1px solid ${t.colors.cream.border}`, boxShadow: t.shadows.sm }} />
      <p style={{ margin: "6px 0 0", fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium }}>
        اضغطي على أي مكان بالخريطة أو اسحبي العلامة لتحديد موقعك بدقة
      </p>
    </div>
  );
}