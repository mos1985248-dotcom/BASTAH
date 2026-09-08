// lib/ticket-status.ts
import { t } from "@/theme";

export const TICKET_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  OPEN: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  IN_PROGRESS: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  RESOLVED: { color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  CLOSED: { color: t.colors.text.light, bg: t.colors.cream.bg },
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  OPEN: "مفتوح", IN_PROGRESS: "قيد المعالجة", RESOLVED: "محلول", CLOSED: "مغلق",
};
