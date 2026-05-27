"use client";

import { useWidgets, type WidgetPosition } from "@/contexts/WidgetContext";
import { Activity, Brain, Bell, Megaphone, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const widgetIcons = {
  tracker: Activity,
  smart: Brain,
  alerts: Bell,
  calls: Megaphone,
};

export default function WidgetPanel() {
  const { widgets, closeWidget, moveWidget } = useWidgets();

  if (widgets.length === 0) return null;

  const grouped = widgets.reduce((acc, widget) => {
    if (!acc[widget.position]) acc[widget.position] = [];
    acc[widget.position].push(widget);
    return acc;
  }, {} as Record<WidgetPosition, typeof widgets>);

  const positions: WidgetPosition[] = ["left", "right", "top", "bottom"];

  return (
    <>
      {positions.map((pos) => {
        const posWidgets = grouped[pos] || [];
        if (posWidgets.length === 0) return null;

        const isHorizontal = pos === "top" || pos === "bottom";
        const isVertical = pos === "left" || pos === "right";

        return (
          <div
            key={pos}
            className={cn(
              "fixed z-40 flex gap-2 p-2",
              isVertical && "top-16 bottom-16 flex-col w-72",
              isHorizontal && "left-0 right-0 h-48 flex-row",
              pos === "left" && "left-0",
              pos === "right" && "right-0",
              pos === "top" && "top-16",
              pos === "bottom" && "bottom-14"
            )}
          >
            {posWidgets.map((widget) => {
              const Icon = widgetIcons[widget.type];
              return (
                <div
                  key={widget.id}
                  className={cn(
                    "flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden",
                    isVertical && "flex-1 min-h-0",
                    isHorizontal && "flex-1 min-w-0"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                      <Icon className="h-4 w-4 text-teal-500" />
                      <span className="text-xs font-bold">{widget.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Position toggles */}
                      {(["left", "right", "top", "bottom"] as WidgetPosition[]).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => moveWidget(widget.id, p)}
                            className={cn(
                              "w-5 h-5 rounded text-[9px] font-bold transition-all",
                              widget.position === p
                                ? "bg-teal-500 text-white"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                            title={p}
                          >
                            {p[0].toUpperCase()}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => closeWidget(widget.id)}
                        className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-center min-h-0 p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-6 w-6 text-teal-500" />
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        В разработке
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {widget.title} скоро будет доступен
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
