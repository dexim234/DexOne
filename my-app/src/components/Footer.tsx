"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Brain, Bell, Phone, BarChart3, X as TwitterIcon, MessageCircle, Globe, BarChart2, FileText, Shield, ChevronUp } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const leftItems = [
  { label: "Tracker", href: "/tracker", icon: Activity },
  { label: "Smart", href: "/smart", icon: Brain },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "MarketView", href: "/market-view", icon: BarChart3 },
];

const aboutMenuItems = [
  { label: "Twitter", href: "#", icon: TwitterIcon },
  { label: "Support", href: "#", icon: MessageCircle },
  { label: "EN Community", href: "#", icon: Globe },
  { label: "RU Community", href: "#", icon: MessageCircle },
  { label: "Charts by TradingView", href: "#", icon: BarChart2 },
  { label: "Privacy Policy", href: "#", icon: Shield },
  { label: "Terms of Use", href: "#", icon: FileText },
];

export default function Footer() {
  const pathname = usePathname();
  const [solPrice, setSolPrice] = useState<{ price: string; change: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<"top" | "bottom" | null>(null);

  const handleNavClick = () => {
    setActiveMenu("bottom");
  };

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
      <div className="flex h-12 items-center justify-between px-4 lg:px-6">
        {/* Left nav - compact with icons only on mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  active && activeMenu !== "top"
                    ? "bg-gradient-to-r from-teal to-teal-light text-white shadow-lg shadow-teal/25 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - SOL Price ticker */}
        <div className="flex items-center gap-2.5 ml-4">
          {/* SOL Price - compact ticker style */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 px-3 py-1.5 rounded-lg border border-[#9945FF]/20">
            <div className="flex items-center justify-center h-4 w-4">
              <Image 
                src="/solanaLogoMark.svg" 
                alt="Solana" 
                width={16} 
                height={16}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-foreground text-xs">${solPrice?.price || "Loading..."}</span>
            </div>
          </div>

          {/* Mobile SOL price - minimal */}
          <div className="sm:hidden flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md border border-border/50">
            <Image 
              src="/solanaLogoMark.svg" 
              alt="Solana" 
              width={12} 
              height={12}
              className="object-contain"
            />
            <span className="font-bold text-foreground text-xs">${solPrice?.price || "-"}</span>
          </div>

          {/* About dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/50">
                <span>About</span>
                <ChevronUp className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 gap-0.5">
              {aboutMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} className="gap-2.5 cursor-pointer px-3 py-2 text-xs font-semibold rounded-md hover:bg-accent/50">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  );
}
