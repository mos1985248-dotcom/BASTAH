// lib/store-status.ts
// ⚠️ تصحيح: خريطة StoreRow.tsx القديمة كانت تستخدم "PENDING"/"CLOSED" وهما
// غير موجودتين إطلاقاً بـenum StoreStatus الحقيقي (ACTIVE|INACTIVE|
// SUSPENDED|PENDING_REVIEW) — يعني أي متجر INACTIVE أو PENDING_REVIEW كان
// يظهر بلون افتراضي خاطئ صامتاً. صُحّح هنا ليطابق enum فعلياً.
import { t } from "@/theme";

export const STORE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  SUSPENDED: "معلّق",
  PENDING_REVIEW: "قيد المراجعة",
};

export const STORE_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  INACTIVE: { color: t.colors.text.light, bg: t.colors.cream.bg },
  SUSPENDED: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  PENDING_REVIEW: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
};

export const VERIFICATION_STATUS_LABEL: Record<string, string> = {
  NOT_SUBMITTED: "لم تُقدَّم مستندات",
  PENDING_REVIEW: "قيد المراجعة",
  VERIFIED: "موثَّق",
  REJECTED: "مرفوض",
};

export const VERIFICATION_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  NOT_SUBMITTED: { color: t.colors.text.light, bg: t.colors.cream.bg },
  PENDING_REVIEW: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  VERIFIED: { color: t.colors.primary[800], bg: t.colors.primary[100] },
  REJECTED: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
};

export const ROLE_LABEL: Record<string, string> = {
  BUYER: "مشترٍ",
  SELLER: "بائع",
  ADMIN: "إدارة",
  SUPER_ADMIN: "إدارة عليا",
};

export const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  BUYER: { color: t.colors.text.mid, bg: t.colors.cream.bg },
  SELLER: { color: t.colors.primary[800], bg: t.colors.primary[100] },
  ADMIN: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  SUPER_ADMIN: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
};
