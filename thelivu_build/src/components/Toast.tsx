import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

interface ToastItem { id: number; message: string; tone: 'success' | 'error' | 'info'; }
interface ToastContextValue { notify: (message: string, tone?: ToastItem['tone']) => void; }
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const notify = useCallback((message: string, tone: ToastItem['tone'] = 'success') => setToast({ id: Date.now(), message, tone }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return <ToastContext.Provider value={{ notify }}>
    {children}
    {toast && <div className="toast-stack"><div className="toast" role="status"><span style={{ color: toast.tone === 'error' ? 'var(--red)' : toast.tone === 'info' ? 'var(--blue)' : 'var(--green)' }}>{toast.tone === 'error' ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}</span>{toast.message}<button className="icon-button" aria-label="Dismiss message" onClick={() => setToast(null)}><X size={13} /></button></div></div>}
  </ToastContext.Provider>;
}
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider.');
  return context;
}
