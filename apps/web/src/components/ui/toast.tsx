import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast Provider component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  const { addToast } = context;

  return {
    toast: addToast,
    success: (title: string, message?: string) => {
      const toastData: Omit<Toast, "id"> = { type: "success", title };
      if (message) toastData.message = message;
      addToast(toastData);
    },
    error: (title: string, message?: string) => {
      const toastData: Omit<Toast, "id"> = { type: "error", title };
      if (message) toastData.message = message;
      addToast(toastData);
    },
    warning: (title: string, message?: string) => {
      const toastData: Omit<Toast, "id"> = { type: "warning", title };
      if (message) toastData.message = message;
      addToast(toastData);
    },
    info: (title: string, message?: string) => {
      const toastData: Omit<Toast, "id"> = { type: "info", title };
      if (message) toastData.message = message;
      addToast(toastData);
    },
  };
}

/**
 * Toast container component
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

/**
 * Individual toast item
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Global toast instance for use outside React components
 */
let globalAddToast: ((toast: Omit<Toast, "id">) => void) | null = null;

export function setGlobalToast(addToast: (toast: Omit<Toast, "id">) => void) {
  globalAddToast = addToast;
}

export const toast = {
  success: (title: string, message?: string) => {
    const toastData: Omit<Toast, "id"> = { type: "success", title };
    if (message) toastData.message = message;
    globalAddToast?.(toastData);
  },
  error: (title: string, message?: string) => {
    const toastData: Omit<Toast, "id"> = { type: "error", title };
    if (message) toastData.message = message;
    globalAddToast?.(toastData);
  },
  warning: (title: string, message?: string) => {
    const toastData: Omit<Toast, "id"> = { type: "warning", title };
    if (message) toastData.message = message;
    globalAddToast?.(toastData);
  },
  info: (title: string, message?: string) => {
    const toastData: Omit<Toast, "id"> = { type: "info", title };
    if (message) toastData.message = message;
    globalAddToast?.(toastData);
  },
};
