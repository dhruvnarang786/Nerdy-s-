/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useCallback } from 'react';
import { X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  icon?: React.ReactNode;
}

const MAX_TOASTS = 3;

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function showToast(type: ToastType, message: string, icon?: React.ReactNode) {
  addToastFn?.({ type, message, icon });
}

export function DnaNotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => {
      const next = [...prev, { ...t, id }];
      return next.slice(-MAX_TOASTS);
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 8000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="dna-toast-container" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`dna-toast dna-toast-${t.type}`}
          role="alert"
        >
          <span className="dna-toast-icon">
            {t.icon || (t.type === 'success' ? <Sparkles size={16} /> : t.type === 'error' ? <AlertCircle size={16} /> : <RefreshCw size={16} />)}
          </span>
          <span className="dna-toast-message">{t.message}</span>
          <button className="dna-toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
