import { AuthError, requireActiveStore } from "./auth";
import { getFeature } from "./entitlements";

export async function assertStoreFeature(storeId: string, feature: string) {
  const access = await getFeature(storeId, feature);
  if (!access.allowed) throw new AuthError("هذه الميزة غير متاحة لمتجرك.", 403);
  return access;
}

export async function requireStoreFeature(feature: string) {
  const store = await requireActiveStore();
  await assertStoreFeature(store.storeId, feature);
  return store;
}
