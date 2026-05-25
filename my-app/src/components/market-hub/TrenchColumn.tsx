"use client";

import { Filter } from "lucide-react";

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
  trenches?: TrenchData[];
}

export default function TrenchColumn({ title, icon }: TrenchColumnProps) {
  return (
    <div className="bg-card rounded-xl border p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-accent rounded-lg transition-colors">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
