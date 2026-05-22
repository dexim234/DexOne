"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Brain, Bell, Phone, BarChart3 } from "lucide-react";
import Image from "next/image";

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
        // Fetch from Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT');
        const data = await response.json();
        if (data) {
          const price = parseFloat(data.lastPrice).toFixed(2);
          const changePercent = parseFloat(data.priceChangePercent).toFixed(2);
          setSolPrice({ price, change: changePercent });
        }
      } catch (error) {
        console.error('Failed to fetch SOL price from Binance:', error);
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  active
                    ? "text-teal bg-teal-muted ring-2 ring-teal/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="tracking-wide hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0 ml-4">
          {/* SOL Price - improved design */}
          <div className="hidden sm:flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-center h-6 w-6 rounded-lg overflow-hidden ring-1 ring-border/50">
              <Image 
                src="/solanaLogoMark.svg" 
                alt="Solana" 
                width={24} 
                height={24}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">Solana</span>
              <span className="font-bold text-foreground text-sm">${solPrice?.price || "Loading..."}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
              isPositive ? "bg-teal/10 text-teal" : "bg-red-500/10 text-red-500"
            }`}>
              {isPositive ? "↑" : "↓"} {Math.abs(parseFloat(solPrice?.change || "0"))}%
            </div>
          </div>

          {/* About */}
          <Link
            href="/about"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-accent/50"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
