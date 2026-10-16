"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = 0;

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + counter++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

const iconMap: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const colorMap: Record<ToastType, { bg: string; border: string; bar: string }> = {
  success: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", bar: "#10B981" },
  error:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.4)",  bar: "#EF4444" },
  warning: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", bar: "#F59E0B" },
  info:    { bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.4)", bar: "#60A5FA" },
};

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "360px",
        width: "100%",
      }}
    >
      {toasts.map((t) => {
        const c = colorMap[t.type];
        return (
          <div
            key={t.id}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              animation: "toast-in 0.25s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Left colour bar */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: c.bar, borderRadius: "10px 0 0 10px" }} />
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{iconMap[t.type]}</span>
            <span style={{ fontSize: "0.9rem", flex: 1, color: "#F8FAFC", lineHeight: 1.5 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: "1rem", padding: 0, flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
