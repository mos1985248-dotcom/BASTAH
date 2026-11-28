"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { uiVars } from "./vars";
import s from "./bastah-modal.module.css";

interface BastahModalProps {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
  compactMobile?: boolean;
}

export default function BastahModal({ open, label, onClose, children, compactMobile = false }: BastahModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) node.showModal();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      style={uiVars}
      dir="rtl"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence onExitComplete={() => { if (!open) dialog.current?.close(); }}>
          {open && (
            <m.div
              key="surface"
              className={s.surface}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            >
              <m.div
                className={compactMobile ? `${s.panel} ${s.compactMobile}` : s.panel}
                initial={reduceMotion ? false : { y: 14, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { y: 8, scale: 0.99 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 32 }}
              >
                <div className={s.controls}>
                  <button type="button" className={s.close} autoFocus aria-label="إغلاق النافذة" onClick={onClose}>
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                {children}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </dialog>
  );
}
