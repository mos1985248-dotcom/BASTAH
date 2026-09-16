// lib/shipping/providers/generic.ts
//
// ⚠️ يختلف جوهرياً عن aramex.ts/spl.ts: هذولا يطبّقان عقد شركة شحن حقيقية
// خارجية (شكل طلب/رد مفروض علينا). هذا الملف يغطي حالتين لشركات "بدون
// كود" يضيفها الأدمن من اللوحة (ShippingProviderConfig):
//
// 1) REST — الشركة عندها API فعلي (حتى لو بسيط) بنفس عقدنا نحن:
//    POST {baseUrl}{ratePath}
//    Headers: Authorization: Bearer {apiKey}
//    Body:    { originCity, destCity, weightKg }
//    Response 200: { rate: number, currency?: string, estimatedDays?: number }
//
// 2) MANUAL — شركة بدون أي نظام تقني إطلاقاً (مندوب/مكتب شحن صغير).
//    سعر ثابت يدخله الأدمن يدوياً (flatFee + perKgFee)، صفر اتصال شبكي.
//
// أي الحالتين تُستخدم يُحدَّد بمحتوى credentials: وجود baseUrl → REST،
// وإلا → MANUAL (يُبنى الفرق فعلياً بـresolveStoreShipping بـservice.ts
// حسب ShippingProviderConfig.providerType).

import {
  ShippingProvider, RateRequest, RateResult, ShippingProviderError,
  ShipmentRequest, ShipmentResult, TrackingResult,
} from "../types";
import { SHIPPING_FETCH_TIMEOUT_MS } from "../reliability";

export class GenericRestProvider implements ShippingProvider {
  readonly carrier = "CUSTOM";
  readonly requiredCredentialFields: string[] = []; // يختلف حسب REST/MANUAL — يُتحقَّق داخلياً بكل مسار

  async getRate(credentials: Record<string, string>, request: RateRequest): Promise<RateResult> {
    return credentials.baseUrl
      ? this.getRateRest(credentials, request)
      : this.getRateManual(credentials, request);
  }

  // ── MANUAL: حساب محلي بحت، صفر اتصال شبكي ──
  private getRateManual(credentials: Record<string, string>, request: RateRequest): RateResult {
    const flatFee = Number(credentials.flatFee);
    const perKgFee = Number(credentials.perKgFee);
    if (!Number.isFinite(flatFee) || !Number.isFinite(perKgFee)) {
      throw new ShippingProviderError("إعدادات شركة الشحن اليدوية ناقصة (flatFee/perKgFee)", "CUSTOM", "invalid_request");
    }
    return {
      carrierRate: Math.round((flatFee + request.weightKg * perKgFee) * 100) / 100,
      currency: "SAR",
      estimatedDays: undefined, // غير معروف بدون نظام فعلي يقدّره
    };
  }

  // ── REST: اتصال HTTP حقيقي بنظام الشركة ──
  private async getRateRest(credentials: Record<string, string>, request: RateRequest): Promise<RateResult> {
    this.assertRestCredentials(credentials);
    const url = `${credentials.baseUrl.replace(/\/$/, "")}${credentials.ratePath}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.apiKey}`,
        },
        body: JSON.stringify({
          originCity: request.originCity,
          destCity: request.destCity,
          weightKg: request.weightKg,
        }),
        signal: AbortSignal.timeout(SHIPPING_FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new ShippingProviderError("انتهت مهلة الاتصال بخدمة الشحن", "CUSTOM", "timeout");
      }
      throw new ShippingProviderError("تعذّر الاتصال بخدمة الشحن — تأكدي من رابط الـAPI", "CUSTOM", "network");
    }

    if (!res.ok) {
      const reason = res.status === 401 || res.status === 403 ? "auth" : "unavailable";
      throw new ShippingProviderError(`فشل طلب التسعير (رمز ${res.status})`, "CUSTOM", reason);
    }

    const data = await res.json().catch(() => null);
    if (typeof data?.rate !== "number") {
      throw new ShippingProviderError(
        "استجابة الشركة لا تطابق العقد المتوقَّع — لازم ترجع { rate: number }",
        "CUSTOM",
        "unknown"
      );
    }

    return {
      carrierRate: data.rate,
      currency: data.currency ?? "SAR",
      estimatedDays: typeof data.estimatedDays === "number" ? data.estimatedDays : undefined,
    };
  }

  async testCredentials(credentials: Record<string, string>): Promise<boolean> {
    try {
      await this.getRate(credentials, { originCity: "الرياض", destCity: "جدة", weightKg: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async createShipment(_credentials: Record<string, string>, _request: ShipmentRequest): Promise<ShipmentResult> {
    throw new ShippingProviderError("إنشاء الشحنة غير مفعّل لشركات الشحن العامة بعد", "CUSTOM", "not_supported");
  }

  async getTracking(_credentials: Record<string, string>, _externalShipmentId: string): Promise<TrackingResult> {
    throw new ShippingProviderError("تتبّع الشحنة غير مفعّل لشركات الشحن العامة بعد", "CUSTOM", "not_supported");
  }

  async cancelShipment(_credentials: Record<string, string>, _externalShipmentId: string): Promise<void> {
    throw new ShippingProviderError("إلغاء الشحنة غير مفعّل لشركات الشحن العامة بعد", "CUSTOM", "not_supported");
  }

  async getLabel(_credentials: Record<string, string>, _externalShipmentId: string): Promise<string> {
    throw new ShippingProviderError("جلب ملصق الشحن غير مفعّل لشركات الشحن العامة بعد", "CUSTOM", "not_supported");
  }

  private assertRestCredentials(credentials: Record<string, string>) {
    for (const field of ["baseUrl", "ratePath", "apiKey"]) {
      if (!credentials[field]) {
        throw new ShippingProviderError(`إعدادات شركة الشحن ناقصة: ${field}`, "CUSTOM", "invalid_request");
      }
    }
  }
}