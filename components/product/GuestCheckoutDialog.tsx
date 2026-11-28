"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { uiVars } from "@/components/ui/vars";
import s from "./guest-checkout.module.css";

export default function GuestCheckoutDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog ref={dialog} className={s.dialog} style={uiVars} aria-label="الشراء كزائر"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <button type="button" className={s.close} onClick={onClose} aria-label="إغلاق">×</button>
      {children}
    </dialog>
  );
}
