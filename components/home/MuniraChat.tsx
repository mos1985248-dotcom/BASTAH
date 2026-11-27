"use client";

// components/home/MuniraChat.tsx
// صورة توضيحية لمحادثة مع منيرة (مثال على كتابة وصف منتج). ليست بيانات حقيقية.
import { useEffect, useRef, useState, type CSSProperties } from "react";
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

const reply = "تمر سكري فاخر، رطب وطري ومذاقه حلو متوازن. معبّأ بعناية ليصلك طازجاً، ويناسب الضيافة والإهداء.";
const replyWords = reply.split(" ");

export default function MuniraChat() {
  const body = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!body.current || !window.IntersectionObserver ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setPlay(true);
    }, { threshold: 0.35 });
    observer.observe(body.current);
    return () => observer.disconnect();
  }, []);

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

        <div ref={body} className={s.chatBody} data-conversation-play={play ? "true" : undefined} aria-hidden="true">
          <p className={`${s.bubble} ${s.bubbleUser}`}>أريد وصفاً جذاباً لتمر سكري ١ كيلو</p>

          <div className={s.replyRow}>
            <Avatar size={28} />
            <p className={`${s.bubble} ${s.bubbleBot}`}>
              {replyWords.map((word, index) => (
                <span key={index} className={s.replyWord} style={{ "--reply-delay": `${220 + index * 62}ms` } as CSSProperties}>
                  {word}{index < replyWords.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </div>

          <div className={`${s.replyRow} ${s.followUp}`}>
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
