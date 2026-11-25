import type { Prisma } from "@prisma/client";
import { resolveFeature } from "./entitlements";
import { computeVat } from "./tax";
import { fromMinor, toMinor } from "./finance/money";

export class CouponError extends Error {
  constructor(message: string, public status = 422) {
    super(message);
  }
}

export async function checkoutCoupon(
  db: Prisma.TransactionClient, storeId: string, code: string | undefined, subtotal: number, redeem = false,
) {
  if (!code) return { couponCode: null, discountAmount: 0 };
  if (!(await resolveFeature(db, storeId, "coupons")).allowed) {
    throw new CouponError("كوبونات الخصم غير متاحة لهذا المتجر.");
  }

  const now = new Date();
  const coupon = await db.coupon.findUnique({ where: { storeId_code: { storeId, code } } });
  if (!coupon?.isActive || (coupon.expiresAt && coupon.expiresAt <= now)) {
    throw new CouponError("كود الخصم غير صالح أو منتهي.");
  }
  const { id, minOrderAmt, maxUses, expiresAt, discountType, discountValue } = coupon;
  const subtotalMinor = toMinor(subtotal) ?? 0;
  if (subtotalMinor < (toMinor(minOrderAmt) ?? 0)) {
    throw new CouponError(`الحد الأدنى لاستخدام هذا الكوبون ${minOrderAmt} ر.س.`);
  }
  if (maxUses !== null && coupon.usedCount >= maxUses) {
    throw new CouponError("بلغ الكوبون الحد الأقصى للاستخدام.");
  }
  const discountMinor = discountType === "percentage" && discountValue <= 100
    ? Math.round(subtotalMinor * discountValue / 100)
    : discountType === "fixed" ? toMinor(discountValue) ?? 0 : 0;
  if (!Number.isFinite(discountMinor) || discountMinor <= 0 || subtotalMinor <= 0) {
    throw new CouponError("لا يمكن تطبيق هذا الكوبون على السلة الحالية.");
  }
  if (redeem) {
    const result = await db.coupon.updateMany({
      where: {
        id, storeId, isActive: true, minOrderAmt, maxUses, discountType, discountValue,
        AND: [{ expiresAt }, { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
        ...(maxUses === null ? {} : { usedCount: { lt: maxUses } }),
      },
      data: { usedCount: { increment: 1 } },
    });
    if (!result.count) throw new CouponError("تغيّرت صلاحية الكوبون. أعيدي معاينة السعر.", 409);
  }
  return { couponCode: coupon.code, discountAmount: fromMinor(Math.min(subtotalMinor, discountMinor)) };
}

export function checkoutTotals(
  subtotal: number, discountAmount: number, shippingCost: number, codFee: number,
  hasTaxNumber: boolean, paymentMethod: string,
) {
  const taxAmount = computeVat(subtotal - discountAmount, hasTaxNumber);
  const total = subtotal + shippingCost + codFee - discountAmount + taxAmount;
  if (discountAmount > 0 && paymentMethod !== "CASH_ON_DELIVERY" &&
    (paymentMethod === "BANK_TRANSFER" ? total <= 0 : (toMinor(total) ?? 0) < 100)) {
    throw new CouponError("المبلغ المتبقي أقل من الحد الأدنى لطريقة الدفع. اختاري طريقة أخرى أو أزيلي الكوبون.");
  }
  return { subtotal, discountAmount, shippingCost, codFee, taxAmount, total };
}
