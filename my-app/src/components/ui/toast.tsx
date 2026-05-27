"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (type: Toast["type"], title: string, message: string) => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (type: Toast["type"], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right-full",
              toast.type === "success" && "bg-green-500/10 border border-green-500/30 text-green-400",
              toast.type === "error" && "bg-red-500/10 border border-red-500/30 text-red-400",
              toast.type === "info" && "bg-blue-500/10 border border-blue-500/30 text-blue-400"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="h-5 w-5" />}
              {toast.type === "error" && <AlertCircle className="h-5 w-5" />}
              {toast.type === "info" && <Info className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
