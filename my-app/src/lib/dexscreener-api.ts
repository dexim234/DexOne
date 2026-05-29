export interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
}

export interface DexScreenerTransactionStats {
  buys: number;
  sells: number;
}

export interface DexScreenerTxns {
  m5: DexScreenerTransactionStats;
  h1: DexScreenerTransactionStats;
  h6: DexScreenerTransactionStats;
  h24: DexScreenerTransactionStats;
}

export interface DexScreenerVolume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

export interface DexScreenerPriceChange {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

export interface DexScreenerLiquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface DexScreenerSocial {
  type: string;
  url: string;
}

export interface DexScreenerWebsite {
  label: string;
  url: string;
}

export interface DexScreenerInfo {
  imageUrl?: string;
  websites?: DexScreenerWebsite[];
  socials?: DexScreenerSocial[];
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceNative: string;
  priceUsd: string;
  txns: DexScreenerTxns;
  volume: DexScreenerVolume;
  priceChange: DexScreenerPriceChange;
  liquidity: DexScreenerLiquidity;
  fdv?: number;
  marketCap?: number;
  info?: DexScreenerInfo;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

export interface DexScreenerProfileLink {
  type: string;
  label: string;
  url: string;
}

export interface DexScreenerProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: DexScreenerProfileLink[];
}

export interface TokenDetailData {
  name: string;
  symbol: string;
  address: string;
  imageUrl: string;
  priceUsd: string;
  marketCap: string;
  fdv: string;
  liquidity: string;
  volume24h: string;
  priceChange1h: string;
  priceChange24h: string;
  txns24h: string;
  buys24h: number;
  sells24h: number;
  socials: { type: string; url: string }[];
  websites: { label: string; url: string }[];
  description: string;
  pairUrl: string;
  dexId: string;
}

class DexScreenerApiService {
  private proxyUrl = '/api/dexscreener-proxy';

  private async fetchFromProxy(endpoint: string, searchParams?: URLSearchParams): Promise<any> {
    const url = new URL(
      this.proxyUrl,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    url.searchParams.set('endpoint', endpoint);
    if (searchParams) {
      searchParams.forEach((value, key) => url.searchParams.set(key, value));
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `DexScreener proxy error: ${res.status}`);
    }
    return res.json();
  }

  async getTokensByAddresses(addresses: string[]): Promise<DexScreenerPair[]> {
    if (!addresses.length) return [];
    const endpoint = `tokens/${addresses.join(',')}`;
    const data: DexScreenerResponse = await this.fetchFromProxy(endpoint);
    return data.pairs || [];
  }

  async searchTokens(query: string): Promise<DexScreenerPair[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({ q: query.trim() });
    const data: DexScreenerResponse = await this.fetchFromProxy('search', params);
    return (data.pairs || []).filter((p) => p.chainId === 'solana');
  }

  async getTokenProfiles(): Promise<DexScreenerProfile[]> {
    return this.fetchFromProxy('token-profiles/latest/v1');
  }

  async getTokenData(mint: string): Promise<TokenDetailData | null> {
    try {
      const [pairs, profiles] = await Promise.all([
        this.getTokensByAddresses([mint]),
        this.getTokenProfiles(),
      ]);

      const solanaPairs = pairs.filter((p) => p.chainId === 'solana');
      if (!solanaPairs.length) return null;

      // Pick pair with highest liquidity
      const bestPair = solanaPairs.sort(
        (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];

      const profile = profiles.find(
        (p) => p.tokenAddress === mint && p.chainId === 'solana'
      );

      const fmt = (n?: number) => {
        if (n === undefined || n === null || isNaN(n)) return '$0';
        if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
        return `$${n.toFixed(2)}`;
      };

      const fmtPct = (n?: number) => {
        if (n === undefined || n === null || isNaN(n)) return '0.00%';
        return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
      };

      const txns24h = bestPair.txns?.h24;
      const totalTxns = (txns24h?.buys || 0) + (txns24h?.sells || 0);

      const socialsFromProfile =
        profile?.links
          ?.filter((l) => ['twitter', 'telegram', 'discord'].includes(l.type))
          .map((l) => ({ type: l.type, url: l.url })) || [];

      const websitesFromProfile =
        profile?.links
          ?.filter((l) => l.type === 'website')
          .map((l) => ({ label: l.label || 'Website', url: l.url })) || [];

      return {
        name: bestPair.baseToken?.name || profile?.header || 'Unknown',
        symbol: bestPair.baseToken?.symbol || '???',
        address: mint,
        imageUrl: bestPair.info?.imageUrl || profile?.icon || '/placeholder.png',
        priceUsd: bestPair.priceUsd ? `$${Number(bestPair.priceUsd).toFixed(6)}` : '$0',
        marketCap: fmt(bestPair.marketCap),
        fdv: fmt(bestPair.fdv),
        liquidity: fmt(bestPair.liquidity?.usd),
        volume24h: fmt(bestPair.volume?.h24),
        priceChange1h: fmtPct(bestPair.priceChange?.h1),
        priceChange24h: fmtPct(bestPair.priceChange?.h24),
        txns24h: totalTxns.toLocaleString(),
        buys24h: txns24h?.buys || 0,
        sells24h: txns24h?.sells || 0,
        socials: bestPair.info?.socials?.length
          ? bestPair.info.socials
          : socialsFromProfile,
        websites: bestPair.info?.websites?.length
          ? bestPair.info.websites
          : websitesFromProfile,
        description: profile?.description || '',
        pairUrl: bestPair.url || `https://dexscreener.com/solana/${mint}`,
        dexId: bestPair.dexId || 'unknown',
      };
    } catch (error) {
      console.error('DexScreener API error:', error);
      return null;
    }
  }
}

export const dexScreenerApi = new DexScreenerApiService();
