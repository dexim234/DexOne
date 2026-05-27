"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import TrenchCard from "./TrenchCard";
import { usePumpTokens } from "@/lib/use-pump-tokens";

interface TrenchColumnProps {
  title: string;
  columnType: "new" | "soon" | "migration";
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  selectedMetrics?: string[];
}

export default function TrenchColumn({ 
  title, 
  columnType,
  enableAutoRefresh = true,
  refreshInterval = 5000,
  selectedMetrics = [],
}: TrenchColumnProps) {
  const [sortBy, setSortBy] = useState("rank");

  const { tokens, isLoading, error, refresh } = usePumpTokens({
    columnType,
    refreshInterval: enableAutoRefresh ? refreshInterval : 0,
  });

  const handleManualRefresh = async () => {
    await refresh();
  };

  return (
    <div className="bg-card rounded-lg border p-3">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-accent rounded transition-colors">
            <Filter className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
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
      <div className="space-y-2">
        {isLoading && tokens.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-500">
            <p>Ошибка загрузки</p>
            <button onClick={handleManualRefresh} className="mt-2 px-3 py-1.5 text-xs rounded border border-border hover:bg-accent transition-colors">
              Повторить
            </button>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Нет доступных токенов
          </div>
        ) : (
          tokens.map((trench, index) => (
            <TrenchCard key={trench.mint || index} {...trench} />
          ))
        )}
      </div>
    </div>
  );
}

