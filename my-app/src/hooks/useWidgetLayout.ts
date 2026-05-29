"use client";

import { useWidgets } from "@/contexts/WidgetContext";

export function useWidgetLayout() {
  const { widgets, isStacked } = useWidgets();

  const hasLeft = widgets.some((w) => w.position === "left");
  const hasRight = widgets.some((w) => w.position === "right");

  const leftWidgetCount = widgets.filter((w) => w.position === "left").length;
  const rightWidgetCount = widgets.filter((w) => w.position === "right").length;

  // When stacked: single column, width = 256px + padding
  // When side-by-side: width = count * 256 + (count-1) * 4 + padding
  const leftWidth = hasLeft
    ? (isStacked ? 256 + 8 : leftWidgetCount * 256 + (leftWidgetCount - 1) * 4 + 8)
    : 0;
  const rightWidth = hasRight
    ? (isStacked ? 256 + 8 : rightWidgetCount * 256 + (rightWidgetCount - 1) * 4 + 8)
    : 0;

  const className = [
    hasLeft && "pl-[var(--widget-left)]",
    hasRight && "pr-[var(--widget-right)]",
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ["--widget-left" as string]: hasLeft ? `${leftWidth}px` : undefined,
    ["--widget-right" as string]: hasRight ? `${rightWidth}px` : undefined,
  };

  return { className, style };
}
