"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type WidgetType = "tracker" | "xtracker" | "smart" | "alerts" | "calls" | "marketview";
export type WidgetPosition = "left" | "right";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  order: number;
}

interface WidgetContextType {
  widgets: Widget[];
  isStacked: boolean;
  openWidget: (type: WidgetType, title: string) => void;
  closeWidget: (id: string) => void;
  moveWidget: (id: string, position: WidgetPosition) => void;
  toggleStacked: () => void;
  isWidgetOpen: (type: WidgetType) => boolean;
}

const STORAGE_KEY = "dexone-widgets";
const STACKED_KEY = "dexone-widgets-stacked";

function loadWidgets(): Widget[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function loadStacked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(STACKED_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return false;
}

function saveWidgets(widgets: Widget[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

function saveStacked(stacked: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STACKED_KEY, JSON.stringify(stacked));
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(loadWidgets);
  const [isStacked, setIsStacked] = useState<boolean>(loadStacked);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      saveWidgets(widgets);
    }
  }, [widgets, initialized]);

  useEffect(() => {
    if (initialized) {
      saveStacked(isStacked);
    }
  }, [isStacked, initialized]);

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
      const byPos: Record<WidgetPosition, Widget[]> = {
        left: [], right: [],
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

  const toggleStacked = useCallback(() => {
    setIsStacked((prev) => !prev);
  }, []);

  const isWidgetOpen = useCallback(
    (type: WidgetType) => widgets.some((w) => w.type === type),
    [widgets]
  );

  return (
    <WidgetContext.Provider
      value={{ widgets, isStacked, openWidget, closeWidget, moveWidget, toggleStacked, isWidgetOpen }}
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
