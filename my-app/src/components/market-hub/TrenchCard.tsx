"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, ExternalLink, Zap } from "lucide-react";

interface TrenchCardProps {
  rank: string;
  logo: string;
  name: string;
  symbol?: string;
  mc: string;
  volume24h: string;
  mint?: string;
  createdTimestamp?: number;
  isVerified?: boolean;
  twitter?: string;
  telegram?: string;
  website?: string;
  selectedMetrics?: string[];
  kingOfTheHillRank?: string;
  kingOfTheHillTotal?: string;
  watchers?: string;
  replies?: string;
  replyRate?: string;
  buySellRatio?: string;
  fomoScore?: string;
  devHold?: string;
  top10Hold?: string;
  lpBurn?: string;
  snipersCount?: string;
  bundlersCount?: string;
  freshWallets?: string;
  botTraders?: string;
  dexTaxBuy?: string;
  dexTaxSell?: string;
}

export default function TrenchCard({
  logo,
  name,
  symbol,
  mc,
  volume24h,
  mint = "",
  createdTimestamp,
  isVerified = false,
  twitter,
  website,
}: TrenchCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const imgTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
    imgTimeoutRef.current = setTimeout(() => setImageFailed(true), 5000);
    return () => {
      if (imgTimeoutRef.current) clearTimeout(imgTimeoutRef.current);
    };
  }, [logo]);

  const copyToClipboard = async () => {
    if (!mint) return;
    try {
      await navigator.clipboard.writeText(mint);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 9) return addr;
    return `${addr.slice(0, 4)}...pump`;
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
  const displaySymbol = symbol ? `$${symbol}` : name;
  const displayName = symbol && name && symbol !== name ? name : undefined;

  return (
    <div className="relative rounded-xl border border-border/40 bg-card p-2.5 hover:bg-accent/20 transition-colors cursor-pointer group">
      <div className="flex gap-2.5">
        {/* Left: Avatar + Address */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-[72px]">
          <div className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden bg-muted border border-border/30">
            {!imageLoaded && !imageFailed && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={imageFailed ? "/placeholder.png" : (logo || "/placeholder.png")}
              alt={name}
              width={72}
              height={72}
              className={`w-full h-full object-cover transition-opacity duration-200 ${(imageLoaded || imageFailed) ? "opacity-100" : "opacity-0"}`}
              onLoad={() => {
                setImageLoaded(true);
                if (imgTimeoutRef.current) clearTimeout(imgTimeoutRef.current);
              }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("placeholder.png")) target.src = "/placeholder.png";
                setImageLoaded(true);
                setImageFailed(true);
                if (imgTimeoutRef.current) clearTimeout(imgTimeoutRef.current);
              }}
              loading="eager"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="text-[10px] text-muted-foreground hover:text-teal-400 transition-colors font-mono text-center"
          >
            {formatAddress(mint)}
          </button>
        </div>

        {/* Center: Token Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Row 1: Symbol + Name + Time */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-foreground truncate">
                  {displaySymbol}
                </span>
                {isVerified && (
                  <svg className="h-3.5 w-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {displayName && (
                <span className="text-[11px] text-muted-foreground truncate leading-tight">
                  {displayName}
                </span>
              )}
            </div>
            {timeAgo && (
              <span className="text-[10px] text-teal-400 font-medium shrink-0 mt-0.5">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Row 2: Socials + MC/Vol */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {twitter && (
                <a href={twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] shrink-0">
              <span className="text-muted-foreground">
                MC <span className="text-teal-400 font-semibold">{mc}</span>
              </span>
              <span className="text-muted-foreground">
                Vol <span className="text-teal-400 font-semibold">{volume24h}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Buy Button */}
        <div className="shrink-0 flex flex-col justify-center">
          <button
            onClick={(e) => e.stopPropagation()}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 transition-colors"
          >
            <Zap className="h-4 w-4 text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrenchCard({
  rank: _rank,
  logo,
  name,
  mc,
  volume24h,
  mint = "",
  createdTimestamp,
  twitter,
  website,
  selectedMetrics: _selectedMetrics,
  kingOfTheHillRank = "-",
  kingOfTheHillTotal = "-",
  watchers = "-",
  replies = "-",
  replyRate = "-",
  buySellRatio = "-",
  fomoScore = "-",
  devHold = "0",
  top10Hold = "0",
  lpBurn = "0",
  snipersCount = "0",
  bundlersCount = "0",
}: TrenchCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [logo]);

  const copyToClipboard = async () => {
    if (!mint) return;
    try {
      await navigator.clipboard.writeText(mint);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 9) return addr;
    return `${addr.slice(0, 4)}...pump`;
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

  return (
    <div className="relative rounded-xl border border-border/40 bg-card p-3 hover:bg-accent/20 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        {/* Left: Avatar + Address */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-[52px]">
          <div className="relative h-[52px] w-[52px] rounded-lg border-2 border-teal-500/60 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <Image
              src={logo}
              alt={name}
              width={52}
              height={52}
              className={`object-cover w-full h-full transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
                setImageLoaded(true);
              }}
              loading="eager"
              priority
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-teal-400 transition-colors group/addr"
          >
            <span className="font-mono">{formatAddress(mint)}</span>
            <Copy className="h-2.5 w-2.5 opacity-0 group-hover/addr:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Row 1: Name + Icons + MC/Vol */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-foreground truncate">{name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                className="shrink-0 text-muted-foreground hover:text-teal-400 transition-colors"
                title="Copy address"
              >
                <Copy className="h-3 w-3" />
              </button>
              <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">$</span>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0 ml-2">
              <span className="text-muted-foreground">V <span className="text-teal-400 font-semibold">{volume24h}</span></span>
              <span className="text-muted-foreground">MC <span className="text-teal-400 font-semibold">{mc}</span></span>
            </div>
          </div>

          {/* Row 2: Time + Socials + 1M/Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {timeAgo && (
                <span className="text-xs text-teal-400 font-medium">{timeAgo}</span>
              )}
              <div className="flex items-center gap-1.5">
                {twitter && (
                  <a href={twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <span>1M</span>
              <span className="text-foreground font-medium">{watchers}/{kingOfTheHillTotal}</span>
            </div>
          </div>

          {/* Row 3: Main stats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-0.5">
              <Crown className="h-3 w-3 text-amber-400" />
              <span className="text-teal-400 font-semibold">{kingOfTheHillRank}</span>
              <span className="text-muted-foreground">/{kingOfTheHillTotal}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Users className="h-3 w-3 text-cyan-400" />
              <span className="text-teal-400 font-semibold">{watchers}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3 text-green-400" />
              <span className="text-teal-400 font-semibold">{replies}</span>
              <span className="text-muted-foreground">/{replyRate}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Ship className="h-3 w-3 text-blue-400" />
              <span className="text-teal-400 font-semibold">{buySellRatio}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground font-bold">F</span>
              <span className="text-teal-400 font-semibold">{fomoScore}</span>
            </div>
          </div>

          {/* Row 4: Percent badges */}
          <div className="flex items-center gap-2.5 text-[11px]">
            <div className="flex items-center gap-0.5">
              <Users className="h-3 w-3 text-cyan-400" />
              <span className="text-teal-400 font-semibold">{devHold}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Crown className="h-3 w-3 text-amber-400" />
              <span className="text-teal-400 font-semibold">{top10Hold}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Flame className="h-3 w-3 text-orange-400" />
              <span className="text-teal-400 font-semibold">{lpBurn}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Target className="h-3 w-3 text-red-400" />
              <span className="text-teal-400 font-semibold">{snipersCount}%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Package className="h-3 w-3 text-lime-400" />
              <span className="text-teal-400 font-semibold">{bundlersCount}%</span>
            </div>
          </div>
        </div>

        {/* Right: Action button */}
        <div className="shrink-0 flex flex-col justify-end">
          <button
            onClick={(e) => e.stopPropagation()}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 transition-colors"
          >
            <Zap className="h-5 w-5 text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
