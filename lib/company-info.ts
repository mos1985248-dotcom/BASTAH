// lib/company-info.ts
// البيانات النظامية للشركة، تُعرض في بطاقة «بيانات الشركة» بصفحة «من نحن».
// تُعبَّأ من وثائق الشركة الفعلية فقط (السجل التجاري وشهادة الضريبة…).
// القيمة null تعني «لا تُعرض»، ولا تُعرض أي ادعاءات تسجيل ما لم يوجد رقم سجل تجاري.

export interface CompanyInfo {
  /** الاسم النظامي كما في السجل التجاري */
  legalName: string | null;
  /** الشكل النظامي (مثل: شركة ذات مسؤولية محدودة، مؤسسة فردية) */
  legalForm: string | null;
  /** رقم السجل التجاري */
  commercialRegister: string | null;
  /** مدينة إصدار السجل */
  commercialRegisterCity: string | null;
  /** الرقم الضريبي (ضريبة القيمة المضافة) */
  vatNumber: string | null;
  /** سنة التأسيس */
  foundedYear: string | null;
  /** المقر الرئيسي */
  headquarters: string | null;
  /** بريد التواصل الرسمي */
  email: string | null;
  /** هاتف التواصل الرسمي */
  phone: string | null;
}

export const COMPANY_INFO: CompanyInfo = {
  legalName: null,
  legalForm: null,
  commercialRegister: null,
  commercialRegisterCity: null,
  vatNumber: null,
  foundedYear: null,
  headquarters: null,
  email: null,
  phone: null,
};
