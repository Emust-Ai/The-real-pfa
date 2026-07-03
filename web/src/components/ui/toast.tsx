import { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

let toastId = 0;
let addToastFn: ((t: Toast) => void) | null = null;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function toast(message: string, type: Toast['type'] = 'info') {
  if (addToastFn) addToastFn({ id: ++toastId, message, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  addToastFn = useCallback((t: Toast) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
    }, 4000);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(x => x.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-start gap-2 px-4 py-3 rounded-md border shadow-sm text-sm ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-surface-soft border-border text-foreground'
          }`}>
          {t.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> :
           t.type === 'error' ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> :
           <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="p-0.5 hover:opacity-70">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
