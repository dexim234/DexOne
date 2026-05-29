"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dexScreenerApi } from "@/lib/dexscreener-api";

interface SearchResult {
  name: string;
  symbol: string;
  address: string;
  priceUsd: string;
  priceChange24h: string;
  volume24h: string;
  liquidity: string;
  pairUrl: string;
  imageUrl: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    // Debounce запрос
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const pairs = await dexScreenerApi.searchTokens(query);
        const mapped: SearchResult[] = pairs.slice(0, 10).map((pair) => ({
          name: pair.baseToken?.name || "Unknown",
          symbol: pair.baseToken?.symbol || "???",
          address: pair.baseToken?.address || "",
          priceUsd: pair.priceUsd ? `$${Number(pair.priceUsd).toFixed(6)}` : "$0",
          priceChange24h: `${pair.priceChange?.h24 >= 0 ? "+" : ""}${(pair.priceChange?.h24 || 0).toFixed(2)}%`,
          volume24h: pair.volume?.h24
            ? pair.volume.h24 >= 1_000_000
              ? `$${(pair.volume.h24 / 1_000_000).toFixed(2)}M`
              : `$${(pair.volume.h24 / 1_000).toFixed(2)}K`
            : "$0",
          liquidity: pair.liquidity?.usd
            ? pair.liquidity.usd >= 1_000_000
              ? `$${(pair.liquidity.usd / 1_000_000).toFixed(2)}M`
              : `$${(pair.liquidity.usd / 1_000).toFixed(2)}K`
            : "$0",
          pairUrl: pair.url,
          imageUrl: pair.info?.imageUrl || "/placeholder.png",
        }));
        setResults(mapped);
      } catch (err) {
        console.error("Search error:", err);
        setError("Ошибка поиска. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (address: string) => {
    window.location.href = `/market-hub/${address}`;
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Search className="h-3.5 w-3.5 mr-2" />
          Search Token
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Tokens</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search by name, symbol, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && query && results.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No results found
            </div>
          )}
          {!query && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Start typing to search for tokens
            </div>
          )}
          {results.map((result, index) => (
            <div
              key={result.address || index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors mb-2"
              onClick={() => handleSelect(result.address)}
            >
              <img
                src={result.imageUrl}
                alt={result.name}
                className="h-10 w-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{result.name}</span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {result.symbol}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate font-mono">
                  {result.address}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{result.priceUsd}</div>
                <div
                  className={`text-xs ${
                    result.priceChange24h.startsWith("+")
                      ? "text-green-500"
                      : result.priceChange24h.startsWith("-")
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {result.priceChange24h}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
