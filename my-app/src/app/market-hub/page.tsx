"use client";

import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Eye, Save, EyeOff, ChevronDown, Monitor, List as ListIcon, Grid3x3 } from "lucide-react";
import TrenchColumn from "@/components/market-hub/TrenchColumn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const DISPLAY_METRICS = [
  { id: "volume", label: "Volume" },
  { id: "liquidity", label: "Liquidity" },
  { id: "transactions", label: "Transactions" },
  { id: "ath", label: "ATH" },
  { id: "makersVol", label: "Makers / Vol" },
  { id: "priceChange", label: "Price Change %" },
  { id: "devTokensHistory", label: "Dev Tokens History" },
  { id: "holders", label: "Holders" },
  { id: "botTraders", label: "Bot Traders" },
  { id: "botFee", label: "Bot Fee" },
  { id: "globalFees", label: "Global Fees" },
  { id: "top10Hold", label: "Top 10 Hold" },
  { id: "devHold", label: "Dev Hold" },
  { id: "bundlers", label: "Bundlers" },
  { id: "snipers", label: "Snipers" },
  { id: "freshWallets", label: "Fresh Wallets" },
  { id: "lpBurn", label: "LP Burn" },
  { id: "dexTax", label: "DEX Tax" },
];

export default function MarketHubPage() {
  const [buyMode, setBuyMode] = useState<string>("buy");
  const [displayMode, setDisplayMode] = useState<string>("list");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "volume", "holders", "priceChange"
  ]);
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [priceInput, setPriceInput] = useState<string>("0.0024");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSavePrice = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSavePrice();
    }
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
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
          <div className="flex items-center gap-3 flex-wrap">
            {/* Buy Button with Price Input */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-2 px-3 border border-border/30">
              <Button 
                variant={buyMode === "buy" ? "default" : "secondary"} 
                size="sm"
                className="h-9 text-sm font-semibold px-3 rounded-lg"
                onClick={() => setBuyMode("buy")}
              >
                <Wallet className="h-3.5 w-3.5 mr-1.5" />
                Buy
              </Button>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <Input
                      ref={inputRef as any}
                      type="text"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onBlur={handleSavePrice}
                      onKeyDown={handleKeyDown}
                      className="w-20 h-7 text-sm font-semibold bg-background border-input"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={handleSavePrice}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <div 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="text-sm font-semibold">${priceInput}</span>
                    <Save className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

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
              <PopoverContent className="w-72 p-3" align="end">
                <div className="mb-2">
                  <h4 className="font-semibold text-sm mb-1">Choose which metrics to display on token cards</h4>
                  <p className="text-xs text-muted-foreground">Select metrics to show on token cards</p>
                </div>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {DISPLAY_METRICS.map((metric) => (
                    <div 
                      key={metric.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-accent/50 rounded-md p-1.5 transition-colors"
                      onClick={() => toggleMetric(metric.id)}
                    >
                      <Checkbox 
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                        className="h-4 w-4"
                      />
                      <label 
                        htmlFor={metric.id}
                        className="text-sm font-medium leading-none cursor-pointer select-none"
                      >
                        {metric.label}
                      </label>
                    </div>
                  ))}
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
        />

        {/* Soon Column - получает трендовые токены */}
        <TrenchColumn
          title="Soon"
          columnType="soon"
          enableAutoRefresh={true}
          refreshInterval={10000}
          selectedMetrics={selectedMetrics}
        />

        {/* Migration Column - получает токены близкие к миграции */}
        <TrenchColumn
          title="Migration"
          columnType="migration"
          enableAutoRefresh={true}
          refreshInterval={15000}
          selectedMetrics={selectedMetrics}
        />
      </div>
    </div>
  );
}
