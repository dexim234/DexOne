"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type WidgetPosition = "left" | "right" | "top" | "bottom";

export interface Widget {
  id: string;
  type: "tracker" | "smart" | "alerts" | "calls";
  title: string;
  position: WidgetPosition;
}

interface WidgetContextType {
  widgets: Widget[];
  openWidget: (type: Widget["type"], title: string) => void;
  closeWidget: (id: string) => void;
  moveWidget: (id: string, position: WidgetPosition) => void;
  isWidgetOpen: (type: Widget["type"]) => boolean;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const openWidget = useCallback((type: Widget["type"], title: string) => {
    setWidgets((prev) => {
      // Если уже открыт - ничего не делаем
      if (prev.some((w) => w.type === type)) return prev;
      // Максимум 4 виджета
      if (prev.length >= 4) return prev;

      const newWidget: Widget = {
        id: `${type}-${Date.now()}`,
        type,
        title,
        position: "left",
      };
      return [...prev, newWidget];
    });
  }, []);

  const closeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const moveWidget = useCallback((id: string, position: WidgetPosition) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  const isWidgetOpen = useCallback(
    (type: Widget["type"]) => widgets.some((w) => w.type === type),
    [widgets]
  );

  return (
    <WidgetContext.Provider
      value={{ widgets, openWidget, closeWidget, moveWidget, isWidgetOpen }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgets must be used within WidgetProvider");
  }
  return context;
}
