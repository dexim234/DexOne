import { useEffect, useState, useCallback, useRef } from 'react';
import { pumpFunApi, TokenMarketData, PumpToken } from './pump-fun-api';
import { pumpWebSocket, PumpEventType } from './pump-websocket';
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
  refreshInterval = 5000, // 5 секунд по умолчанию
  enableWebSocket = true,
  filters,
}: UsePumpTokensOptions): UsePumpTokensReturn {
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsCallbackRef = useRef<(() => void) | null>(null);

  // Функция загрузки токенов
  const loadTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let newTokens: TokenMarketData[];

      switch (columnType) {
        case 'new': {
          // Загружаем токены из всех лаунчпадов параллельно
          const [pumpFunTokens, pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            pumpFunApi.getNewTokens(12),
            getPumpSwapTokens(6),
            getLetsBonkTokens(6),
            getMeteoraTokens(6),
          ]);

          // Объединяем и сортируем по времени создания (новые сверху)
          const allTokens = [
            ...pumpFunTokens,
            ...pumpSwapTokens,
            ...letsBonkTokens,
            ...meteoraTokens,
          ];

          // Сортируем по createdTimestamp (новые первыми)
          newTokens = allTokens
            .sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0))
            .slice(0, 20);
          break;
        }
        case 'soon': {
          // Загружаем трендовые токены из всех лаунчпадов параллельно
          const [pumpFunTokens, pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            pumpFunApi.getSoonTokens(10),
            getPumpSwapTokens(5),
            getLetsBonkTokens(5),
            getMeteoraTokens(5),
          ]);

          const allTokens = [
            ...pumpFunTokens,
            ...pumpSwapTokens,
            ...letsBonkTokens,
            ...meteoraTokens,
          ];

          // Если фильтры не заданы — добавляем свежие токены в начало списка
          if (!filters || Object.keys(filters).length === 0) {
            try {
              const fresh = await pumpFunApi.getNewTokens(6);
              allTokens.unshift(...fresh);
            } catch (e) {
              // ignore
            }
          }
          // Убираем дубликаты по mint
          const seen = new Set<string>();
          newTokens = allTokens
            .filter(t => {
              if (seen.has(t.mint)) return false;
              seen.add(t.mint);
              return true;
            })
            // Сортируем по объему (трендовые первыми)
            .sort((a, b) => {
              const parseVol = (v: string) => {
                const num = parseFloat(v.replace(/[$,]/g, '').replace('M', '000000').replace('K', '000'));
                return isNaN(num) ? 0 : num;
              };
              return parseVol(b.volume24h) - parseVol(a.volume24h);
            })
            .slice(0, 20);
          break;
        }
        case 'migration': {
          // Загружаем токены близкие к миграции из всех лаунчпадов параллельно
          const [pumpFunTokens, pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            pumpFunApi.getMigrationTokens(10),
            getPumpSwapTokens(5),
            getLetsBonkTokens(5),
            getMeteoraTokens(5),
          ]);

          const allTokens = [
            ...pumpFunTokens,
            ...pumpSwapTokens,
            ...letsBonkTokens,
            ...meteoraTokens,
          ];

          // Если фильтры не заданы — добавляем только что мигрировавшие токены
          if (!filters || Object.keys(filters).length === 0) {
            try {
              const fresh = await pumpFunApi.getNewTokens(6);
              const migratedFresh = fresh.filter(t => Boolean((t as any).complete));
              if (migratedFresh.length > 0) {
                allTokens.unshift(...migratedFresh);
              }
            } catch (e) {
              // ignore
            }
          }
          // Убираем дубликаты по mint
          const seen = new Set<string>();
          newTokens = allTokens
            .filter(t => {
              if (seen.has(t.mint)) return false;
              seen.add(t.mint);
              return true;
            })
            // Сортируем по капитализации (высокие первыми — ближе к миграции)
            .sort((a, b) => {
              const parseMC = (v: string) => {
                const num = parseFloat(v.replace(/[$,]/g, '').replace('M', '000000').replace('K', '000'));
                return isNaN(num) ? 0 : num;
              };
              return parseMC(b.mc) - parseMC(a.mc);
            })
            .slice(0, 20);
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
    } finally {
      setIsLoading(false);
    }
  }, [columnType]);

  // Подключение к WebSocket для реального времени
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    // Подписка на события создания токенов
    const handleTokenCreate = (event: { type: PumpEventType; token: PumpToken }) => {
      if (columnType === 'new' && event.type === 'create') {
        setTokens(prev => {
          const newToken = pumpFunApi.convertToMarketData(event.token, 1);
          return [newToken, ...prev.slice(0, 19)];
        });
        setLastUpdate(new Date());
      }
    };

    pumpWebSocket.on('create', handleTokenCreate);
    wsCallbackRef.current = () => {
      pumpWebSocket.off('create', handleTokenCreate);
    };

    // Подключаемся если еще не подключены
    const status = pumpWebSocket.getStatus();
    setWsConnected(status.connected);

    if (!status.connected) {
      pumpWebSocket.connect();
    }

    // Слушаем изменения статуса подключения
    const checkConnection = setInterval(() => {
      const currentStatus = pumpWebSocket.getStatus();
      setWsConnected(currentStatus.connected);
    }, 2000);

    intervalRef.current = checkConnection as unknown as NodeJS.Timeout;
  }, [enableWebSocket, columnType]);

  // Отключение от WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsCallbackRef.current) {
      wsCallbackRef.current();
      wsCallbackRef.current = null;
    }
  }, []);

  // Эффект для загрузки токенов при монтировании
  useEffect(() => {
    loadTokens();
    
    // Устанавливаем интервал для периодического обновления
    intervalRef.current = setInterval(loadTokens, refreshInterval);

    // Пытаемся подключить WebSocket
    connectWebSocket();

    return () => {
      // Очистка при размонтировании
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      disconnectWebSocket();
    };
  }, [loadTokens, refreshInterval, connectWebSocket, disconnectWebSocket]);

  // Функция для ручного обновления
  const refresh = useCallback(async () => {
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
