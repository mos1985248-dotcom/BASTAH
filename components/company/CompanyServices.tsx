// components/company/CompanyServices.tsx — «ماذا نقدم؟»: ثلاث مجموعات (متجر، طلبات، دفع وشحن).
import Image from "next/image";
import { Store, Package, ShoppingBag, CreditCard, Truck, LayoutDashboard, type LucideIcon } from "lucide-react";
import { SERVICES } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

const ICONS: Record<string, LucideIcon> = {
  store: Store, package: Package, orders: ShoppingBag, dashboard: LayoutDashboard, payment: CreditCard, shipping: Truck,
};

export default function CompanyServices() {
  return (
    <section className={s.block}>
      <div className={s.wrap}>
        <div className={c.head}>
          <p className={s.eyebrow}>{SERVICES.eyebrow}</p>
          <h2 className={`${s.h2} ${s.display}`}>{SERVICES.title}</h2>
          <p className={c.headLead}>{SERVICES.lead}</p>
        </div>

        <div className={c.rows}>
          {SERVICES.groups.map((group, index) => (
            <div key={group.title} className={`${s.grid} ${index % 2 === 1 ? s.rev : ""}`}>
              <div className={s.media}>
                <Image src={group.image} alt={group.imageAlt} fill sizes="(max-width: 900px) 100vw, 48vw" className={s.img} />
              </div>

              <div>
                <p className={s.eyebrow}>{group.eyebrow}</p>
                <h3 className={`${s.h2} ${s.display}`}>{group.title}</h3>
                <p className={c.desc}>{group.description}</p>

                <div className={c.items}>
                  {group.items.map(({ icon, title, description }) => {
                    const Icon = ICONS[icon];
                    return (
                      <div key={title} className={c.item}>
                        <span className={c.itemIcon}>
                          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <h4 className={c.itemTitle}>{title}</h4>
                        <p className={c.itemDesc}>{description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
