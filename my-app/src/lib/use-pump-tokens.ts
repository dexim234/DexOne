import { useEffect, useState, useCallback, useRef } from 'react';
import { pumpFunApi, TokenMarketData, LaunchpadSource } from './pump-fun-api';
import { getPumpSwapTokens, getLetsBonkTokens, getMeteoraTokens } from './multi-launchpad-api';

export interface UsePumpTokensOptions {
  columnType: 'new' | 'soon' | 'migration';
  refreshInterval?: number;
  filters?: any;
}

export interface UsePumpTokensReturn {
  tokens: TokenMarketData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
  wsConnected: boolean;
}

// Функция для получения новых токенов через DexScreener
async function fetchNewTokensFromDexScreener(limit: number = 50, maxAgeHours: number = 24): Promise<TokenMarketData[]> {
  try {
    const response = await fetch(
      `/api/new-tokens?limit=${limit}&maxAgeHours=${maxAgeHours}&_cb=${Date.now()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch new tokens: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data.tokens || [];

    return tokens.map((pair: any, index: number) => ({
      rank: (index + 1).toString(),
      logo: pair.info?.imageUrl || pair.info?.logo || '/placeholder.png',
      name: pair.baseToken?.name || 'Unknown',
      symbol: pair.baseToken?.symbol || '',
      mint: pair.baseToken?.address || '',
      mc: formatNumber(pair.marketCap || pair.fdv || 0),
      mcChange: `${(pair.priceChange?.h24 || 0) >= 0 ? '+' : ''}${(pair.priceChange?.h24 || 0).toFixed(2)}%`,
      volume24h: formatNumber(pair.volume?.h24 || 0),
      volumeChange: '0.00%',
      priceChange1h: `${(pair.priceChange?.h1 || 0) >= 0 ? '+' : ''}${(pair.priceChange?.h1 || 0).toFixed(2)}%`,
      priceChange24h: `${(pair.priceChange?.h24 || 0) >= 0 ? '+' : ''}${(pair.priceChange?.h24 || 0).toFixed(2)}%`,
      priceChange7d: '0.00%',
      trades: ((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)).toString(),
      holders: '-',
      isVerified: pair.info?.verified || false,
      imageUrl: pair.info?.imageUrl || pair.info?.logo || '/placeholder.png',
      createdTimestamp: pair.pairCreatedAt ? Math.floor(pair.pairCreatedAt / 1000) : Date.now() / 1000,
      twitter: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
      telegram: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
      website: pair.info?.socials?.find((s: any) => s.type === 'website')?.url,
      source: (pair.source || 'pumpfun') as LaunchpadSource,
      kingOfTheHillRank: '-',
      kingOfTheHillTotal: '-',
      watchers: pair.fdw?.toString() || '-',
      replies: '-',
      replyRate: '-',
      buySellRatio: '-',
      fomoScore: '-',
      devHold: '-',
      top10Hold: '-',
      lpBurn: '-',
      snipersCount: '-',
      bundlersCount: '-',
      freshWallets: '-',
      botTraders: '-',
      dexTaxBuy: '-',
      dexTaxSell: '-',
    }));
  } catch (error) {
    console.error('Error fetching new tokens from DexScreener:', error);
    return [];
  }
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  if (num === 0) return '$0';
  return `$${num.toFixed(2)}`;
}

/**
 * Хук для получения токенов Pump.fun с поддержкой реального времени
 */
export function usePumpTokens({
  columnType,
  refreshInterval = 3000, // 3 секунды
  filters,
}: UsePumpTokensOptions): UsePumpTokensReturn {
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функция загрузки токенов
  const loadTokens = useCallback(async () => {
    try {
      setError(null);

      let newTokens: TokenMarketData[];

      switch (columnType) {
        case 'new': {
          // Используем новый API который получает токены со всех лаунчпадов
          // Фильтруем по возрасту (максимум 24 часа) и сортируем по времени создания
          const dexScreenerTokens = await fetchNewTokensFromDexScreener(30, 24);
          
          console.log(`[New] Loaded ${dexScreenerTokens.length} tokens from DexScreener (all launchpads)`);
          
          newTokens = dexScreenerTokens.slice(0, 20);
          break;
        }
        case 'soon': {
          const pumpFunTokens = await pumpFunApi.getSoonTokens(20);
          
          const [pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            getPumpSwapTokens(10),
            getLetsBonkTokens(10),
            getMeteoraTokens(10),
          ]);

          const allTokens = [
            ...pumpFunTokens,
            ...pumpSwapTokens,
            ...letsBonkTokens,
            ...meteoraTokens,
          ];

          const seen = new Set<string>();
          newTokens = allTokens
            .filter(t => {
              if (seen.has(t.mint)) return false;
              seen.add(t.mint);
              return true;
            })
            .sort((a, b) => {
              const parseVol = (v: string) => {
                const num = parseFloat(v.replace(/[$,]/g, '').replace('M', '000000').replace('K', '000'));
                return isNaN(num) ? 0 : num;
              };
              return parseVol(b.volume24h) - parseVol(a.volume24h);
            })
            .slice(0, 20);
          
          console.log(`[Soon] Loaded ${allTokens.length} tokens, showing top ${newTokens.length}`);
          break;
        }
        case 'migration': {
          const pumpFunTokens = await pumpFunApi.getMigrationTokens(20);
          
          const [pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            getPumpSwapTokens(10),
            getLetsBonkTokens(10),
            getMeteoraTokens(10),
          ]);

          const allTokens = [
            ...pumpFunTokens,
            ...pumpSwapTokens,
            ...letsBonkTokens,
            ...meteoraTokens,
          ];

          const seen = new Set<string>();
          newTokens = allTokens
            .filter(t => {
              if (seen.has(t.mint)) return false;
              seen.add(t.mint);
              return true;
            })
            .sort((a, b) => {
              const parseMC = (v: string) => {
                const num = parseFloat(v.replace(/[$,]/g, '').replace('M', '000000').replace('K', '000'));
                return isNaN(num) ? 0 : num;
              };
              return parseMC(b.mc) - parseMC(a.mc);
            })
            .slice(0, 20);
          
          console.log(`[Migration] Loaded ${allTokens.length} tokens, showing top ${newTokens.length}`);
          break;
        }
        default:
          newTokens = [];
      }

      setTokens(newTokens);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tokens'));
      console.error(`Error loading ${columnType} tokens:`, err);
    }
  }, [columnType]);

  // Эффект для загрузки токенов
  useEffect(() => {
    setIsLoading(true);
    loadTokens();
    
    const intervalId = setInterval(() => {
      setIsLoading(true);
      loadTokens();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnType, refreshInterval]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadTokens();
  }, [loadTokens]);

  return {
    tokens,
    isLoading,
    error,
    refresh,
    lastUpdate,
    wsConnected,
  };
}
