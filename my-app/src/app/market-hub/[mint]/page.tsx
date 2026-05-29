"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  Droplets,
  Activity,
  Users,
  Clock,
  Flame,
  Target,
  Package,
  Crown,
  Globe,
  MessageCircle,
} from "lucide-react";
import { pumpFunApi, TokenMarketData } from "@/lib/pump-fun-api";
import { dexScreenerApi, TokenDetailData } from "@/lib/dexscreener-api";

export default function TokenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mint = params.mint as string;

  const [dexToken, setDexToken] = useState<TokenDetailData | null>(null);
  const [pumpToken, setPumpToken] = useState<TokenMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      if (!mint) return;
      setLoading(true);
      try {
        const [dexData, pumpData] = await Promise.all([
          dexScreenerApi.getTokenData(mint).catch((err) => {
            console.warn("DexScreener fetch failed:", err);
            return null;
          }),
          pumpFunApi.getCoinById(mint).catch((err) => {
            console.warn("Pump.fun fetch failed:", err);
            return null;
          }),
        ]);

        if (dexData) setDexToken(dexData);
        if (pumpData) setPumpToken(pumpFunApi.convertToMarketData(pumpData, 1));
      } catch (err) {
        console.error("Error fetching token:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [mint]);

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getGeckoTerminalUrl = (tokenMint: string) => {
    return `https://www.geckoterminal.com/solana/tokens/${tokenMint}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`;
  };

  const getDexScreenerUrl = (tokenMint: string) => {
    return `https://dexscreener.com/solana/${tokenMint}`;
  };

  const getPumpFunUrl = (tokenMint: string) => {
    return `https://pump.fun/coin/${tokenMint}`;
  };

  const getSolscanUrl = (tokenMint: string) => {
    return `https://solscan.io/token/${tokenMint}`;
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "twitter":
        return <TrendingUp className="h-4 w-4" />;
      case "telegram":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading token data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dexToken && !pumpToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold mb-2">Token not found</p>
          <p className="text-muted-foreground">
            Could not fetch token data for {formatAddress(mint)}
          </p>
        </div>
      </div>
    );
  }

  // Use DexScreener as primary, Pump.fun as fallback for display values
  const displayName = dexToken?.name || pumpToken?.name || "Unknown Token";
  const displaySymbol = dexToken?.symbol || pumpToken?.symbol || "???";
  const displayImage = dexToken?.imageUrl || pumpToken?.logo || "/placeholder.png";
  const displayMc = dexToken?.marketCap || pumpToken?.mc || "$0";
  const displayMcChange = pumpToken?.mcChange || "0.00%";
  const displayVolume24h = dexToken?.volume24h || pumpToken?.volume24h || "$0";
  const displayVolumeChange = pumpToken?.volumeChange || "0.00%";
  const displayHolders = pumpToken?.holders || "0";
  const displayTrades = dexToken?.txns24h || pumpToken?.trades || "0";
  const displayPriceChange1h = dexToken?.priceChange1h || pumpToken?.priceChange1h || "0.00%";
  const displayPriceChange24h = dexToken?.priceChange24h || pumpToken?.priceChange24h || "0.00%";
  const displayPriceChange7d = pumpToken?.priceChange7d || "0.00%";

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => router.push("/market-hub")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Market Hub
      </Button>

      {/* Token Header */}
      <div className="bg-card rounded-xl border border-border/50 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-xl border-2 border-teal-500/60 overflow-hidden shrink-0">
              <Image
                src={displayImage}
                alt={displayName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {displaySymbol && (
                  <Badge variant="secondary" className="uppercase text-xs">
                    {displaySymbol}
                  </Badge>
                )}
                {pumpToken?.isVerified && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-muted-foreground">
                  {formatAddress(mint)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyMint}
                >
                  {copied ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {dexToken?.priceUsd && (
                <div className="text-lg font-bold text-teal-500 mt-1">
                  {dexToken.priceUsd}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPumpFunUrl(mint), "_blank")}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
              Pump.fun
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getDexScreenerUrl(mint), "_blank")}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              DexScreener
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getSolscanUrl(mint), "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Solscan
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/30">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium">Market Cap</span>
            </div>
            <div className="text-xl font-bold">{displayMc}</div>
            <div
              className={`text-xs ${
                displayMcChange?.startsWith("+")
                  ? "text-green-500"
                  : displayMcChange?.startsWith("-")
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {displayMcChange}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-medium">24h Volume</span>
            </div>
            <div className="text-xl font-bold">{displayVolume24h}</div>
            <div
              className={`text-xs ${
                displayVolumeChange?.startsWith("+")
                  ? "text-green-500"
                  : displayVolumeChange?.startsWith("-")
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {displayVolumeChange}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-xs font-medium">Holders</span>
            </div>
            <div className="text-xl font-bold">{displayHolders}</div>
            <div className="text-xs text-muted-foreground">Total holders</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-medium">Trades</span>
            </div>
            <div className="text-xl font-bold">{displayTrades}</div>
            <div className="text-xs text-muted-foreground">24h trades</div>
          </div>
        </div>

        {/* DexScreener Extra Stats */}
        {dexToken && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {dexToken.liquidity !== "$0" && (
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
                <div className="text-lg font-bold">{dexToken.liquidity}</div>
              </div>
            )}
            {dexToken.fdv !== "$0" && (
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">FDV</div>
                <div className="text-lg font-bold">{dexToken.fdv}</div>
              </div>
            )}
            {dexToken.buys24h > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Buys</div>
                <div className="text-lg font-bold text-green-500">
                  {dexToken.buys24h.toLocaleString()}
                </div>
              </div>
            )}
            {dexToken.sells24h > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">24h Sells</div>
                <div className="text-lg font-bold text-red-500">
                  {dexToken.sells24h.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price Changes */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">1h Change</div>
            <div
              className={`text-lg font-bold ${
                displayPriceChange1h?.startsWith("+")
                  ? "text-green-500"
                  : displayPriceChange1h?.startsWith("-")
                  ? "text-red-500"
                  : ""
              }`}
            >
              {displayPriceChange1h}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">24h Change</div>
            <div
              className={`text-lg font-bold ${
                displayPriceChange24h?.startsWith("+")
                  ? "text-green-500"
                  : displayPriceChange24h?.startsWith("-")
                  ? "text-red-500"
                  : ""
              }`}
            >
              {displayPriceChange24h}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">7d Change</div>
            <div
              className={`text-lg font-bold ${
                displayPriceChange7d?.startsWith("+")
                  ? "text-green-500"
                  : displayPriceChange7d?.startsWith("-")
                  ? "text-red-500"
                  : ""
              }`}
            >
              {displayPriceChange7d}
            </div>
          </div>
        </div>

        {/* Socials & Description */}
        {(dexToken?.websites?.length ||
          dexToken?.socials?.length ||
          dexToken?.description) && (
          <div className="mt-6 pt-6 border-t border-border/30">
            {dexToken?.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {dexToken.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {dexToken?.websites?.map((site, i) => (
                <Button
                  key={`web-${i}`}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(site.url, "_blank")}
                >
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  {site.label}
                </Button>
              ))}
              {dexToken?.socials?.map((social, i) => (
                <Button
                  key={`soc-${i}`}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(social.url, "_blank")}
                >
                  {getSocialIcon(social.type)}
                  <span className="ml-1.5 capitalize">{social.type}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-card rounded-xl border border-border/50 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            Price Chart
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
            <span className="flex items-center gap-1 text-xs text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Real-time
            </span>
          </div>
        </div>
        <div
          className="w-full rounded-lg overflow-hidden border border-border/30"
          style={{ height: "500px" }}
        >
          <iframe
            src={getGeckoTerminalUrl(mint)}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="clipboard-write"
            className="bg-background"
            title="Token Price Chart"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Chart powered by GeckoTerminal · Data updates in real-time
        </p>
      </div>

      {/* Token Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            Token Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dev Hold</span>
              <span className="font-medium">{pumpToken?.devHold || "0"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Top 10 Hold</span>
              <span className="font-medium">{pumpToken?.top10Hold || "0"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LP Burn</span>
              <span className="font-medium">{pumpToken?.lpBurn || "0"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Snipers</span>
              <span className="font-medium">{pumpToken?.snipersCount || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundlers</span>
              <span className="font-medium">{pumpToken?.bundlersCount || "0"}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-red-400" />
            Activity Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Watchers</span>
              <span className="font-medium">{pumpToken?.watchers || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Replies</span>
              <span className="font-medium">{pumpToken?.replies || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reply Rate</span>
              <span className="font-medium">{pumpToken?.replyRate || "0"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buy/Sell Ratio</span>
              <span className="font-medium">{pumpToken?.buySellRatio || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">FOMO Score</span>
              <span className="font-medium">{pumpToken?.fomoScore || "0"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
