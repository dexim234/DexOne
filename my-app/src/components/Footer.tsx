"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Brain, Bell, Megaphone, BarChart3, X as TwitterIcon, MessageCircle, Globe, BarChart2, FileText, Shield, ChevronUp, TrendingUp } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/TranslationContext";
import { useWidgets } from "@/contexts/WidgetContext";

interface FooterItem {
  label: string;
  icon: typeof Activity;
  transKey: string;
}

interface WidgetItem extends FooterItem {
  widgetType: "tracker" | "smart" | "alerts" | "calls";
}

interface LinkItem extends FooterItem {
  href: string;
}

const widgetItems: WidgetItem[] = [
  { label: "Tracker", widgetType: "tracker", icon: Activity, transKey: "footer.tracker" },
  { label: "Smart", widgetType: "smart", icon: Brain, transKey: "footer.smart" },
  { label: "Alerts", widgetType: "alerts", icon: Bell, transKey: "footer.alerts" },
  { label: "Calls", widgetType: "calls", icon: Megaphone, transKey: "footer.calls" },
  { label: "MarketView", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView" },
  { label: "MarketView2", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView2" },
  { label: "MarketView3", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView3" },
  { label: "MarketView4", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView4" },
  { label: "MarketView5", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView5" },
  { label: "MarketView6", widgetType: "tracker", icon: BarChart3, transKey: "footer.marketView6" },
  { label: "XTracker", widgetType: "tracker", icon: TrendingUp, transKey: "footer.xtracker" },
];

const linkItems: LinkItem[] = [
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

// BingX price links (correct format)
const bingxLinks = {
  SOL: "https://bingx.com/ru/price/solana/",
  BTC: "https://bingx.com/ru/price/bitcoin/",
  ETH: "https://bingx.com/ru/price/ethereum/",
  BNB: "https://bingx.com/ru/price/bnb/",
};

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { openWidget, closeWidget, isWidgetOpen, widgets } = useWidgets();
  const [cryptoPrices, setCryptoPrices] = useState<{
    SOL: { price: string; change: string };
    BTC: { price: string; change: string };
    ETH: { price: string; change: string };
    BNB: { price: string; change: string };
  } | null>(null);
  const [fiatRates, setFiatRates] = useState<{
    USD_TO_RUB: number;
    USD_TO_EUR: number;
    USD_TO_CNY: number;
  } | null>(null);

  useEffect(() => {
    async function fetchFiatRates() {
      try {
        // Fetch USD to other currencies from a free API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setFiatRates({
          USD_TO_RUB: data.rates.RUB || 97.5,
          USD_TO_EUR: data.rates.EUR || 0.93,
          USD_TO_CNY: data.rates.CNY || 7.28,
        });
      } catch (error) {
        console.error('Failed to fetch fiat rates:', error);
        // Fallback rates
        setFiatRates({
          USD_TO_RUB: 97.5,
          USD_TO_EUR: 0.93,
          USD_TO_CNY: 7.28,
        });
      }
    }
    
    fetchFiatRates();
    const interval = setInterval(fetchFiatRates, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchCryptoPrices() {
      try {
        // Fetch price and 24h change from Binance
        const [solRes, btcRes, ethRes, bnbRes] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT'),
        ]);

        const [solData, btcData, ethData, bnbData] = await Promise.all([
          solRes.json(),
          btcRes.json(),
          ethRes.json(),
          bnbRes.json(),
        ]);

        setCryptoPrices({
          SOL: { 
            price: parseFloat(solData.lastPrice).toFixed(2), 
            change: `${parseFloat(solData.priceChangePercent).toFixed(2)}%` 
          },
          BTC: { 
            price: parseFloat(btcData.lastPrice).toFixed(2), 
            change: `${parseFloat(btcData.priceChangePercent).toFixed(2)}%` 
          },
          ETH: { 
            price: parseFloat(ethData.lastPrice).toFixed(2), 
            change: `${parseFloat(ethData.priceChangePercent).toFixed(2)}%` 
          },
          BNB: { 
            price: parseFloat(bnbData.lastPrice).toFixed(2), 
            change: `${parseFloat(bnbData.priceChangePercent).toFixed(2)}%` 
          },
        });
      } catch (error) {
        console.error('Failed to fetch crypto prices from Binance:', error);
        // Fallback prices
        setCryptoPrices({
          SOL: { price: "142.35", change: "+2.4" },
          BTC: { price: "67432.50", change: "+1.8" },
          ETH: { price: "3542.80", change: "+3.2" },
          BNB: { price: "598.45", change: "+0.9" },
        });
      }
    }
    
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (priceUSD: string, currency: 'RUB' | 'EUR' | 'CNY'): string => {
    const price = parseFloat(priceUSD);
    if (!fiatRates) return '';
    
    let rate: number;
    let symbol: string;
    
    switch (currency) {
      case 'RUB':
        rate = fiatRates.USD_TO_RUB;
        symbol = '₽';
        break;
      case 'EUR':
        rate = fiatRates.USD_TO_EUR;
        symbol = '€';
        break;
      case 'CNY':
        rate = fiatRates.USD_TO_CNY;
        symbol = '¥';
        break;
      default:
        return priceUSD;
    }
    
    const converted = price * rate;
    if (converted >= 1000) {
      return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  if (!cryptoPrices) {
    return (
      <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-t border-border/30 font-outfit">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {widgetItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.widgetType}
                  onClick={() => openWidget(item.widgetType, item.label)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight text-foreground hover:bg-accent/50 hover:scale-102"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline tracking-tight">{t(item.transKey)}</span>
                </button>
              );
            })}
            {linkItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight text-foreground hover:bg-accent/50 hover:scale-102"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline tracking-tight">{t(item.transKey)}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2.5 ml-4">
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-2 rounded-xl border border-border/30">
                <span className="text-sm font-medium text-muted-foreground">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-t border-border/30 font-outfit">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left nav - compact with icons only on mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {widgetItems.map((item) => {
            const Icon = item.icon;
            const isOpen = isWidgetOpen(item.widgetType);
            const widgetId = widgets.find(w => w.type === item.widgetType)?.id;
            return (
              <button
                key={item.widgetType}
                onClick={() => {
                  // Toggle widget - close if open, open if closed
                  if (isOpen && widgetId) {
                    closeWidget(widgetId);
                  } else {
                    openWidget(item.widgetType, item.label);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight border ${
                  isOpen
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-500'
                    : 'text-foreground hover:bg-accent/50 hover:scale-102 border-transparent'
                } ${item.label === 'XTracker' ? 'min-w-[120px]' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline tracking-tight">{t(item.transKey)}</span>
              </button>
            );
          })}
          {linkItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all duration-300 tracking-tight text-foreground hover:bg-accent/50 hover:scale-102"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline tracking-tight">{t(item.transKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - Crypto Price ticker with BingX links */}
        <div className="flex items-center gap-2.5 ml-4">
          {/* Crypto Prices - enhanced design without percentages */}
          <div className="hidden lg:flex items-center gap-2">
            {[
              { coin: 'SOL', file: 'solanaLogoMark.svg', bingxLink: bingxLinks.SOL },
              { coin: 'BTC', file: 'Bitcoin.svg.png', bingxLink: bingxLinks.BTC },
              { coin: 'ETH', file: 'Ethereum_logo_2014.svg.png', bingxLink: bingxLinks.ETH },
              { coin: 'BNB', file: 'BNB,_native_cryptocurrency_for_the_Binance_Smart_Chain.svg.png', bingxLink: bingxLinks.BNB },
            ].map(({ coin, file, bingxLink }) => {
              const price = cryptoPrices[coin as keyof typeof cryptoPrices];
              return (
                <div key={coin} className="relative group">
                  <a
                    href={bingxLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-teal-500/20 hover:to-purple-600/20 px-3 py-2 rounded-xl border border-border/30 hover:border-teal-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-center h-4 w-4 rounded bg-background/50">
                      <Image 
                        src={`/${file}`} 
                        alt={coin} 
                        width={16} 
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="font-extrabold text-foreground text-sm tracking-tight">
                        ${price.price}
                      </span>
                    </div>
                    {/* External link icon - always visible */}
                    <svg 
                      className="h-3 w-3 text-teal-500 shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                  
                  {/* Tooltip with currency conversions */}
                  <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl px-3 py-2 shadow-xl">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">USD</span>
                          <span className="font-bold">${price.price}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">RUB</span>
                          <span className="font-bold">{convertPrice(price.price, 'RUB')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">EUR</span>
                          <span className="font-bold">{convertPrice(price.price, 'EUR')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">CNY</span>
                          <span className="font-bold">{convertPrice(price.price, 'CNY')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile crypto prices - minimal scrollable */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto no-scrollbar bg-muted/30 px-2 py-1.5 rounded-lg border border-border/50">
            {[
              { coin: 'SOL', file: 'solanaLogoMark.svg', bingxLink: bingxLinks.SOL },
              { coin: 'BTC', file: 'Bitcoin.svg.png', bingxLink: bingxLinks.BTC },
              { coin: 'ETH', file: 'Ethereum_logo_2014.svg.png', bingxLink: bingxLinks.ETH },
              { coin: 'BNB', file: 'BNB,_native_cryptocurrency_for_the_Binance_Smart_Chain.svg.png', bingxLink: bingxLinks.BNB },
            ].map(({ coin, file, bingxLink }) => {
              const price = cryptoPrices[coin as keyof typeof cryptoPrices];
              return (
                <a
                  key={coin}
                  href={bingxLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-background/50 transition-all"
                >
                  <Image 
                    src={`/${file}`} 
                    alt={coin} 
                    width={14} 
                    height={14}
                    className="object-contain"
                  />
                  <span className="font-extrabold text-foreground text-xs">
                    ${price.price}
                  </span>
                </a>
              );
            })}
          </div>

          {/* About dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="inline-flex items-center gap-1 text-xs font-extrabold text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/50">
                <span>About</span>
                <ChevronUp className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 gap-0.5">
              {aboutMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} className="gap-2.5 cursor-pointer px-3 py-2 text-xs font-extrabold rounded-md hover:bg-accent/50">
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
