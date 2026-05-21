"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Brain, Bell, Phone, BarChart3 } from "lucide-react";

const leftItems = [
  { label: "Tracker", href: "/tracker", icon: Activity },
  { label: "Smart", href: "/smart", icon: Brain },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "MarketView", href: "/market-hub", icon: BarChart3 },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 z-50 w-full border-t border-border/50 bg-background/90 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-4 lg:px-6">
        {/* Left nav */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  active
                    ? "text-teal bg-teal-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0 ml-4">
          {/* SOL Price */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <svg
              viewBox="0 0 32 32"
              className="h-4 w-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="16" fill="#14F195" />
              <path
                d="M9.5 20.5L13 17H22.5L19 20.5H9.5Z"
                fill="black"
                fillOpacity="0.8"
              />
              <path
                d="M9.5 14.5L13 11H22.5L19 14.5H9.5Z"
                fill="black"
                fillOpacity="0.8"
              />
            </svg>
            <span className="text-muted-foreground text-xs">SOL</span>
            <span className="font-semibold text-foreground">$142.35</span>
            <span className="text-teal text-xs">+2.4%</span>
          </div>

          {/* About */}
          <Link
            href="/about"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
