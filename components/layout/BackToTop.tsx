"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import s from "./footer.module.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const dock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = dock.current?.closest("footer");
    const mobile = window.matchMedia("(max-width: 767px)");
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const scrolled = y >= window.innerHeight;
      const delta = y - lastY;
      if (!scrolled || delta > 4) setVisible(false);
      else if (delta < -4) setVisible(true);
      lastY = y;
      setAtFooter(scrolled && mobile.matches && Boolean(footer && footer.getBoundingClientRect().top < window.innerHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToTop = () => {
    document.getElementById("site-top")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <div ref={dock} className={atFooter ? s.backToTopDock : undefined}>
      {visible && (
        <button type="button" className={s.backToTop} onClick={scrollToTop} aria-label="الصعود إلى أعلى الصفحة" title="الصعود إلى أعلى الصفحة">
          <ArrowUp size={21} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
