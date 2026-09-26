// lib/pdf/shipping-label.tsx
// بوليصة شحن بسطة — مقاس 10×15 سم (4×6 إنش)، RTL، IBM Plex Sans Arabic.
// كل نص عربي يمر عبر <ArabicText> لتفادي خلل التشوّه الموثَّق (راجع arabic-text.tsx).
import React from "react";
import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";
import path from "path";
import { ArabicText } from "./arabic-text";

let fontsRegistered = false;
export function registerLabelFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "IBMPlexSansArabic",
    fonts: [
      { src: path.join(process.cwd(), "public/fonts/IBMPlexSansArabic-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(process.cwd(), "public/fonts/IBMPlexSansArabic-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  // كلمة عربية واحدة ألف حرف = بلا فواصل تهجئة تكسر التشكيل
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const COLORS = { forest: "#1B4D3E", gold: "#C9973A", cream: "#F5EFE0", text: "#1A1A1A", mid: "#666666" };

const styles = StyleSheet.create({
  page: { fontFamily: "IBMPlexSansArabic", padding: 13, fontSize: 9.5, color: COLORS.text },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 18, fontWeight: "bold", color: COLORS.forest },
  storeLine: { fontSize: 9, color: COLORS.mid, marginTop: 2 },
  box: { border: `1pt solid ${COLORS.forest}`, borderRadius: 4, padding: 8, marginTop: 6 },
  fieldLabel: { fontSize: 8, color: COLORS.mid, marginBottom: 2 },
  fieldValueBold: { fontSize: 12, fontWeight: "bold" },
  fieldValue: { fontSize: 10 },
  fieldGap: { marginTop: 4 },
  codBox: { backgroundColor: COLORS.gold, borderRadius: 4, padding: 8, marginTop: 6 },
  codLabel: { fontSize: 9, color: "#3a2c0f" },
  codValue: { fontSize: 12.5, fontWeight: "bold", marginTop: 3, color: "#241b09" },
  paidBox: { backgroundColor: COLORS.cream, borderRadius: 4, padding: 8, marginTop: 6, alignItems: "center" },
  paidText: { fontSize: 12, fontWeight: "bold", color: COLORS.forest },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, fontSize: 8.5, color: COLORS.mid },
  itemsLabel: { fontSize: 7.5, color: COLORS.mid, marginTop: 6, marginBottom: 2 },
  chipsRow: { flexDirection: "row-reverse", flexWrap: "wrap" },
  // ⚠️ خلفية/حدود القطعة على <View> المُحيط لا على النص نفسه — ArabicText يقسّم
  // النص إلى كلمات منفصلة (راجع arabic-text.tsx)، فوضع خلفية على كل كلمة
  // كان يُنتج عدة فقاعات صغيرة بدل فقاعة واحدة حول العبارة كاملة
  chip: { backgroundColor: COLORS.cream, borderRadius: 9, paddingVertical: 2, paddingHorizontal: 6, marginLeft: 4, marginBottom: 3 },
  chipText: { fontSize: 8 },
  senderBox: { marginTop: 6, borderTop: "1pt dashed #bbb", paddingTop: 5 },
});

export interface ShippingLabelItem {
  nameAr: string;
  quantity: number;
  variantLabel: string | null; // مثل "المقاس: M" — فاضي إن لم يكن للمنتج متغيرات
}

export interface ShippingLabelData {
  orderNumber: string;
  createdAt: string; // نص جاهز مثل 2026-09-24
  storeName: string;
  storeCity: string | null;
  storeWhatsapp: string | null;
  recipientName: string;
  recipientPhone: string;
  city: string; // كما أدخلها المشتري بالضبط — لا علاقة له بأسماء مدن المناديب
  address: string;
  isCod: boolean;
  codAmount: number | null;
  qrDataUrl: string;
  items: ShippingLabelItem[];
}

export function ShippingLabelDocument({ data }: { data: ShippingLabelData }) {
  registerLabelFonts();
  return (
    <Document>
      <Page size={[283.5, 425.2]} style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={data.qrDataUrl} style={{ width: 52, height: 52 }} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.brand}>بسطة</Text>
            <ArabicText style={styles.storeLine}>
              {data.storeCity ? `${data.storeName} — ${data.storeCity}` : data.storeName}
            </ArabicText>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.fieldLabel}>المستلم</Text>
          <ArabicText style={styles.fieldValueBold}>{data.recipientName}</ArabicText>

          <View style={styles.fieldGap}>
            <Text style={styles.fieldLabel}>الجوال</Text>
            <Text style={styles.fieldValueBold}>{data.recipientPhone}</Text>
          </View>

          <View style={styles.fieldGap}>
            <Text style={styles.fieldLabel}>المدينة</Text>
            {/* ⚠️ نعرض المدينة كما أدخلها المشتري بالضبط، بلا أي مطابقة مع
                أسماء مدن المناديب — إملاء مختلف بين الاثنين لا يغيّر ما يظهر هنا */}
            <ArabicText style={styles.fieldValueBold}>{data.city}</ArabicText>
          </View>

          <View style={styles.fieldGap}>
            <Text style={styles.fieldLabel}>العنوان</Text>
            <ArabicText style={styles.fieldValue}>{data.address}</ArabicText>
          </View>
        </View>

        {data.isCod ? (
          <View style={styles.codBox}>
            <ArabicText style={styles.codLabel}>الدفع عند الاستلام</ArabicText>
            <ArabicText style={styles.codValue}>
              {`المبلغ المطلوب تحصيله ${data.codAmount ?? 0} ر.س`}
            </ArabicText>
          </View>
        ) : (
          <View style={styles.paidBox}>
            <ArabicText style={styles.paidText}>مدفوع — لا يوجد تحصيل</ArabicText>
          </View>
        )}

        <View style={styles.metaRow}>
          <Text>{data.orderNumber}</Text>
          <Text>{data.createdAt}</Text>
        </View>

        {data.items.length > 0 && (
          <>
            <Text style={styles.itemsLabel}>محتوى الطرد</Text>
            <View style={styles.chipsRow}>
              {data.items.map((it, i) => (
                <View key={i} style={styles.chip}>
                  <ArabicText style={styles.chipText}>
                    {`${it.nameAr}${it.variantLabel ? ` (${it.variantLabel})` : ""} ×${it.quantity}`}
                  </ArabicText>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.senderBox}>
          <Text style={styles.fieldLabel}>المرسل</Text>
          <ArabicText style={styles.fieldValue}>
            {data.storeWhatsapp ? `${data.storeName} — ${data.storeWhatsapp}` : data.storeName}
          </ArabicText>
        </View>
      </Page>
    </Document>
  );
}
