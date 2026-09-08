// components/dashboard/shipping/carrierFields.ts
// ⚠️ عرض فقط بالفرونت إند — يعكس requiredCredentialFields الفعلي بكل من
// lib/shipping/providers/aramex.ts وlib/shipping/providers/spl.ts (لم يتغيّر
// الباك إند، هذا فقط تسمية عربية للحقول عند بناء نموذج الربط بالمتصفح).
// أي تعديل مستقبلي على requiredCredentialFields بملفات الـproviders يجب أن
// ينعكس هنا يدوياً — لا مصدر واحد للحقيقة عبر الشبكة لهذا التفصيل تحديداً.

export interface CredentialField {
  key: string;
  labelAr: string;
  secret?: boolean; // true → input type="password"
  placeholder?: string;
  dir?: "ltr" | "rtl";
}

export const CARRIER_CREDENTIAL_FIELDS: Record<string, CredentialField[]> = {
  ARAMEX: [
    { key: "accountNumber", labelAr: "رقم الحساب", dir: "ltr" },
    { key: "accountPin", labelAr: "الرقم السري للحساب (PIN)", secret: true, dir: "ltr" },
    { key: "accountEntity", labelAr: "رمز الكيان (Entity)", dir: "ltr", placeholder: "مثال: RUH" },
    { key: "accountCountryCode", labelAr: "رمز الدولة", dir: "ltr", placeholder: "SA" },
    { key: "username", labelAr: "اسم المستخدم", dir: "ltr" },
    { key: "password", labelAr: "كلمة المرور", secret: true, dir: "ltr" },
  ],
  SPL: [
    { key: "apiKey", labelAr: "مفتاح API", secret: true, dir: "ltr" },
    { key: "accountId", labelAr: "معرّف الحساب", dir: "ltr" },
    { key: "branchCode", labelAr: "رمز الفرع", dir: "ltr" },
  ],
};
