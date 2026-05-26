import { useEffect, useState, useCallback, useRef } from 'react';
import { pumpFunApi, TokenMarketData } from './pump-fun-api';

export interface UsePumpTokensOptions {
  columnType: 'new' | 'soon' | 'migration';
  refreshInterval?: number;
}

export interface UsePumpTokensReturn {
  tokens: TokenMarketData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
  wsConnected: boolean;
}

export function usePumpTokens({
  columnType,
  refreshInterval = 5000,
}: UsePumpTokensOptions): UsePumpTokensReturn {
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let newTokens: TokenMarketData[];

      switch (columnType) {
        case 'new':
          newTokens = await pumpFunApi.getNewTokens(20);
          break;
        case 'soon':
          const trending = await pumpFunApi.getTrendingCoins(30);
          const newTokensSet = new Set((await pumpFunApi.getNewTokens(20)).map(t => t.mint));
          newTokens = trending
            .filter(t => !newTokensSet.has(t.mint))
            .slice(0, 20)
            .map((token, index) => pumpFunApi.convertToMarketData(token, index + 1));
          break;
        case 'migration':
          newTokens = await pumpFunApi.getMigrationTokens(20);
          break;
        default:
          newTokens = [];
      }

      setTokens(newTokens);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tokens'));
      console.error(`Error loading ${columnType} tokens:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [columnType]);

  useEffect(() => {
    loadTokens();
    intervalRef.current = setInterval(loadTokens, refreshInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadTokens, refreshInterval]);

  const refresh = useCallback(async () => {
    await loadTokens();
  }, [loadTokens]);

  return {
    tokens,
    isLoading,
    error,
    refresh,
    lastUpdate,
    wsConnected: false,
  };
}
