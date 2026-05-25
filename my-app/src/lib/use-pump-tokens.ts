import { useEffect, useState, useCallback, useRef } from 'react';
import { pumpFunApi, TokenMarketData, PumpToken } from './pump-fun-api';
import { pumpWebSocket, PumpEventType } from './pump-websocket';

export interface UsePumpTokensOptions {
  columnType: 'new' | 'soon' | 'migration';
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

export interface UsePumpTokensReturn {
  tokens: TokenMarketData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
  wsConnected: boolean;
}

interface UsePumpTokensReturn {
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
        case 'new':
          newTokens = await pumpFunApi.getNewTokens(20);
          break;
        case 'soon':
          newTokens = await pumpFunApi.getSoonTokens(20);
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
