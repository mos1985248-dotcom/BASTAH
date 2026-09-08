// components/daftari/types.ts
export interface DaftariEntryItem {
  id: string;
  type: string;
  amount: number;
  expenseCategory: string | null;
  description: string | null;
  entryDate: string;
}

export const ENTRY_TYPE_LABEL: Record<string, string> = {
  SALE: "بيع", EXPENSE: "مصروف", REFUND: "استرداد", WITHDRAWAL: "سحب أرباح", ADJUSTMENT: "تعديل يدوي",
};

export const EXPENSE_CATEGORY_LABEL: Record<string, string> = {
  RAW_MATERIALS: "خامات ومواد", SHIPPING: "شحن", PACKAGING: "تغليف", MARKETING: "تسويق", PLATFORM_FEE: "رسوم منصة", OTHER: "أخرى",
};
