"use client";
// components/ui/Toast.tsx
// الاستخدام: لفّ التطبيق بـ <ToastProvider> ثم const { show } = useToast();
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { uiVars } from "./vars";
import s from "./ui.module.css";

type Tone = "success" | "error";
type Item = { id: number; message: string; tone: Tone };

const ToastContext = createContext<{ show: (message: string, tone?: Tone) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: Tone = "success") => {
    const id = nextId.current++;
    setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={s.toasts} style={uiVars} aria-live="polite">
        {items.map((i) => (
          <div key={i.id} role="status" className={[s.toast, i.tone === "error" && s.toastError].filter(Boolean).join(" ")}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
