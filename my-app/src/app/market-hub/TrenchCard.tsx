"use client";

import Image from "next/image";
import { formatSolanaAddress, getSolanaExplorerUrl } from "@/lib/solana-config";

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
  imageUrl?: string;
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
  mint,
  imageUrl,
}: TrenchCardProps) {
  const isPositive = (val: string) => !val.includes("-") && val !== "0.00%" && val !== "0.00";
  const isNegative = (val: string) => val.includes("-");

  const handleCardClick = () => {
    if (mint) {
      const url = getSolanaExplorerUrl(mint);
      window.open(url, '_blank');
    }
  };

  // Функция для обработки IPFS изображений
  const getImageSrc = (src: string) => {
    if (!src) return '/placeholder.png';
    
    // Если уже полный HTTP URL
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // IPFS через Cloudflare
    if (src.startsWith('ipfs://')) {
      return `https://cloudflare-ipfs.com/ipfs/${src.replace('ipfs://', '')}`;
    }
    
    // IPFS с /ipfs/
    if (src.includes('/ipfs/')) {
      return src.replace('ipfs:', 'https:').replace('//ipfs/', '/ipfs/');
    }
    
    // Просто хэш IPFS (43-44 символа)
    if (src.length === 44 || src.length === 43) {
      return `https://cloudflare-ipfs.com/ipfs/${src}`;
    }
    
    // Относительный путь - пробуем IPFS
    return `https://cloudflare-ipfs.com/ipfs/${src}`;
  };

  const displayImage = getImageSrc(imageUrl || logo || '');

  return (
    <div 
      className="rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with Rank, Logo, Name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground w-4">{rank}</span>
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image
            src={displayImage || '/placeholder.png'}
            alt={name}
            width={32}
            height={32}
            className="rounded-lg object-cover"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
            }}
          />
        </div>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="font-medium truncate">{name}</span>
          {isVerified && (
            <svg className="h-3 w-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs">
        {/* Row 1: MC */}
        <div className="col-span-3 flex items-center gap-1 mb-1">
          <span className="text-muted-foreground">MC</span>
          <span className="font-medium text-teal">{mc}</span>
          <span className={isPositive(mcChange) ? "text-green-500" : isNegative(mcChange) ? "text-red-500" : "text-muted-foreground"}>
            {mcChange}
          </span>
        </div>
        
        {/* Row 2: 24h Volume */}
        <div className="col-span-3 flex items-center gap-1 mb-1">
          <span className="text-muted-foreground">24h</span>
          <span className="font-medium">{volume24h}</span>
          <span className={isPositive(volumeChange) ? "text-green-500" : isNegative(volumeChange) ? "text-red-500" : "text-muted-foreground"}>
            {volumeChange}
          </span>
        </div>

        {/* Row 3: Price changes */}
        <div className={isPositive(priceChange1h) ? "text-green-500" : isNegative(priceChange1h) ? "text-red-500" : "text-muted-foreground"}>
          {priceChange1h}
        </div>
        <div className={isPositive(priceChange24h) ? "text-green-500" : isNegative(priceChange24h) ? "text-red-500" : "text-muted-foreground"}>
          {priceChange24h}
        </div>
        <div className={isPositive(priceChange7d) ? "text-green-500" : isNegative(priceChange7d) ? "text-red-500" : "text-muted-foreground"}>
          {priceChange7d}
        </div>

        {/* Row 4: Trades and Holders */}
        <div className="col-span-3 flex items-center gap-2 mt-1">
          <span className="text-muted-foreground text-xs">{trades}</span>
          <span className="text-muted-foreground text-xs">{holders}</span>
        </div>
      </div>
    </div>
  );
}
