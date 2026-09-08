// lib/shipping/providers/aramex.ts
//
// ⚠️ ملاحظة أمانة فنية (لم تتغيّر منذ الجلسة السابقة): بُني تكامل getRate
// أدناه بدون اتصال إنترنت يسمح بمراجعة توثيق Aramex الحالي وقت الكتابة.
// البنية (ClientInfo block بخمسة حقول حساب، استدعاء RateCalculator) تطابق
// نمط تكامل Aramex المعروف تاريخياً ومؤكَّدة جزئياً عبر صفحة المطوّرين
// الرسمية (aramex.com/developers-solution-center) — لكن الـendpoint الدقيق
// الحالي غير مؤكَّد (يتطلب وصول WSDL محمي بتسجيل دخول). لا تربطي مفتاحاً
// حقيقياً بالإنتاج قبل تأكيد هذا مباشرة من فريق Aramex/EDI.
//
// ⚠️ إضافي (مرحلة Shipping Backend): createShipment/getTracking/
// cancelShipment/getLabel — Aramex توفّرها رسمياً (Shipping Services API +
// Tracking API + Location API) لكن شكل الطلب/الاستجابة الدقيق غير مؤكَّد
// بنفس القيد أعلاه، فتُرمى ShippingProviderError("not_supported") صراحة
// بدل تخمين payload وهمي.

import {
  ShippingProvider, RateRequest, RateResult, ShippingProviderError,
  ShipmentRequest, ShipmentResult, TrackingResult,
} from "../types";
import { SHIPPING_FETCH_TIMEOUT_MS } from "../reliability";

const ARAMEX_RATE_ENDPOINT =
  "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate";

export class AramexProvider implements ShippingProvider {
  readonly carrier = "ARAMEX";
  readonly requiredCredentialFields = [
    "accountNumber",
    "accountPin",
    "accountEntity",
    "accountCountryCode",
    "username",
    "password",
  ];

  async getRate(credentials: Record<string, string>, request: RateRequest): Promise<RateResult> {
    this.assertCredentials(credentials);

    const body = {
      ClientInfo: {
        AccountNumber: credentials.accountNumber,
        AccountPin: credentials.accountPin,
        AccountEntity: credentials.accountEntity,
        AccountCountryCode: credentials.accountCountryCode,
        UserName: credentials.username,
        Password: credentials.password,
        Version: "v1.0",
      },
      OriginAddress: { City: request.originCity, CountryCode: "SA" },
      DestinationAddress: { City: request.destCity, CountryCode: "SA" },
      ShipmentDetails: {
        PaymentType: "P",
        ProductGroup: "DOM",
        ProductType: "ONP",
        ActualWeight: { Unit: "KG", Value: request.weightKg },
      },
    };

    let res: Response;
    try {
      res = await fetch(ARAMEX_RATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(SHIPPING_FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new ShippingProviderError("انتهت مهلة الاتصال بخدمة أرامكس", "ARAMEX", "timeout");
      }
      throw new ShippingProviderError("تعذّر الاتصال بخدمة أرامكس", "ARAMEX", "network");
    }

    if (!res.ok) {
      const reason = res.status === 401 || res.status === 403 ? "auth" : "unavailable";
      throw new ShippingProviderError(`فشل طلب تسعير أرامكس (رمز ${res.status})`, "ARAMEX", reason);
    }

    const data = await res.json().catch(() => null);
    if (data?.HasErrors) {
      const msg = data?.Notifications?.[0]?.Message ?? "خطأ غير معروف من أرامكس";
      throw new ShippingProviderError(msg, "ARAMEX", "invalid_request");
    }

    const rateValue = data?.TotalAmount?.Value;
    if (typeof rateValue !== "number") {
      throw new ShippingProviderError("استجابة أرامكس لا تحتوي سعراً صالحاً", "ARAMEX", "unknown");
    }

    return {
      carrierRate: rateValue,
      currency: data?.TotalAmount?.CurrencyCode ?? "SAR",
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
    throw new ShippingProviderError(
      "إنشاء الشحنة عبر أرامكس غير مفعّل بعد — شكل Shipping Services API الرسمي غير مؤكَّد بكودنا حتى الآن",
      "ARAMEX",
      "not_supported"
    );
  }

  async getTracking(_credentials: Record<string, string>, _externalShipmentId: string): Promise<TrackingResult> {
    throw new ShippingProviderError(
      "تتبّع الشحنة عبر أرامكس غير مفعّل بعد — بانتظار تأكيد Tracking API الرسمي",
      "ARAMEX",
      "not_supported"
    );
  }

  async cancelShipment(_credentials: Record<string, string>, _externalShipmentId: string): Promise<void> {
    throw new ShippingProviderError("إلغاء الشحنة عبر أرامكس غير مفعّل بعد", "ARAMEX", "not_supported");
  }

  async getLabel(_credentials: Record<string, string>, _externalShipmentId: string): Promise<string> {
    throw new ShippingProviderError("جلب ملصق الشحن عبر أرامكس غير مفعّل بعد", "ARAMEX", "not_supported");
  }

  private assertCredentials(credentials: Record<string, string>) {
    for (const field of this.requiredCredentialFields) {
      if (!credentials[field]) {
        throw new ShippingProviderError(`بيانات اعتماد أرامكس ناقصة: ${field}`, "ARAMEX", "invalid_request");
      }
    }
  }
}
