"use client";

import { useState, useRef } from "react";
import { useWidgets, type WidgetPosition, type WidgetType } from "@/contexts/WidgetContext";
import { Activity, Brain, Bell, Megaphone, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const widgetIcons: Record<WidgetType, typeof Activity> = {
  tracker: Activity,
  smart: Brain,
  alerts: Bell,
  calls: Megaphone,
};

function WidgetCard({
  id,
  type,
  title,
  position,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const { closeWidget, moveWidget } = useWidgets();
  const [isDragging, setIsDragging] = useState(false);
  const Icon = widgetIcons[type];

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("widgetId", id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e, id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 transition-all duration-200",
        isDragging && "opacity-50 scale-95 rotate-2",
        position === "left" || position === "right" ? "w-64 h-full" : "w-64 h-44"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/30 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <Icon className="h-4 w-4 text-teal-500" />
          <span className="text-xs font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Position toggles */}
          {(["left", "right", "top", "bottom"] as WidgetPosition[]).map((p) => (
            <button
              key={p}
              onClick={(e) => {
                e.stopPropagation();
                moveWidget(id, p);
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              closeWidget(id);
            }}
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
            {title} скоро будет доступен
          </p>
        </div>
      </div>
    </div>
  );
}

function WidgetDock({
  position,
  widgets,
}: {
  position: WidgetPosition;
  widgets: ReturnType<typeof useWidgets>["widgets"];
}) {
  const { reorderWidgets } = useWidgets();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const positionWidgets = widgets
    .filter((w) => w.position === position)
    .sort((a, b) => a.order - b.order);

  if (positionWidgets.length === 0) return null;

  const isHorizontal = position === "top" || position === "bottom";
  const isVertical = position === "left" || position === "right";

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
  };

  const handleDragOver = (_e: React.DragEvent, targetId?: string) => {
    if (targetId && dragIdRef.current && dragIdRef.current !== targetId) {
      setDragOverId(targetId);
    }
  };

  const handleDrop = (_e: React.DragEvent, targetId: string) => {
    const draggedId = dragIdRef.current;
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = positionWidgets.map((w) => w.id);
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetId);

    if (fromIdx === -1) {
      // Dragged from another position - just append
      const newOrder = [...currentOrder, draggedId];
      reorderWidgets(position, newOrder);
    } else {
      // Reorder within same position
      const newOrder = [...currentOrder];
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedId);
      reorderWidgets(position, newOrder);
    }

    setDragOverId(null);
    dragIdRef.current = null;
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragIdRef.current = null;
  };

  return (
    <div
      className={cn(
        "fixed z-40 flex gap-2 p-2",
        isVertical && "top-16 bottom-14",
        isHorizontal && "left-0 right-0 h-48",
        position === "left" && "left-0 flex-col",
        position === "right" && "right-0 flex-col",
        position === "top" && "top-16 flex-row",
        position === "bottom" && "bottom-14 flex-row"
      )}
    >
      {positionWidgets.map((widget, idx) => (
        <div
          key={widget.id}
          className={cn(
            "transition-all duration-200",
            dragOverId === widget.id && "scale-105"
          )}
          style={{
            marginLeft: dragOverId === widget.id && idx > 0 ? "8px" : undefined,
          }}
        >
          <WidgetCard
            id={widget.id}
            type={widget.type}
            title={widget.title}
            position={widget.position}
            onDragStart={handleDragStart}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDrop={(e) => handleDrop(e, widget.id)}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}

export default function WidgetPanel() {
  const { widgets } = useWidgets();

  if (widgets.length === 0) return null;

  return (
    <>
      {(["left", "right", "top", "bottom"] as WidgetPosition[]).map((pos) => (
        <WidgetDock key={pos} position={pos} widgets={widgets} />
      ))}
    </>
  );
}
