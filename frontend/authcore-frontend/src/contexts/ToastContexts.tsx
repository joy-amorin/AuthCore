import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react"

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps>({} as ToastContextProps);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = new Date().getTime(); // simple id
    setToasts((prev) => [...prev, { id, message, type }]);

    // remover automáticamente después de 5 segundos
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Aquí renderizamos los toasts */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              marginBottom: 8,
              padding: "10px 16px",
              borderRadius: 4,
              color: "#fff",
              backgroundColor:
                t.type === "success"
                  ? "#22c55e"
                  : t.type === "error"
                  ? "#ef4444"
                  : "#3b82f6",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
