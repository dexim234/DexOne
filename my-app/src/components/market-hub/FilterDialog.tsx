"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, RefreshCw } from "lucide-react";

interface FilterDialogProps {
  onApplyFilters: (filters: Record<string, unknown>) => void;
}

export function FilterDialog({ onApplyFilters }: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedLaunchpads, setSelectedLaunchpads] = useState<string[]>([]);
  const [selectedMarketFilters, setSelectedMarketFilters] = useState<string[]>([]);
  const [volumeTab, setVolumeTab] = useState("1m");
  const [selectedVolumeFilters, setSelectedVolumeFilters] = useState<string[]>([]);
  const [selectedHoldersFilters, setSelectedHoldersFilters] = useState<string[]>([]);
  const [selectedDevFilters, setSelectedDevFilters] = useState<string[]>([]);

  // Market filters
  const marketFilters = [
    { id: "socials", label: "With 1 Socials" },
    { id: "dexpaid", label: "Dex Paid" },
    { id: "migrated", label: "Migrated" },
    { id: "lpburn", label: "LP Burn" },
    { id: "maybemode", label: "Maybem Mode" },
    { id: "cashback", label: "With Cashback" },
  ];

  // Volume filters (1m, 3m, 5m)
  const volumeFiltersShort = [
    { id: "volume", label: "Volume" },
    { id: "buyvolume", label: "Buy Volume" },
    { id: "sellvolume", label: "Sell Volume" },
    { id: "botfee", label: "Bot Fee" },
    { id: "sellbotfee", label: "Sell Bot Fee" },
    { id: "buys", label: "Buys" },
    { id: "sells", label: "Sells" },
    { id: "makers", label: "Makers" },
  ];

  // Volume filters (Total)
  const volumeFiltersTotal = [
    { id: "volume", label: "Volume" },
    { id: "botfee", label: "Bot Fee" },
    { id: "globalfees", label: "Global Fees" },
    { id: "txs", label: "TXS" },
    { id: "buys", label: "Buys" },
    { id: "sells", label: "Sells" },
  ];

  // Holders filters
  const holdersFilters = [
    { id: "holders", label: "Holders" },
    { id: "top10hold", label: "Top 10 Hold" },
    { id: "bottraders", label: "Bot Traders" },
    { id: "newwallets", label: "New Wallets" },
    { id: "devhold", label: "Dev Hold" },
    { id: "bundlehold", label: "Bundle Hold" },
    { id: "snipershold", label: "Snipers Hold" },
  ];

  // Dev filters
  const devFilters = [
    { id: "lastmigrated", label: "Last Token Migrated" },
    { id: "totalhistory", label: "TOTAL HISTORY" },
    { id: "launched", label: "Launched" },
    { id: "migrated", label: "Migrated" },
    { id: "migratedpercent", label: "Migrated %" },
    { id: "avg3ath", label: "AVG LAST 3 ATH" },
    { id: "avg3botfee", label: "AVG LAST 3 Bot Fee" },
    { id: "avg5ath", label: "AVG LAST 5 ATH" },
    { id: "avg5botfee", label: "AVG LAST 5 Bot Fee" },
    { id: "devwallet", label: "DEV WALLET" },
    { id: "devsol", label: "Dev SOL Balance" },
    { id: "fundedhours", label: "Funded hours ago" },
    { id: "fundingsol", label: "Funding SOL amount" },
  ];

  const launchpads = [
    "PumpFun", "PumpSwap", "Raydium V4", "Raydium CRMM", "Bonk", "Meteora"
  ];

  const handleSave = () => {
    const filters = {
      activeTab,
      selectedLaunchpads,
      selectedMarketFilters,
      volumeTab,
      selectedVolumeFilters: volumeTab === "total" ? selectedVolumeFilters : selectedVolumeFilters,
      selectedHoldersFilters,
      selectedDevFilters,
    };
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedLaunchpads([]);
    setSelectedMarketFilters([]);
    setSelectedVolumeFilters([]);
    setSelectedHoldersFilters([]);
    setSelectedDevFilters([]);
    setVolumeTab("1m");
    setActiveTab("trending");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-sm font-semibold px-3 rounded-lg">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Customize your token filtering and display options
          </DialogDescription>
        </DialogHeader>

        {/* Top Tab Selector */}
        <div className="mb-4">
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
            {["trending", "new", "soon", "migration"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs font-semibold px-3 rounded-lg capitalize"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Launchpad Selector */}
        <div className="mb-4">
          <span className="text-xs font-medium text-muted-foreground mb-2 block">
            Launchpad
          </span>
          <div className="flex flex-wrap gap-2">
            {launchpads.map((lp) => (
              <button
                key={lp}
                onClick={() => {
                  setSelectedLaunchpads(prev =>
                    prev.includes(lp)
                      ? prev.filter(l => l !== lp)
                      : [...prev, lp]
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedLaunchpads.includes(lp)
                    ? "bg-teal-500/20 text-teal-500 border-teal-500/40"
                    : "bg-muted text-muted-foreground border-border/50"
                }`}
              >
                {lp}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <TabsTrigger value="dev">DEV</TabsTrigger>
          </TabsList>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">
                Market Filters
              </span>
              <div className="grid grid-cols-3 gap-2">
                {marketFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={filter.id}
                      checked={selectedMarketFilters.includes(filter.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMarketFilters(prev => [...prev, filter.id]);
                        } else {
                          setSelectedMarketFilters(prev => prev.filter(id => id !== filter.id));
                        }
                      }}
                    />
                    <span className="text-sm cursor-pointer">{filter.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MC */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                MC (K)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* Liquidity */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Liquidity
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* Age */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Age
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* ATH */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                ATH
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* Drop from ATH */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Drop from ATH (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* B. Curve */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                B. Curve (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* DEX Tax */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                DEX Tax
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* DEX Paid Boost */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                DEX Paid Boost ($)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>
          </TabsContent>

          {/* Volume Tab */}
          <TabsContent value="volume" className="space-y-4">
            <div className="mb-4">
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
                {["1m", "3m", "5m", "total"].map((tab) => (
                  <Button
                    key={tab}
                    variant={volumeTab === tab ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs font-semibold px-3 rounded-lg"
                    onClick={() => setVolumeTab(tab)}
                  >
                    {tab === "total" ? "Total" : tab}
                  </Button>
                ))}
              </div>
            </div>

            {/* Short timeframes */}
            {volumeTab !== "total" && (
              <>
                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Buy Volume
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Sell Volume
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Sell Bot Fee
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Makers
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>
              </>
            )}

            {/* Total */}
            {volumeTab === "total" && (
              <>
                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Volume
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Bot Fee
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Global Fees
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Buys
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Sells
                  </span>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" type="number" className="h-9 text-sm" />
                    <Input placeholder="Max" type="number" className="h-9 text-sm" />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Holders Tab */}
          <TabsContent value="holders" className="space-y-4">
            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-2">
              {holdersFilters.filter(f => f.id !== "bottraders" && f.id !== "newwallets").map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={filter.id}
                    checked={selectedHoldersFilters.includes(filter.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedHoldersFilters(prev => [...prev, filter.id]);
                      } else {
                        setSelectedHoldersFilters(prev => prev.filter(id => id !== filter.id));
                      }
                    }}
                  />
                  <span className="text-sm cursor-pointer">{filter.label}</span>
                </div>
              ))}
            </div>

            {/* Holders Min/Max */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Holders
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Top 10 Hold (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* Bot Traders - % and Count */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Bot Traders (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Bot Traders (Count)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            {/* New Wallets - % and Count */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                New Wallets (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                New Wallets (Count)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Dev Hold (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Bundle Hold (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Snipers Hold (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>
          </TabsContent>

          {/* DEV Tab */}
          <TabsContent value="dev" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {devFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={filter.id}
                    checked={selectedDevFilters.includes(filter.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDevFilters(prev => [...prev, filter.id]);
                      } else {
                        setSelectedDevFilters(prev => prev.filter(id => id !== filter.id));
                      }
                    }}
                  />
                  <span className="text-sm cursor-pointer">{filter.label}</span>
                </div>
              ))}
            </div>

            {/* Min/Max для DEV */}
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Launched
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Migrated
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Migrated (%)
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                AVG LAST 3 ATH
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                AVG LAST 3 Bot Fee
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                AVG LAST 5 ATH
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                AVG LAST 5 Bot Fee
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Dev SOL Balance
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Funded hours ago
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Funding SOL amount
              </span>
              <div className="flex items-center gap-2">
                <Input placeholder="Min" type="number" className="h-9 text-sm" />
                <Input placeholder="Max" type="number" className="h-9 text-sm" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Save Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
