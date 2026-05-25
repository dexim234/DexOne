"use client";

import Image from "next/image";
import { Copy, ExternalLink, Zap } from "lucide-react";
import { useState } from "react";

interface TrenchCardProps {
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
  mint?: string;
  symbol?: string;
  selectedMetrics?: string[];
  createdTimestamp?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  dexScreenerData?: {
    hasPaidPromotion?: boolean;
    hasLightning?: boolean;
  };
}

export default function TrenchCard({
  rank,
  logo,
  name,
  mc,
  mcChange,
  volume24h,
  volumeChange,
  priceChange1h,
  priceChange24h,
  priceChange7d,
  trades,
  holders,
  isVerified = false,
  mint = "",
  symbol = "",
  selectedMetrics = [],
  createdTimestamp,
  twitter,
  telegram,
  website,
  dexScreenerData,
}: TrenchCardProps) {
  const [copied, setCopied] = useState(false);

  const isPositive = (val: string) => !val.includes("-") && val !== "0.00%" && val !== "0.00";
  const isNegative = (val: string) => val.includes("-");

  const copyToClipboard = async () => {
    if (!mint) return;
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 7) return addr;
    return `${addr.slice(0, 3)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return null;
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const timeAgo = formatTimeAgo(createdTimestamp);

  const hasSocials = twitter || telegram || website;

  const renderMetric = (metricId: string) => {
    switch (metricId) {
      case "volume":
        return <div key="volume" className="flex items-center gap-1"><span className="text-muted-foreground">Vol</span><span className="font-medium">{volume24h}</span></div>;
      case "liquidity":
        return <div key="liquidity" className="flex items-center gap-1"><span className="text-muted-foreground">Liq</span><span className="font-medium">-</span></div>;
      case "transactions":
        return <div key="transactions" className="flex items-center gap-1"><span className="text-muted-foreground">Txns</span><span className="font-medium">{trades}</span></div>;
      case "ath":
        return <div key="ath" className="flex items-center gap-1"><span className="text-muted-foreground">ATH</span><span className="font-medium">-</span></div>;
      case "makersVol":
        return <div key="makersVol" className="flex items-center gap-1"><span className="text-muted-foreground">Makers</span><span className="font-medium">-</span></div>;
      case "priceChange":
        return (
          <div key="priceChange" className={`flex items-center gap-1 ${isPositive(priceChange24h) ? "text-green-500" : isNegative(priceChange24h) ? "text-red-500" : "text-muted-foreground"}`}>
            <span className="text-muted-foreground">24h</span>
            <span className="font-medium">{priceChange24h}</span>
          </div>
        );
      case "devTokensHistory":
        return <div key="devTokensHistory" className="flex items-center gap-1"><span className="text-muted-foreground">Dev Hist</span><span className="font-medium">-</span></div>;
      case "holders":
        return <div key="holders" className="flex items-center gap-1"><span className="text-muted-foreground">Holders</span><span className="font-medium">{holders}</span></div>;
      case "botTraders":
        return <div key="botTraders" className="flex items-center gap-1"><span className="text-muted-foreground">Bots</span><span className="font-medium">-</span></div>;
      case "botFee":
        return <div key="botFee" className="flex items-center gap-1"><span className="text-muted-foreground">Bot Fee</span><span className="font-medium">-</span></div>;
      case "globalFees":
        return <div key="globalFees" className="flex items-center gap-1"><span className="text-muted-foreground">Fees</span><span className="font-medium">-</span></div>;
      case "top10Hold":
        return <div key="top10Hold" className="flex items-center gap-1"><span className="text-muted-foreground">Top10</span><span className="font-medium">-</span></div>;
      case "devHold":
        return <div key="devHold" className="flex items-center gap-1"><span className="text-muted-foreground">Dev</span><span className="font-medium">-</span></div>;
      case "bundlers":
        return <div key="bundlers" className="flex items-center gap-1"><span className="text-muted-foreground">Bundlers</span><span className="font-medium">-</span></div>;
      case "snipers":
        return <div key="snipers" className="flex items-center gap-1"><span className="text-muted-foreground">Snipers</span><span className="font-medium">-</span></div>;
      case "freshWallets":
        return <div key="freshWallets" className="flex items-center gap-1"><span className="text-muted-foreground">Fresh</span><span className="font-medium">-</span></div>;
      case "lpBurn":
        return <div key="lpBurn" className="flex items-center gap-1"><span className="text-muted-foreground">LP Burn</span><span className="font-medium">-</span></div>;
      case "dexTax":
        return <div key="dexTax" className="flex items-center gap-1"><span className="text-muted-foreground">Tax</span><span className="font-medium">-</span></div>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors cursor-pointer">
      {/* Header with Logo, Address, Copy Button, Dex Paid Badge */}
      <div className="flex items-start gap-2 mb-2">
        {/* Logo */}
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image
            src={logo}
            alt={name}
            width={40}
            height={40}
            className="rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold text-sm truncate">{name}</span>
            {isVerified && (
              <svg className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Address with Copy */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="font-mono">{formatAddress(mint)}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Right Side: Copy Button, Dex Paid Badge, Time */}
        <div className="flex flex-col items-end gap-1">
          {/* Copy Address Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
            title="Copy address"
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {/* Dex Paid Badge */}
          {(dexScreenerData?.hasPaidPromotion || dexScreenerData?.hasLightning) && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-md border border-purple-500/30">
              {/* Owl Icon for paid promotion */}
              {dexScreenerData?.hasPaidPromotion && (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm3.5 3c.83 0 1.5-.67 1.5-1.5S11.33 11 10.5 11s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5-3c.83 0 1.5-.67 1.5-1.5S14.83 8 14 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5 3c.83 0 1.5-.67 1.5-1.5S17.83 11 17 11s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 15.5c1.33 0 2.5-.73 3.05-1.79-.18-.08-.37-.15-.56-.2-.46 1.02-1.46 1.73-2.55 1.73-1.09 0-2.09-.71-2.55-1.73-.19.05-.38.12-.56.2.55 1.06 1.72 1.79 3.05 1.79z"/>
                </svg>
              )}
              {/* Lightning for extra features */}
              {dexScreenerData?.hasLightning && (
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
              )}
            </div>
          )}

          {/* Time Ago */}
          {timeAgo && (
            <div className="text-xs text-muted-foreground font-medium">
              {timeAgo}
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      {hasSocials && (
        <div className="flex items-center gap-1.5 mb-2">
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-accent rounded transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          )}
          {telegram && (
            <a href={telegram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-accent rounded transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-accent rounded transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Metrics Grid based on selectedMetrics */}
      {selectedMetrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {selectedMetrics.map((metricId) => (
            <div key={metricId} className="flex items-center gap-1">
              {renderMetric(metricId)}
            </div>
          ))}
        </div>
      ) : (
        /* Default metrics */
        <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs">
          <div className="col-span-3 flex items-center gap-1 mb-1">
            <span className="text-muted-foreground">MC</span>
            <span className="font-medium text-teal">{mc}</span>
            <span className={isPositive(mcChange) ? "text-green-500" : isNegative(mcChange) ? "text-red-500" : "text-muted-foreground"}>
              {mcChange}
            </span>
          </div>
          
          <div className="col-span-3 flex items-center gap-1 mb-1">
            <span className="text-muted-foreground">24h</span>
            <span className="font-medium">{volume24h}</span>
            <span className={isPositive(volumeChange) ? "text-green-500" : isNegative(volumeChange) ? "text-red-500" : "text-muted-foreground"}>
              {volumeChange}
            </span>
          </div>

          <div className={isPositive(priceChange1h) ? "text-green-500" : isNegative(priceChange1h) ? "text-red-500" : "text-muted-foreground"}>
            {priceChange1h}
          </div>
          <div className={isPositive(priceChange24h) ? "text-green-500" : isNegative(priceChange24h) ? "text-red-500" : "text-muted-foreground"}>
            {priceChange24h}
          </div>
          <div className={isPositive(priceChange7d) ? "text-green-500" : isNegative(priceChange7d) ? "text-red-500" : "text-muted-foreground"}>
            {priceChange7d}
          </div>

          <div className="col-span-3 flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-xs">{trades}</span>
            <span className="text-muted-foreground text-xs">{holders}</span>
          </div>
        </div>
      )}
    </div>
  );
}
