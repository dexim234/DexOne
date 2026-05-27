"use client";

import { useWidgets } from "@/contexts/WidgetContext";

export function useWidgetLayout() {
  const { widgets } = useWidgets();

  const hasLeft = widgets.some((w) => w.position === "left");
  const hasRight = widgets.some((w) => w.position === "right");
  const hasTop = widgets.some((w) => w.position === "top");
  const hasBottom = widgets.some((w) => w.position === "bottom");

  return {
    hasLeft,
    hasRight,
    hasTop,
    hasBottom,
    className: [
      hasLeft && "pl-72",
      hasRight && "pr-72",
      hasTop && "pt-52",
      hasBottom && "pb-52",
    ]
      .filter(Boolean)
      .join(" "),
    style: {
      paddingLeft: hasLeft ? "18rem" : undefined,
      paddingRight: hasRight ? "18rem" : undefined,
      paddingTop: hasTop ? "12rem" : undefined,
      paddingBottom: hasBottom ? "12rem" : undefined,
    },
  };
}
