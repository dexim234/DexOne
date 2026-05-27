"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type WidgetType = "tracker" | "smart" | "alerts" | "calls";
export type WidgetPosition = "left" | "right" | "top" | "bottom";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  order: number;
}

interface WidgetContextType {
  widgets: Widget[];
  openWidget: (type: WidgetType, title: string) => void;
  closeWidget: (id: string) => void;
  moveWidget: (id: string, position: WidgetPosition) => void;
  reorderWidgets: (position: WidgetPosition, newOrder: string[]) => void;
  isWidgetOpen: (type: WidgetType) => boolean;
}

const STORAGE_KEY = "dexone-widgets";

function loadWidgets(): Widget[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveWidgets(widgets: Widget[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(loadWidgets);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      saveWidgets(widgets);
    }
  }, [widgets, initialized]);

  const openWidget = useCallback((type: WidgetType, title: string) => {
    setWidgets((prev) => {
      if (prev.some((w) => w.type === type)) return prev;
      if (prev.length >= 4) return prev;

      const positionWidgets = prev.filter((w) => w.position === "left");
      const newWidget: Widget = {
        id: `${type}-${Date.now()}`,
        type,
        title,
        position: "left",
        order: positionWidgets.length,
      };
      return [...prev, newWidget];
    });
  }, []);

  const closeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const removed = prev.filter((w) => w.id !== id);
      // Recalculate orders per position
      const byPos: Record<WidgetPosition, Widget[]> = {
        left: [], right: [], top: [], bottom: [],
      };
      removed.forEach((w) => byPos[w.position].push(w));
      Object.keys(byPos).forEach((pos) => {
        byPos[pos as WidgetPosition].sort((a, b) => a.order - b.order);
        byPos[pos as WidgetPosition].forEach((w, i) => { w.order = i; });
      });
      return [...removed];
    });
  }, []);

  const moveWidget = useCallback((id: string, position: WidgetPosition) => {
    setWidgets((prev) => {
      const targetPosWidgets = prev.filter((w) => w.position === position && w.id !== id);
      return prev.map((w) =>
        w.id === id
          ? { ...w, position, order: targetPosWidgets.length }
          : w
      );
    });
  }, []);

  const reorderWidgets = useCallback((position: WidgetPosition, newOrder: string[]) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => {
        if (w.position !== position) return w;
        const idx = newOrder.indexOf(w.id);
        return { ...w, order: idx >= 0 ? idx : w.order };
      });
      return [...updated];
    });
  }, []);

  const isWidgetOpen = useCallback(
    (type: WidgetType) => widgets.some((w) => w.type === type),
    [widgets]
  );

  return (
    <WidgetContext.Provider
      value={{ widgets, openWidget, closeWidget, moveWidget, reorderWidgets, isWidgetOpen }}
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
