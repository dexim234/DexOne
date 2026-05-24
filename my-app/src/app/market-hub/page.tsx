"use client";

import { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Clock, TrendingUp, Filter, Star } from "lucide-react";
import TrenchColumn from "@/components/market-hub/TrenchColumn";
import { trendingTrenches, newTrenches, recentTrenches } from "@/data/trenches";

export default function MarketHubPage() {
  const { t } = useTranslation();
  const [format, setFormat] = useState<string>("standard");

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Format Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("nav.marketHub")}
          </h1>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground">
              {t("marketHub.format")}
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder={t("marketHub.selectFormat")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Three Columns of Trenches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Trending Column */}
        <TrenchColumn
          title="Trending"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trenches={trendingTrenches}
        />

        {/* New Column */}
        <TrenchColumn
          title="New"
          icon={<Flame className="h-4 w-4 text-muted-foreground" />}
          trenches={newTrenches}
        />

        {/* Recent Column */}
        <TrenchColumn
          title="Recent"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          trenches={recentTrenches}
        />
      </div>
    </div>
  );
}
