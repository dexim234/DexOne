"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Brain, Bell, Phone, BarChart3 } from "lucide-react";

const leftItems = [
  { label: "Tracker", href: "/tracker", icon: Activity },
  { label: "Smart", href: "/smart", icon: Brain },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "MarketView", href: "/market-hub", icon: BarChart3 },
];

const solflareIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M13.8 2h-3.6l-6 18h3.6l1.4-4.2h4.8l1.4 4.2h3.6l-6-18zm-1.8 9l-2.1-6.3 2.1 6.3zm1.8 5.4h-3.6l1.8-5.4 1.8 5.4z"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const [solPrice, setSolPrice] = useState<{ price: string; change: string } | null>(null);

  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const response = await fetch('https://api.coincap.io/v2/assets/solana');
        const data = await response.json();
        if (data?.data) {
          const price = parseFloat(data.data.priceUsd).toFixed(2);
          const change24h = parseFloat(data.data.changePercent24Hr).toFixed(2);
          setSolPrice({ price, change: change24h });
        }
      } catch (error) {
        console.error('Failed to fetch SOL price:', error);
        setSolPrice({ price: "142.35", change: "2.4" });
      }
    }
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = solPrice ? parseFloat(solPrice.change) >= 0 : true;

  return (
    <footer className="fixed bottom-0 z-50 w-full border-t border-border/30 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-8">
        {/* Left nav */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-teal bg-teal-muted ring-2 ring-teal/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0 ml-4">
          {/* SOL Price */}
          <div className="hidden sm:flex items-center gap-2.5 text-sm bg-muted/30 px-3.5 py-1.5 rounded-lg border border-border/50">
            <div className="flex items-center justify-center h-5 w-5 rounded bg-gradient-to-br from-[#9945FF] to-[#14F195]">
              {solflareIcon}
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] font-medium">SOL</span>
              <span className="font-semibold text-foreground text-xs">${solPrice?.price || "Loading..."}</span>
            </div>
            <span className={`font-medium text-xs ${isPositive ? "text-teal" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{solPrice?.change || "0.0"}%
            </span>
          </div>

          {/* About */}
          <Link
            href="/about"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/50"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
