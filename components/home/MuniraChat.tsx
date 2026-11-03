// components/home/MuniraChat.tsx
// صورة توضيحية لمحادثة مع منيرة (مثال على كتابة وصف منتج). ليست بيانات حقيقية.
import Image from "next/image";
import { SendHorizontal } from "lucide-react";
import s from "./munira.module.css";

function Avatar({ size }: { size: number }) {
  return (
    <span className={s.avatar} style={{ width: size, height: size }}>
      <Image src="/images/munira-avatar.png" alt="" width={size * 2} height={size * 2} className={s.avatarImg} />
    </span>
  );
}

export default function MuniraChat() {
  return (
    <figure className={s.figure}>
      <div
        className={s.chat}
        role="img"
        aria-label="مثال توضيحي: يطلب التاجر وصفاً لتمر سكري فتكتب منيرة وصفاً جاهزاً ثم تقترح اسماً للمنتج"
      >
        <div className={s.chatHead} aria-hidden="true">
          <Avatar size={44} />
          <div>
            <p className={s.chatName}>منيرة</p>
            <p className={s.chatRole}>مساعدة ذكية لمتجرك</p>
          </div>
        </div>

        <div className={s.chatBody} aria-hidden="true">
          <p className={`${s.bubble} ${s.bubbleUser}`}>أريد وصفاً جذاباً لتمر سكري ١ كيلو</p>

          <div className={s.replyRow}>
            <Avatar size={28} />
            <p className={`${s.bubble} ${s.bubbleBot}`}>
              تمر سكري فاخر، رطب وطري ومذاقه حلو متوازن. معبّأ بعناية ليصلك
              طازجاً، ويناسب الضيافة والإهداء.
            </p>
          </div>

          <div className={s.replyRow}>
            <Avatar size={28} />
            <p className={`${s.bubble} ${s.bubbleBot}`}>هل تريد اسماً مقترحاً للمنتج؟</p>
          </div>
        </div>

        <div className={s.chatInput} aria-hidden="true">
          <span>اكتب رسالتك لمنيرة…</span>
          <span className={s.send}>
            <SendHorizontal size={18} strokeWidth={1.9} />
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>مثال توضيحي لمحادثة مع منيرة</figcaption>
    </figure>
  );
}
