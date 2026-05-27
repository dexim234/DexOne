"use client";

import Image from "next/image";
import { Copy, Zap, Crown, Users, MessageSquare, Ship, Flame, Target, Package } from "lucide-react";
import { useState, useEffect } from "react";

interface TrenchCardProps {
  rank: string;
  logo: string;
  name: string;
  symbol?: string;
  mc: string;
  volume24h: string;
  mint?: string;
  createdTimestamp?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  selectedMetrics?: string[];
  // Дополнительные метрики
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
  rank: _rank,
  logo,
  name,
  symbol,
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
    if (addr.length < 10) return addr;
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

  return (
    <div className="relative rounded-xl border border-border/40 bg-card p-3 hover:bg-accent/20 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        {/* Left: Avatar + Address */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-16">
          <div className="relative h-16 w-16 rounded-lg border-2 border-teal-500/60 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <Image
              src={logo}
              alt={name}
              width={64}
              height={64}
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
            className="flex items-center justify-center gap-0.5 w-full text-[10px] text-muted-foreground hover:text-teal-400 transition-colors group/addr"
          >
            <span className="font-mono">{formatAddress(mint)}</span>
            <Copy className="h-2.5 w-2.5 opacity-0 group-hover/addr:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Row 1: Name + Icons */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm text-foreground truncate">{name}</span>
            {symbol && (
              <span className="text-xs text-muted-foreground shrink-0 uppercase">{symbol}</span>
            )}
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

          {/* Row 2: Time + Socials */}
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

        {/* Right: V/MC + 1M + Action button */}
        <div className="shrink-0 flex flex-col justify-between items-end">
          <div className="flex flex-col items-end gap-0.5 text-[11px]">
            <span className="text-muted-foreground">V <span className="text-teal-400 font-semibold">{volume24h}</span></span>
            <span className="text-muted-foreground">MC <span className="text-teal-400 font-semibold">{mc}</span></span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>1M</span>
              <span className="text-foreground font-medium">{watchers}/{kingOfTheHillTotal}</span>
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
