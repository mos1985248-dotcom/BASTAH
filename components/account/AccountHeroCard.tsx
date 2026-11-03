// components/account/AccountHeroCard.tsx
import s from "./account.module.css";

export default function AccountHeroCard({ name, email }: { name: string; email: string | null }) {
  return (
    <div className={s.hero}>
      <div className={s.avatar} aria-hidden="true">{name.charAt(0)}</div>
      <div>
        <h1 className={s.heroName}>مرحباً بك، {name}</h1>
        {email && <p className={s.heroMail}>{email}</p>}
      </div>
    </div>
  );
}
