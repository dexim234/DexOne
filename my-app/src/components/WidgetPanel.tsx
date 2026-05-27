"use client";

import { useWidgets, type WidgetPosition, type WidgetType } from "@/contexts/WidgetContext";
import { Activity, Brain, Bell, Megaphone, X, Columns2, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

const widgetIcons: Record<WidgetType, typeof Activity> = {
  tracker: Activity,
  smart: Brain,
  alerts: Bell,
  calls: Megaphone,
};

function SingleWidget({
  id,
  type,
  title,
  position,
}: {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
}) {
  const { closeWidget, moveWidget, isStacked, toggleStacked } = useWidgets();
  const Icon = widgetIcons[type];

  return (
    <div
      className={cn(
        "flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden flex-shrink-0",
        isStacked ? "w-full h-52" : "w-64 h-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-teal-500" />
          <span className="text-xs font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Stack toggle */}
          <button
            onClick={toggleStacked}
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center transition-all",
              isStacked
                ? "bg-teal-500/20 text-teal-500"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
            title={isStacked ? "Side by side" : "Stacked"}
          >
            {isStacked ? <Columns2 className="h-3 w-3" /> : <Rows3 className="h-3 w-3" />}
          </button>

          {/* Position toggles */}
          {(["left", "right"] as WidgetPosition[]).map((p) => (
            <button
              key={p}
              onClick={() => moveWidget(id, p)}
              className={cn(
                "w-5 h-5 rounded text-[9px] font-bold transition-all",
                position === p
                  ? "bg-teal-500 text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
              title={`Move ${p}`}
            >
              {p[0].toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => closeWidget(id)}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all ml-0.5"
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
            {title} скоро будет доступен
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WidgetPanel() {
  const { widgets, isStacked } = useWidgets();

  if (widgets.length === 0) return null;

  const byPosition: Record<WidgetPosition, typeof widgets> = {
    left: [],
    right: [],
  };

  widgets.forEach((w) => {
    if (w.position === "left" || w.position === "right") {
      byPosition[w.position].push(w);
    }
  });

  (Object.keys(byPosition) as WidgetPosition[]).forEach((pos) => {
    byPosition[pos].sort((a, b) => a.order - b.order);
  });

  return (
    <>
      {/* Left dock */}
      {byPosition.left.length > 0 && (
        <div
          className={cn(
            "fixed left-0 top-16 bottom-14 z-40 flex gap-1 p-1",
            isStacked ? "flex-col w-64" : "flex-row"
          )}
        >
          {byPosition.left.map((widget) => (
            <SingleWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              title={widget.title}
              position={widget.position}
            />
          ))}
        </div>
      )}

      {/* Right dock */}
      {byPosition.right.length > 0 && (
        <div
          className={cn(
            "fixed right-0 top-16 bottom-14 z-40 flex gap-1 p-1",
            isStacked ? "flex-col w-64" : "flex-row"
          )}
        >
          {byPosition.right.map((widget) => (
            <SingleWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              title={widget.title}
              position={widget.position}
            />
          ))}
        </div>
      )}
    </>
  );
}
