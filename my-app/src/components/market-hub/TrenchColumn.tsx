"use client";

import { Filter, Star } from "lucide-react";

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

export default function TrenchColumn({ title, icon }: TrenchColumnProps) {
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
    </div>
  );
}
