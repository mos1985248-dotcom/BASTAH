"use client";

import { useEffect, useRef } from "react";

const CARD = "[data-home-reveal]";
const MOTION = "(prefers-reduced-motion: reduce)";

/** Progressive enhancement: cards keep their normal appearance until an entrance starts. */
export default function useHomeScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver || !window.matchMedia ||
        !window.CSS?.supports("animation-name", "home-reveal")) return;

    const motion = window.matchMedia(MOTION);
    const finish = (card: HTMLElement) => {
      card.dataset.homeRevealState = "done";
      card.style.removeProperty("--home-reveal-delay");
    };

    const observer = new IntersectionObserver((entries) => {
      // Read row positions before writing animation styles; transforms never change offsetTop.
      const entering = entries.filter((entry) => entry.isIntersecting &&
        (entry.target as HTMLElement).dataset.homeRevealState === "waiting");
      const cards = entering.map(({ target }) => {
        const card = target as HTMLElement;
        const group = card.closest("[data-home-reveal-group]");
        const row = group ? Array.from(group.children).filter((child): child is HTMLElement =>
          child instanceof HTMLElement && child.matches(CARD) && child.offsetTop === card.offsetTop
        ) : [card];
        return { card, delay: Math.max(0, row.indexOf(card)) * 80 };
      });
      cards.forEach(({ card, delay }) => {
        observer.unobserve(card);
        if (motion.matches || !root.contains(card)) {
          finish(card);
          return;
        }
        card.style.setProperty("--home-reveal-delay", `${delay}ms`);
        card.dataset.homeRevealState = "running";
      });
    }, { threshold: 0.08 });

    const register = () => {
      root.querySelectorAll<HTMLElement>(`${CARD}:not([data-home-reveal-state])`).forEach((card) => {
        const rect = card.getBoundingClientRect();
        // Already painted content stays visible, including asynchronously loaded cards.
        if (motion.matches || (rect.top < window.innerHeight && rect.bottom > 0 &&
            rect.left < window.innerWidth && rect.right > 0)) {
          finish(card);
        } else {
          card.dataset.homeRevealState = "waiting";
          observer.observe(card);
        }
      });
    };
    const finishAll = () => {
      observer.disconnect();
      root.querySelectorAll<HTMLElement>(CARD).forEach(finish);
    };
    const onMotionChange = () => {
      if (motion.matches) finishAll();
      else register();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches(CARD)) finish(event.target);
    };
    const onFocus = (event: FocusEvent) => {
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>(CARD) : null;
      if (card) {
        observer.unobserve(card);
        finish(card);
      }
    };

    register();
    // Stores and plans arrive after mount; observe additions without touching their data flow.
    const additions = window.MutationObserver ? new MutationObserver(register) : null;
    additions?.observe(root, { childList: true, subtree: true });
    root.addEventListener("animationend", onAnimationEnd);
    root.addEventListener("focusin", onFocus);
    motion.addEventListener?.("change", onMotionChange);

    return () => {
      additions?.disconnect();
      observer.disconnect();
      root.removeEventListener("animationend", onAnimationEnd);
      root.removeEventListener("focusin", onFocus);
      motion.removeEventListener?.("change", onMotionChange);
      // Remove only active animations. Waiting cards remain eligible after effect re-mounts.
      root.querySelectorAll<HTMLElement>(CARD).forEach((card) => {
        if (card.dataset.homeRevealState === "running") finish(card);
        else if (card.dataset.homeRevealState === "waiting") delete card.dataset.homeRevealState;
      });
    };
  }, []);

  return ref;
}
