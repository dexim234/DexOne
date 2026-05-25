"use client";

import { useState } from "react";
import { Filter, Star } from "lucide-react";
import TrenchCard from "./TrenchCard";

interface TrenchData {
  rank: string;
  logo: string;
  name: string;
  mc: string;
  mcChange: string;
  volume24h: string;
  volumeChange: string;
  priceChange1h: string;
  priceChange24h: string;
  priceChange7d: string;
  trades: string;
  holders: string;
  isVerified?: boolean;
}

interface TrenchColumnProps {
  title: string;
  icon: React.ReactNode;
  trenches: TrenchData[];
}

export default function TrenchColumn({ title, icon, trenches }: TrenchColumnProps) {
  const [sortBy, setSortBy] = useState("rank");

  return (
    <div className="bg-card rounded-lg border p-3">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-accent rounded transition-colors">
            <Filter className="h-3 w-3 text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded transition-colors">
            <Star className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => setSortBy("rank")}
          className={`px-2 py-0.5 rounded transition-colors ${sortBy === "rank" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          Rank
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
          24h Vol
        </button>
      </div>

      {/* Trench Cards */}
      <div className="space-y-2">
        {trenches.map((trench, index) => (
          <TrenchCard key={index} {...trench} />
        ))}
      </div>
    </div>
  );
}
