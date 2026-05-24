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
import { useTranslation } from "@/contexts/TranslationContext";

const leftItems = [
  { label: "Tracker", href: "/tracker", icon: Activity, transKey: "footer.tracker" },
  { label: "Smart", href: "/smart", icon: Brain, transKey: "footer.smart" },
  { label: "Alerts", href: "/alerts", icon: Bell, transKey: "footer.alerts" },
  { label: "Calls", href: "/calls", icon: Phone, transKey: "footer.calls" },
  { label: "MarketView", href: "/market-view", icon: BarChart3, transKey: "footer.marketView" },
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
  const { t } = useTranslation();
  const [cryptoPrices, setCryptoPrices] = useState<{
    SOL: { price: string; change: string };
    BTC: { price: string; change: string };
    ETH: { price: string; change: string };
    BNB: { price: string; change: string };
  } | null>(null);

  useEffect(() => {
    async function fetchCryptoPrices() {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT');
        const solData = await response.json();
        
        const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const btcData = await btcResponse.json();
        
        const ethResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');
        const ethData = await ethResponse.json();
        
        const bnbResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT');
        const bnbData = await bnbResponse.json();
        
        setCryptoPrices({
          SOL: {
            price: parseFloat(solData.lastPrice).toFixed(2),
            change: parseFloat(solData.priceChangePercent).toFixed(2),
          },
          BTC: {
            price: parseFloat(btcData.lastPrice).toFixed(2),
            change: parseFloat(btcData.priceChangePercent).toFixed(2),
          },
          ETH: {
            price: parseFloat(ethData.lastPrice).toFixed(2),
            change: parseFloat(ethData.priceChangePercent).toFixed(2),
          },
          BNB: {
            price: parseFloat(bnbData.lastPrice).toFixed(2),
            change: parseFloat(bnbData.priceChangePercent).toFixed(2),
          },
        });
      } catch (error) {
        console.error('Failed to fetch crypto prices from Binance:', error);
        setCryptoPrices({
          SOL: { price: "142.35", change: "2.4" },
          BTC: { price: "67,432.50", change: "1.8" },
          ETH: { price: "3,542.80", change: "2.1" },
          BNB: { price: "598.45", change: "0.9" },
        });
      }
    }
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-t border-border/30">
      <div className="flex h-12 items-center justify-between px-4 lg:px-6">
        {/* Left nav - compact with icons only on mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline tracking-tight">{t(item.transKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - Crypto Price ticker */}
        <div className="flex items-center gap-2.5 ml-4">
          {/* Crypto Prices - compact ticker style */}
          <div className="hidden lg:flex items-center gap-2">
            {[
              { coin: 'SOL', file: 'solanaLogoMark.svg' },
              { coin: 'BTC', file: 'Bitcoin.svg.png' },
              { coin: 'ETH', file: 'Ethereum_logo_2014.svg.png' },
              { coin: 'BNB', file: 'BNB,_native_cryptocurrency_for_the_Binance_Smart_Chain.svg.png' },
            ].map(({ coin, file }) => {
              const price = cryptoPrices?.[coin as keyof typeof cryptoPrices];
              const isPositive = price ? parseFloat(price.change) >= 0 : true;
              return (
                <div
                  key={coin}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-muted/50 to-muted/30 px-2.5 py-1.5 rounded-lg border border-border/30 hover:border-border/50 transition-all"
                >
                  <div className="flex items-center justify-center h-3.5 w-3.5">
                    <Image 
                      src={`/${file}`} 
                      alt={coin} 
                      width={14} 
                      height={14}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-foreground text-xs">
                      ${price?.price || "Loading..."}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {price?.change || "-"}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile crypto prices - minimal scrollable */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto no-scrollbar bg-muted/30 px-2 py-1 rounded-md border border-border/50">
            {[
              { coin: 'SOL', file: 'solanaLogoMark.svg' },
              { coin: 'BTC', file: 'Bitcoin.svg.png' },
              { coin: 'ETH', file: 'Ethereum_logo_2014.svg.png' },
              { coin: 'BNB', file: 'BNB,_native_cryptocurrency_for_the_Binance_Smart_Chain.svg.png' },
            ].map(({ coin, file }) => {
              const price = cryptoPrices?.[coin as keyof typeof cryptoPrices];
              const isPositive = price ? parseFloat(price.change) >= 0 : true;
              return (
                <div
                  key={coin}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <Image 
                    src={`/${file}`} 
                    alt={coin} 
                    width={10} 
                    height={10}
                    className="object-contain"
                  />
                  <span className="font-bold text-foreground text-[10px]">
                    ${price?.price || "-"}
                  </span>
                  <span
                    className={`text-[9px] font-semibold ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {price?.change ? `${price.change}%` : ""}
                  </span>
                </div>
              );
            })}
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
