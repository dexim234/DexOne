import { useEffect, useState, useCallback, useRef } from 'react';
import { pumpFunApi, TokenMarketData, PumpToken } from './pump-fun-api';
import { getPumpSwapTokens, getLetsBonkTokens, getMeteoraTokens } from './multi-launchpad-api';

export interface UsePumpTokensOptions {
  columnType: 'new' | 'soon' | 'migration';
  refreshInterval?: number;
  enableWebSocket?: boolean;
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
          // Pump.fun API теперь автоматически использует DexScreener fallback
          const pumpFunTokens = await pumpFunApi.getNewTokens(20);
          
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

          // Сортировка по createdTimestamp (новые первыми)
          newTokens = allTokens
            .filter(t => t.createdTimestamp)
            .sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0))
            .slice(0, 20);
          
          console.log(`[New] Loaded ${allTokens.length} tokens, showing top ${newTokens.length}`);
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
