// lib/store-helpers.ts
// مساعدات صغيرة مشتركة بين مكونات صفحة المتجر — لا منطق أعمال ثقيل هنا.

/** سنوات النشاط الحقيقية — محسوبة من Store.createdAt، وليست رقماً يُدخله التاجر يدوياً */
export function yearsActiveFrom(createdAt: string): number {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;
  const diffMs = Date.now() - created.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

export function timeAgoAr(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "اليوم";
  if (days === 1) return "قبل يوم";
  if (days === 2) return "قبل يومين";
  if (days < 11) return `قبل ${days} أيام`;
  if (days < 30) return `قبل ${days} يوماً`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "قبل شهر" : `قبل ${months} أشهر`;
  const yrs = Math.floor(months / 12);
  return yrs === 1 ? "قبل سنة" : `قبل ${yrs} سنوات`;
}
