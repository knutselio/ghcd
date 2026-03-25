import { useCallback, useState } from 'react'
import type { ToastMessage, ToastType } from '../components/Toast'

let nextId = 0

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: ToastType, text: string) => {
    setToasts((prev) => [...prev, { id: ++nextId, type, text }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}
