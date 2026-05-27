"use client";

import { useWidgets } from "@/contexts/WidgetContext";

export function useWidgetLayout() {
  const { widgets } = useWidgets();

  const hasLeft = widgets.some((w) => w.position === "left");
  const hasRight = widgets.some((w) => w.position === "right");
  const hasTop = widgets.some((w) => w.position === "top");
  const hasBottom = widgets.some((w) => w.position === "bottom");

  // Calculate total width for left/right
  // Each widget: 256px (w-64), gap: 4px (gap-1), padding: 8px total (p-1 = 4px each side)
  const leftWidgetCount = widgets.filter((w) => w.position === "left").length;
  const rightWidgetCount = widgets.filter((w) => w.position === "right").length;
  const leftWidth = leftWidgetCount > 0 ? leftWidgetCount * 256 + (leftWidgetCount - 1) * 4 + 8 : 0;
  const rightWidth = rightWidgetCount > 0 ? rightWidgetCount * 256 + (rightWidgetCount - 1) * 4 + 8 : 0;

  // Calculate total height for top/bottom
  // Each widget row: 208px (h-52), gap: 4px (gap-1), padding: 8px total (p-1)
  const topWidgetCount = widgets.filter((w) => w.position === "top").length;
  const bottomWidgetCount = widgets.filter((w) => w.position === "bottom").length;
  const topHeight = topWidgetCount > 0 ? 208 + 8 : 0;
  const bottomHeight = bottomWidgetCount > 0 ? 208 + 8 : 0;

  const className = [
    hasLeft && "pl-[var(--widget-left)]",
    hasRight && "pr-[var(--widget-right)]",
    hasTop && "pt-[var(--widget-top)]",
    hasBottom && "pb-[var(--widget-bottom)]",
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ["--widget-left" as string]: hasLeft ? `${leftWidth}px` : undefined,
    ["--widget-right" as string]: hasRight ? `${rightWidth}px` : undefined,
    ["--widget-top" as string]: hasTop ? `${topHeight}px` : undefined,
    ["--widget-bottom" as string]: hasBottom ? `${bottomHeight}px` : undefined,
  };

  return { className, style };
}
