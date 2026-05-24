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
    SOL: { price: string };
    BTC: { price: string };
    ETH: { price: string };
    BNB: { price: string };
  } | null>(null);

  useEffect(() => {
    async function fetchCryptoPrices() {
      try {
        const [solRes, btcRes, ethRes, bnbRes] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'),
        ]);

        const [solData, btcData, ethData, bnbData] = await Promise.all([
          solRes.json(),
          btcRes.json(),
          ethRes.json(),
          bnbRes.json(),
        ]);

        setCryptoPrices({
          SOL: { price: parseFloat(solData.price).toFixed(2) },
          BTC: { price: parseFloat(btcData.price).toFixed(2) },
          ETH: { price: parseFloat(ethData.price).toFixed(2) },
          BNB: { price: parseFloat(bnbData.price).toFixed(2) },
        });
      } catch (error) {
        console.error('Failed to fetch crypto prices from Binance:', error);
        setCryptoPrices({
          SOL: { price: "142.35" },
          BTC: { price: "67432.50" },
          ETH: { price: "3542.80" },
          BNB: { price: "598.45" },
        });
      }
    }
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-t border-border/30">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left nav - compact with icons only on mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {leftItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
              >
                <Icon className="h-4 w-4" />
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
              return (
                <div
                  key={coin}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-muted/50 to-muted/30 px-3 py-2 rounded-lg border border-border/30 hover:border-border/50 transition-all"
                >
                  <div className="flex items-center justify-center h-4 w-4">
                    <Image 
                      src={`/${file}`} 
                      alt={coin} 
                      width={16} 
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-foreground text-sm">
                      ${price?.price || "Loading..."}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile crypto prices - minimal scrollable */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto no-scrollbar bg-muted/30 px-2 py-1.5 rounded-md border border-border/50">
            {[
              { coin: 'SOL', file: 'solanaLogoMark.svg' },
              { coin: 'BTC', file: 'Bitcoin.svg.png' },
              { coin: 'ETH', file: 'Ethereum_logo_2014.svg.png' },
              { coin: 'BNB', file: 'BNB,_native_cryptocurrency_for_the_Binance_Smart_Chain.svg.png' },
            ].map(({ coin, file }) => {
              const price = cryptoPrices?.[coin as keyof typeof cryptoPrices];
              return (
                <div
                  key={coin}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <Image 
                    src={`/${file}`} 
                    alt={coin} 
                    width={12} 
                    height={12}
                    className="object-contain"
                  />
                  <span className="font-bold text-foreground text-xs">
                    ${price?.price || "-"}
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
