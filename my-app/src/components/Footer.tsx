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

export default function Footer() {
  const pathname = usePathname();
  const [solPrice, setSolPrice] = useState<{ price: string; change: string } | null>(null);

  useEffect(() => {
    async function fetchSolPrice() {
      try {
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
    <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-t border-border/30">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left nav - compact with icons only on mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-teal text-white shadow-lg shadow-teal/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : ""}`} />
                <span className="hidden sm:inline tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - SOL Price ticker */}
        <div className="flex items-center gap-3 ml-4">
          {/* SOL Price - compact ticker style */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 px-4 py-2 rounded-xl border border-[#9945FF]/20">
            <div className="flex items-center justify-center h-5 w-5">
              <Image 
                src="/solanaLogoMark.svg" 
                alt="Solana" 
                width={20} 
                height={20}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-foreground text-sm">${solPrice?.price || "Loading..."}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
              isPositive ? "bg-[#14F195]/20 text-white" : "bg-[#9945FF]/20 text-white"
            }`}>
              {isPositive ? "↑" : "↓"} {Math.abs(parseFloat(solPrice?.change || "0")).toFixed(2)}%
            </div>
          </div>

          {/* Mobile SOL price - minimal */}
          <div className="sm:hidden flex items-center gap-1.5 bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/50">
            <Image 
              src="/solanaLogoMark.svg" 
              alt="Solana" 
              width={14} 
              height={14}
              className="object-contain"
            />
            <span className="font-bold text-foreground text-xs">${solPrice?.price || "-"}</span>
            <span className={`text-xs font-bold ${isPositive ? "text-[#14F195]" : "text-[#9945FF]"}`}>
              {isPositive ? "+" : ""}{solPrice?.change || "0"}%
            </span>
          </div>

          {/* About link */}
          <Link
            href="/about"
            className="hidden sm:inline-flex text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
