import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import { AuthError } from "./auth";

export const launchCapacity = 50;

export function launchExpiry(startsAt: Date) {
  const end = new Date(startsAt);
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + 3);
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(last, startsAt.getUTCDate()));
  return end;
}

export function grantLaunchPromotion(storeId: string, actorId: string) {
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(762304151)`;
    const store = await tx.store.findUnique({
      where: { id: storeId },
      select: { status: true, userId: true, user: { select: { phone: true, isVerified: true, isActive: true } }, subscription: { select: { plan: true, status: true } } },
    });
    if (!store || store.status !== "ACTIVE" || !store.user.isActive || !store.user.isVerified || !store.user.phone ||
        store.subscription?.plan !== "FREE" || store.subscription.status !== "ACTIVE") {
      throw new AuthError("العرض لمتجر نشط على باقة بداية، مرتبط بتاجر موثّق وجوال مسجّل.", 422);
    }
    const identityHash = createHash("sha256").update(store.user.phone.replace(/\s/g, "")).digest("hex");
    const prior = await tx.launchPromotion.findFirst({ where: { OR: [{ storeId }, { merchantId: store.userId }, { identityHash }] } });
    if (prior) throw new AuthError("سبق منح هذا العرض للتاجر.", 409);
    const used = await tx.launchPromotion.count();
    if (used >= launchCapacity) throw new AuthError("نفدت مقاعد العرض.", 409);
    const startsAt = new Date();
    const endsAt = launchExpiry(startsAt);
    await tx.launchPromotion.create({ data: { storeId, merchantId: store.userId, identityHash, seat: used + 1, startsAt, endsAt, grantedBy: actorId } });
    await tx.featureChange.create({ data: { actorId, action: "promotion", details: { storeId, seat: used + 1, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() } } });
  }, { timeout: 15000, maxWait: 5000 });
}
