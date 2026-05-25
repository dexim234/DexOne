"use client";

import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Clock, TrendingUp, Wallet, Eye, Save, EyeOff } from "lucide-react";
import TrenchColumn from "@/components/market-hub/TrenchColumn";
import { Rooms } from "@/types/websocket";

export default function MarketHubPage() {
  const [buyMode, setBuyMode] = useState<string>("buy");
  const [displayMode, setDisplayMode] = useState<string>("list");
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Bar with Selectors */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {/* Left: Double Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted rounded-xl p-1.5 px-2">
              <Button variant="ghost" size="sm" className="h-9 text-sm font-medium px-4">
                Trending
              </Button>
              <Button variant="default" size="sm" className="h-9 text-sm font-medium px-4">
                Trenches
              </Button>
            </div>
          </div>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-4">
            {/* Buy Button with Price Input */}
            <div className="flex items-center gap-3 bg-muted rounded-xl p-2 px-3">
              <Button 
                variant={buyMode === "buy" ? "default" : "secondary"} 
                size="sm"
                className="h-10 text-sm font-medium px-4"
                onClick={() => setBuyMode("buy")}
              >
                <Wallet className="h-4 w-4" />
                Buy
              </Button>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Input
                      ref={inputRef}
                      type="text"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onBlur={handleSavePrice}
                      onKeyDown={handleKeyDown}
                      className="w-24 h-8 text-sm font-medium bg-background border-input"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="h-8 w-8"
                      onClick={handleSavePrice}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="text-sm font-medium">${priceInput}</span>
                    <Save className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Display Selector */}
            <Select value={displayMode} onValueChange={setDisplayMode}>
              <SelectTrigger className="w-[140px] h-10">
                {displayMode === "chart" ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                <SelectValue placeholder="Display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1.5 px-2">
              <Button 
                variant={timeframe === "1m" ? "default" : "ghost"} 
                size="sm"
                className="h-9 text-sm font-medium px-3"
                onClick={() => setTimeframe("1m")}
              >
                1m
              </Button>
              <Button 
                variant={timeframe === "3m" ? "default" : "ghost"} 
                size="sm"
                className="h-9 text-sm font-medium px-3"
                onClick={() => setTimeframe("3m")}
              >
                3m
              </Button>
              <Button 
                variant={timeframe === "5m" ? "default" : "ghost"} 
                size="sm"
                className="h-9 text-sm font-medium px-3"
                onClick={() => setTimeframe("5m")}
              >
                5m
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Three Columns of Trenches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Column - получает токены через WebSocket */}
        <TrenchColumn
          title="New"
          icon={<TrendingUp className="h-5 w-5" />}
          room={Rooms.NEW_PAIRS}
        />

        {/* Soon Column */}
        <TrenchColumn
          title="Soon"
          icon={<Flame className="h-5 w-5" />}
          room={Rooms.SOON}
        />

        {/* Migration Column */}
        <TrenchColumn
          title="Migration"
          icon={<Clock className="h-5 w-5" />}
          room={Rooms.RECENT}
        />
      </div>
    </div>
  );
}
