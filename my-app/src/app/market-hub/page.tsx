"use client";

import { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Construction, TrendingUp, Flame, Archive } from "lucide-react";

export default function MarketHubPage() {
  const { t } = useTranslation();
  const [format, setFormat] = useState<string>("standard");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Format Selector */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          {t("nav.marketHub")}
        </h1>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-muted-foreground">
            {t("marketHub.format")}
          </label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[200px]">
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

      <div className="grid gap-6">
        {/* Trading Section - Under Development */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Trading</h2>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-muted mb-4">
              <Construction className="h-8 w-8 text-teal" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("marketHub.tradingUnderDevelopment")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {t("marketHub.tradingDescription")}
            </p>
          </div>
        </div>

        {/* Trenches Section with Tabs */}
        <div className="rounded-lg border bg-card">
          <Tabs defaultValue="new" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Trenches</h2>
            </div>
            
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">
                {t("marketHub.trenches.new")}
              </TabsTrigger>
              <TabsTrigger value="soon">
                {t("marketHub.trenches.soon")}
              </TabsTrigger>
              <TabsTrigger value="migrated">
                {t("marketHub.trenches.migrated")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6">
              <div className="rounded-md border bg-muted p-8 text-center">
                <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t("marketHub.trenches.newContent")}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="soon" className="mt-6">
              <div className="rounded-md border bg-muted p-8 text-center">
                <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t("marketHub.trenches.soonContent")}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="migrated" className="mt-6">
              <div className="rounded-md border bg-muted p-8 text-center">
                <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t("marketHub.trenches.migratedContent")}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

