"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Flame, Clock, TrendingUp, Wallet, Settings, Sun } from "lucide-react";
import TrenchColumn from "@/components/market-hub/TrenchColumn";

export default function MarketHubPage() {
  const [buyMode, setBuyMode] = useState<string>("buy");
  const [displayMode, setDisplayMode] = useState<string>("chart");
  const [timeframe, setTimeframe] = useState<string>("1m");

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Bar with Selectors */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Left: Double Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button variant="ghost" size="xs" className="h-6">
                Trending
              </Button>
              <Button variant="default" size="xs" className="h-6">
                Trenches
              </Button>
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-3">
            {/* Buy Button with Price and Solana Icon */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1.5">
              <Button 
                variant={buyMode === "buy" ? "default" : "ghost"} 
                size="xs"
                className="h-6"
                onClick={() => setBuyMode("buy")}
              >
                <Wallet className="h-3 w-3" />
                Buy
              </Button>
              <div className="flex items-center gap-1 px-2">
                <Sun className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">$0.0024</span>
              </div>
            </div>

            {/* Display Selector */}
            <Select value={displayMode} onValueChange={setDisplayMode}>
              <SelectTrigger className="w-[100px] h-7">
                <Settings className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button 
                variant={timeframe === "1m" ? "default" : "ghost"} 
                size="xs"
                className="h-6 px-2"
                onClick={() => setTimeframe("1m")}
              >
                1m
              </Button>
              <Button 
                variant={timeframe === "3m" ? "default" : "ghost"} 
                size="xs"
                className="h-6 px-2"
                onClick={() => setTimeframe("3m")}
              >
                3m
              </Button>
              <Button 
                variant={timeframe === "5m" ? "default" : "ghost"} 
                size="xs"
                className="h-6 px-2"
                onClick={() => setTimeframe("5m")}
              >
                5m
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Three Columns of Trenches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* New Column (was Trending) */}
        <TrenchColumn
          title="New"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trenches={[]}
        />

        {/* Soon Column (was New) */}
        <TrenchColumn
          title="Soon"
          icon={<Flame className="h-4 w-4 text-muted-foreground" />}
          trenches={[]}
        />

        {/* Migration Column (was Recent) */}
        <TrenchColumn
          title="Migration"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          trenches={[]}
        />
      </div>
    </div>
  );
}
