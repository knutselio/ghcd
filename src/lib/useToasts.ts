import { useCallback, useState } from "react";
import type { ToastMessage, ToastType } from "../components/Toast";

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, text: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, text }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
