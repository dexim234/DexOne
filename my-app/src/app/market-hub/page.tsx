"use client";

import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Wallet, Eye, EyeOff, ChevronDown, Monitor, List as ListIcon, Grid3x3, Zap, Droplets, Activity, TrendingUp, Users, PieChart, Clock, Users2, Bot, DollarSign, Award, UserX, Package, Crosshair, UserPlus, Flame, Percent } from "lucide-react";
import TrenchColumn from "@/components/market-hub/TrenchColumn";
import { FilterDialog } from "@/components/market-hub/FilterDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const DISPLAY_METRICS = [
  { id: "volume", label: "Volume", icon: Zap },
  { id: "liquidity", label: "Liquidity", icon: Droplets },
  { id: "transactions", label: "Transactions", icon: Activity },
  { id: "ath", label: "ATH", icon: TrendingUp },
  { id: "makersVol", label: "Makers / Vol", icon: Users },
  { id: "priceChange", label: "Price Change %", icon: PieChart },
  { id: "devTokensHistory", label: "Dev Tokens History", icon: Clock },
  { id: "holders", label: "Holders", icon: Users2 },
  { id: "botTraders", label: "Bot Traders", icon: Bot },
  { id: "botFee", label: "Bot Fee", icon: DollarSign },
  { id: "globalFees", label: "Global Fees", icon: Wallet },
  { id: "top10Hold", label: "Top 10 Hold", icon: Award },
  { id: "devHold", label: "Dev Hold", icon: UserX },
  { id: "bundlers", label: "Bundlers", icon: Package },
  { id: "snipers", label: "Snipers", icon: Crosshair },
  { id: "freshWallets", label: "Fresh Wallets", icon: UserPlus },
  { id: "lpBurn", label: "LP Burn", icon: Flame },
  { id: "dexTax", label: "DEX Tax", icon: Percent },
];

export default function MarketHubPage() {
  const [displayMode, setDisplayMode] = useState<string>("trenches");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedMetrics");
      return saved ? JSON.parse(saved) : ["volume", "holders", "priceChange"];
    }
    return ["volume", "holders", "priceChange"];
  });
  const [timeframe, setTimeframe] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("timeframe") || "1m";
    }
    return "1m";
  });
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  useEffect(() => {
    localStorage.setItem("selectedMetrics", JSON.stringify(selectedMetrics));
  }, [selectedMetrics]);

  useEffect(() => {
    localStorage.setItem("timeframe", timeframe);
  }, [timeframe]);

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    console.log("Applied filters:", filters);
    // Здесь будет логика применения фильтров к токенам
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Bar with Selectors */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Trending/Trenches Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
              <Button variant={displayMode === "trending" ? "default" : "ghost"} size="sm" 
                className="h-9 text-sm font-semibold px-4 rounded-lg transition-all"
                onClick={() => setDisplayMode("trending")}>
                <Monitor className="h-3.5 w-3.5 mr-1.5" />
                Trending
              </Button>
              <Button variant={displayMode === "trenches" ? "default" : "ghost"} size="sm" 
                className="h-9 text-sm font-semibold px-4 rounded-lg transition-all"
                onClick={() => setDisplayMode("trenches")}>
                <ListIcon className="h-3.5 w-3.5 mr-1.5" />
                Trenches
              </Button>
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button */}
            <FilterDialog onApplyFilters={handleApplyFilters} />

            {/* Quick Buy Button */}
            <Button 
              variant="secondary" 
              size="sm"
              className="h-9 text-sm font-semibold px-3 rounded-lg"
            >
              <Wallet className="h-3.5 w-3.5 mr-1.5" />
              Quick Buy
            </Button>

            {/* Display Selector with Metrics */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm font-semibold px-3 rounded-lg border border-border/50">
                  <Monitor className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
                  <span className="mr-1.5">Display:</span>
                  <span className="text-muted-foreground font-normal mr-1">({selectedMetrics.length})</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-3" align="end">
                <div className="mb-3">
                  <h4 className="font-semibold text-sm mb-1">Choose which metrics to display</h4>
                  <p className="text-xs text-muted-foreground">Click to toggle metrics on/off</p>
                </div>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-2 max-h-[450px] overflow-y-auto pr-1">
                  {DISPLAY_METRICS.map((metric) => {
                    const isSelected = selectedMetrics.includes(metric.id);
                    const Icon = metric.icon;
                    return (
                      <div 
                        key={metric.id}
                        onClick={() => toggleMetric(metric.id)}
                        className={`
                          cursor-pointer rounded-lg p-2.5 transition-all border
                          ${isSelected 
                            ? 'bg-gradient-to-br from-teal-500/15 to-cyan-500/15 border-teal-500/40' 
                            : 'bg-muted/30 border-transparent hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-teal-500' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {metric.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
              {["1m", "3m", "5m"].map((tf) => (
                <Button 
                  key={tf}
                  variant={timeframe === tf ? "default" : "ghost"} 
                  size="sm"
                  className={`h-8 text-xs font-semibold px-2.5 rounded-lg transition-all ${timeframe === tf ? '' : 'text-muted-foreground'}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Three Columns of Trenches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Column - получает новые токены в реальном времени */}
        <TrenchColumn
          title="New"
          columnType="new"
          enableAutoRefresh={true}
          refreshInterval={5000}
          selectedMetrics={selectedMetrics}
          appliedFilters={appliedFilters}
        />

        {/* Soon Column - получает трендовые токены */}
        <TrenchColumn
          title="Soon"
          columnType="soon"
          enableAutoRefresh={true}
          refreshInterval={10000}
          selectedMetrics={selectedMetrics}
          appliedFilters={appliedFilters}
        />

        {/* Migration Column - получает токены близкие к миграции */}
        <TrenchColumn
          title="Migration"
          columnType="migration"
          enableAutoRefresh={true}
          refreshInterval={15000}
          selectedMetrics={selectedMetrics}
          appliedFilters={appliedFilters}
        />
      </div>
    </div>
  );
}
