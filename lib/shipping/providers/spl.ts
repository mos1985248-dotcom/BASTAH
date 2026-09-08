// lib/shipping/providers/spl.ts
//
// ⚠️ تحديث بعد Shipping Audit + تحقّق رسمي: تأكَّد وجود "SPL APIs" حقيقية
// عبر بوابة شركاء رسمية (wiki.partners.splonline.com.sa) — مصادقة Bearer
// token (مطابقة لبنيتنا)، لكنها تتطلب طبقة تفويض ثانية إلزامية: "customer
// code + branch code"، وبيانات الاعتماد تُقدَّم مباشرة من فريق SPL عند بدء
// التكامل التجاري (partner-gated، ليست self-serve). أضفنا branchCode
// لحقول الاعتماد المطلوبة لأن التقرير أكّد أنه مطلوب رسمياً — لكن الـ
// endpoint وشكل الطلب/الاستجابة الدقيقين **لا يزالان غير مؤكَّدين** بدون
// وصول شريك فعلي. لا تربطي مفاتيح حقيقية بهذا الكود قبل الحصول على بيانات
// التكامل الرسمية من SPL مباشرة.

import {
  ShippingProvider, RateRequest, RateResult, ShippingProviderError,
  ShipmentRequest, ShipmentResult, TrackingResult,
} from "../types";
import { SHIPPING_FETCH_TIMEOUT_MS } from "../reliability";

const SPL_RATE_ENDPOINT = "https://api.splonline.com.sa/v1/shipping/rates"; // غير مؤكَّد — placeholder بنيوي

export class SplProvider implements ShippingProvider {
  readonly carrier = "SPL";
  // ⚠️ branchCode أضيف بعد تأكيد التقرير أن SPL يطلبه رسمياً (customer code + branch code)
  readonly requiredCredentialFields = ["apiKey", "accountId", "branchCode"];

  async getRate(credentials: Record<string, string>, request: RateRequest): Promise<RateResult> {
    this.assertCredentials(credentials);

    let res: Response;
    try {
      res = await fetch(SPL_RATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.apiKey}`,
        },
        body: JSON.stringify({
          accountId: credentials.accountId,
          branchCode: credentials.branchCode,
          originCity: request.originCity,
          destinationCity: request.destCity,
          weightKg: request.weightKg,
        }),
        signal: AbortSignal.timeout(SHIPPING_FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new ShippingProviderError("انتهت مهلة الاتصال بخدمة البريد السعودي", "SPL", "timeout");
      }
      throw new ShippingProviderError("تعذّر الاتصال بخدمة البريد السعودي", "SPL", "network");
    }

    if (!res.ok) {
      const reason = res.status === 401 || res.status === 403 ? "auth" : "unavailable";
      throw new ShippingProviderError(`فشل طلب تسعير البريد السعودي (رمز ${res.status})`, "SPL", reason);
    }

    const data = await res.json().catch(() => null);
    const rateValue = data?.rate ?? data?.price;
    if (typeof rateValue !== "number") {
      throw new ShippingProviderError("استجابة البريد السعودي لا تحتوي سعراً صالحاً", "SPL", "unknown");
    }

    return {
      carrierRate: rateValue,
      currency: data?.currency ?? "SAR",
      estimatedDays: typeof data?.estimatedDays === "number" ? data.estimatedDays : undefined,
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
      "إنشاء الشحنة عبر البريد السعودي غير مفعّل بعد — بانتظار بيانات تكامل رسمية من فريق SPL",
      "SPL",
      "not_supported"
    );
  }

  async getTracking(_credentials: Record<string, string>, _externalShipmentId: string): Promise<TrackingResult> {
    throw new ShippingProviderError("تتبّع الشحنة عبر البريد السعودي غير مفعّل بعد", "SPL", "not_supported");
  }

  async cancelShipment(_credentials: Record<string, string>, _externalShipmentId: string): Promise<void> {
    throw new ShippingProviderError("إلغاء الشحنة عبر البريد السعودي غير مفعّل بعد", "SPL", "not_supported");
  }

  async getLabel(_credentials: Record<string, string>, _externalShipmentId: string): Promise<string> {
    throw new ShippingProviderError("جلب ملصق الشحن عبر البريد السعودي غير مفعّل بعد", "SPL", "not_supported");
  }

  private assertCredentials(credentials: Record<string, string>) {
    for (const field of this.requiredCredentialFields) {
      if (!credentials[field]) {
        throw new ShippingProviderError(`بيانات اعتماد البريد السعودي ناقصة: ${field}`, "SPL", "invalid_request");
      }
    }
  }
}
