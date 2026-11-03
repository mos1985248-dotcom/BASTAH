// components/layout/FooterBrand.tsx — هوية الفوتر (الشعار الحالي + الاسم)
import Image from "next/image";
import s from "./footer.module.css";

export default function FooterBrand() {
  return (
    <div>
      <div className={s.brandHead}>
        <span className={s.logoMark}>
          <Image src="/images/logo-icon.png" alt="بسطة مارت" width={44} height={44} style={{ width: 44, height: 44, objectFit: "contain" }} />
        </span>
        <div>
          <p className={s.brandName}>بسطة مارت</p>
          <p className={s.brandTag}>منصة الأسر المنتجة السعودية</p>
        </div>
      </div>
      <p className={s.brandText}>
        منصة سعودية تجمع الأسر المنتجة وأصحاب المتاجر الصغيرة في مكان واحد،
        لتقديم منتجاتهم وخدماتهم بطريقة عصرية بروح السوق السعودي.
      </p>
    </div>
  );
}
