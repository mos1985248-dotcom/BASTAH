"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import s from "./footer.module.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const position = () => Math.max(0, Math.min(window.scrollY, Math.max(0, document.documentElement.scrollHeight - window.innerHeight)));
    let anchor = position();
    let shown = false;
    const update = () => {
      frame = 0;
      const y = position();
      const delta = y - anchor;
      let next = shown;
      if (y < window.innerHeight) {
        next = false;
        anchor = y;
      } else if (Math.abs(delta) >= 12) {
        next = delta < 0;
        anchor = y;
      }
      if (next !== shown) {
        shown = next;
        setVisible(next);
      }
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    document.getElementById("site-top")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return visible ? (
    <button type="button" className={s.backToTop} onClick={scrollToTop} aria-label="الصعود إلى أعلى الصفحة" title="الصعود إلى أعلى الصفحة">
      <ArrowUp size={21} aria-hidden="true" />
    </button>
  ) : null;
}
