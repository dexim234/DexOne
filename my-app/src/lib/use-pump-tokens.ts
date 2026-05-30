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
          console.log('Loading NEW tokens...');
          // Загружаем новые токены из всех лаунчпадов параллельно
          // Для pumpfun используем 2 часа назад для более свежих токенов
          const [pumpFunTokens, pumpSwapTokens, letsBonkTokens, meteoraTokens] = await Promise.all([
            pumpFunApi.getNewTokens(12, 2),
            getPumpSwapTokens(6),
            getLetsBonkTokens(6),
            getMeteoraTokens(6),
          ]);

          console.log('PumpFun tokens loaded:', pumpFunTokens.length);
          console.log('PumpFun token names:', pumpFunTokens.map(t => `${t.name} - ${t.mc}`));

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
          
          console.log('Total tokens after merge and sort:', newTokens.length);
          console.log('Top 3 new tokens:', newTokens.slice(0, 3).map(t => ({
            name: t.name,
            mc: t.mc,
            timestamp: t.createdTimestamp,
            time: t.createdTimestamp ? new Date(t.createdTimestamp * 1000).toLocaleString() : 'N/A'
          })));
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
    const handleTokenCreate = async (event: { type: PumpEventType; token: PumpToken; timestamp: number }) => {
      console.log('WebSocket token create event received:', {
        type: event.type,
        mint: event.token.mint,
        name: event.token.name,
        symbol: event.token.symbol,
      });
      
      if (columnType === 'new' && event.type === 'create') {
        // Запрашиваем полные данные о токене по mint адресу
        console.log('Fetching full token data for mint:', event.token.mint);
        const fullTokenData = await pumpFunApi.getCoinById(event.token.mint);
        
        if (fullTokenData) {
          console.log('Full token data received:', fullTokenData);
          setTokens(prev => {
            const newToken = pumpFunApi.convertToMarketData(fullTokenData, 1);
            console.log('Converted full token:', newToken);
            // Проверяем, нет ли уже этого токена в списке
            const exists = prev.some(t => t.mint === newToken.mint);
            if (exists) {
              console.log('Token already exists in list, skipping');
              return prev;
            }
            console.log('Adding new token to front of list:', newToken.name, newToken.mc);
            return [newToken, ...prev.slice(0, 19)];
          });
          setLastUpdate(new Date());
        } else {
          console.log('Failed to fetch full token data, trying with partial data');
          // Если не удалось получить полные данные, используем то что есть
          setTokens(prev => {
            const newToken = pumpFunApi.convertToMarketData(event.token, 1);
            const exists = prev.some(t => t.mint === newToken.mint);
            if (exists) return prev;
            return [newToken, ...prev.slice(0, 19)];
          });
          setLastUpdate(new Date());
        }
      }
    };

    pumpWebSocket.on('create', handleTokenCreate);
    wsCallbackRef.current = () => {
      pumpWebSocket.off('create', handleTokenCreate);
    };

    // Подключаемся если еще не подключены
    const status = pumpWebSocket.getStatus();
    setWsConnected(status.connected);
    console.log('WebSocket connection status:', status);

    if (!status.connected) {
      console.log('Initiating WebSocket connection to PumpPortal...');
      pumpWebSocket.connect();
    }

    // Слушаем изменения статуса подключения
    const checkConnection = setInterval(() => {
      const currentStatus = pumpWebSocket.getStatus();
      setWsConnected(currentStatus.connected);
      if (columnType === 'new') {
        console.log('[' + new Date().toLocaleTimeString() + '] WebSocket connected:', currentStatus.connected);
      }
    }, 3000);

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
