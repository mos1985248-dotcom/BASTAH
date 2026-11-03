// components/auth/AuthError.tsx
import { AlertTriangle } from "lucide-react";
import s from "./auth.module.css";

export default function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div role="alert" className={s.err}>
      <AlertTriangle size={17} strokeWidth={1.9} />
      <span>{message}</span>
    </div>
  );
}
