'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Rooms, TokenData } from '../types/websocket';
import { getWebSocketClient } from './websocket-client';
import { WS_CONFIG } from './ws-config';

interface UseTokenUpdatesOptions {
  onTokenUpdate: (room: Rooms, tokens: TokenData[] | any[]) => void;
  onError?: (error: Error) => void;
  wsUrl?: string;
}

export function useTokenUpdates(
  room: Rooms,
  options: UseTokenUpdatesOptions
) {
  const { onTokenUpdate, onError, wsUrl = WS_CONFIG.URL } = options;
  const isFirstUpdateRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleTokenUpdate = useCallback(
    (receivedRoom: Rooms, tokens: any[]) => {
      if (receivedRoom === room) {
        if (isFirstUpdateRef.current) {
          console.log(`[Первый запуск] Room: ${room}, Токенов: ${tokens.length}`);
          isFirstUpdateRef.current = false;
        }
        onTokenUpdate(room, tokens);
      }
    },
    [room, onTokenUpdate]
  );

  useEffect(() => {
    const client = getWebSocketClient(wsUrl);
    
    // Устанавливаем обработчик ошибок
    if (onError) {
      client.onError(onError);
    }

    // Подключаемся
    client.connect();

    // Подписываемся на комнату
    unsubscribeRef.current = client.subscribe(room, handleTokenUpdate);

    return () => {
      unsubscribeRef.current?.();
    };
  }, [room, handleTokenUpdate, wsUrl, onError]);

  return {
    isFirstUpdate: isFirstUpdateRef.current,
    unsubscribe: () => unsubscribeRef.current?.(),
  };
}
