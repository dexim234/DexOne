"use client";

import { useState } from "react";
import { Filter, Clock, Star, RefreshCw } from "lucide-react";
import TrenchCard from "@/app/market-hub/TrenchCard";
import { usePumpTokens } from "@/lib/use-pump-tokens";
import { Button } from "@/components/ui/button";

interface TrenchColumnProps {
  title: string;
  columnType: "new" | "soon" | "migration";
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  selectedMetrics?: string[];
  appliedFilters?: any;
  timeFrame?: string;
}

export default function TrenchColumn({ 
  title, 
  columnType,
  enableAutoRefresh = true,
  refreshInterval = 5000,
  selectedMetrics = [],
  appliedFilters = {},
  timeFrame = "3m",
}: TrenchColumnProps) {
  const [sortBy, setSortBy] = useState("rank");
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const { tokens, isLoading, error, refresh, lastUpdate, wsConnected } = usePumpTokens({
    columnType,
    refreshInterval: enableAutoRefresh ? refreshInterval : 0,
    enableWebSocket: true,
    filters: appliedFilters || {},
  });

  const handleManualRefresh = async () => {
    setIsManualRefresh(true);
    await refresh();
    setTimeout(() => setIsManualRefresh(false), 1000);
  };

  // Форматирование времени последнего обновления
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Никогда";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 5) return "Только что";
    if (diff < 60) return `${diff}с назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)}м назад`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-card rounded-lg border p-3">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {isLoading && tokens.length === 0 && (
            <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-accent rounded transition-colors">
            <Filter className="h-3 w-3 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded transition-colors">
            <Star className="h-3 w-3 text-muted-foreground" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isManualRefresh ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{tokens.length} токенов</span>
          {enableAutoRefresh && (
            <span className={`flex items-center gap-1 ${wsConnected ? 'text-green-500' : 'text-orange-500'}`}>
              <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-orange-500'}`}></span>
              {wsConnected ? 'Live' : 'Polling'}
            </span>
          )}
        </div>
        {lastUpdate && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatLastUpdate(lastUpdate)}
            <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
          </span>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => setSortBy("rank")}
          className={`px-2 py-0.5 rounded transition-colors ${sortBy === "rank" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          #
        </button>
        <button
          onClick={() => setSortBy("mc")}
          className={`px-2 py-0.5 rounded transition-colors ${sortBy === "mc" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          MC
        </button>
        <button
          onClick={() => setSortBy("volume")}
          className={`px-2 py-0.5 rounded transition-colors ${sortBy === "volume" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          Vol
        </button>
      </div>

      {/* Trench Cards */}
      <div className="space-y-2 overflow-y-auto min-h-0 flex-1">
        {isLoading && tokens.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-500">
            <p>Ошибка загрузки</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleManualRefresh}>
              Повторить
            </Button>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Нет доступных токенов
          </div>
        ) : (
          tokens.map((trench, index) => (
            <TrenchCard key={trench.mint || index} {...trench} selectedMetrics={selectedMetrics} timeFrame={timeFrame} />
          ))
        )}
      </div>
    </div>
  );
}

