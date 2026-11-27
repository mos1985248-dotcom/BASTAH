"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import s from "./footer.module.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY >= window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    document.getElementById("site-top")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <button type="button" className={s.backToTop} onClick={scrollToTop} aria-label="الصعود إلى أعلى الصفحة" title="الصعود إلى أعلى الصفحة">
      <ArrowUp size={21} aria-hidden="true" />
    </button>
  );
}
