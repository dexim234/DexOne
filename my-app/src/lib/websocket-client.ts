// Клиент WebSocket для подключения к серверу

import { Rooms, SocketEvents, ROOM_TO_EVENT } from '../types/websocket';

export type TokenHandler = (room: Rooms, tokens: any[]) => void;
export type ErrorHandler = (error: Error) => void;

// Формат данных от pumpportal.fun
export interface PumpPortalToken {
  name: string;
  symbol: string;
  address: string;
  metadata_uri: string;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  real_sol_reserves: number;
  real_token_reserves: number;
  token_total_supply: number;
  complete: boolean;
  created_at: string;
}

export interface PumpPortalTrade {
  mint: string;
  name: string;
  symbol: string;
  usd_sol_rate: number;
  event: 'buy' | 'sell';
  amount_sol: number;
  amount_tokens: number;
  timestamp: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectDelay: number = 1000;
  private maxReconnectDelay: number = 30000;
  private handlers: Map<string, TokenHandler[]> = new Map();
  private errorHandler: ErrorHandler | null = null;
  private reconnectTimer: number | null = null;
  private subscribedMethods: Set<string> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    try {
      // Отправляем событие подключения
      window.dispatchEvent(new CustomEvent('ws-connecting'));
      
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Подключено к pumpportal.fun');
        window.dispatchEvent(new CustomEvent('ws-connected'));
        this.reconnectDelay = 1000;
        // Переподписка при переподключении
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[WebSocket] Ошибка парсинга:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Ошибка:', error);
        this.errorHandler?.(new Error('WebSocket error'));
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Соединение закрыто, переподключение...');
        window.dispatchEvent(new CustomEvent('ws-disconnected'));
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Ошибка подключения:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay) as unknown as number;

    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      this.maxReconnectDelay
    );
  }

  private resubscribeAll(): void {
    // При переподключении повторяем все подписки
    this.subscribedMethods.forEach(method => {
      this.ws?.send(JSON.stringify({ method }));
    });
  }

  private handleMessage(data: any): void {
    // Обработка сообщений от pumpportal.fun
    const { event, method, ...rest } = data;
    
    // Обрабатываем разные типы событий
    if (event === 'newToken') {
      const token: PumpPortalToken = rest;
      this.emitToRoom(Rooms.NEW_PAIRS, [token]);
    } else if (event === 'trade') {
      const trade: PumpPortalTrade = rest;
      this.emitToRoom(Rooms.RECENT, [trade]);
    } else if (event === 'migration') {
      console.log('[Migration]', data);
    } else if (method) {
      // Ответ на подписку
      console.log('[Subscribe Response]', method, data);
    } else {
      // Универсальная обработка
      console.log('[WebSocket Message]', data);
    }
  }

  private emitToRoom(room: Rooms, tokens: any[]): void {
    const handlers = this.handlers.get('all');
    handlers?.forEach(handler => handler(room, tokens));
  }

  subscribe(room: Rooms, handler: TokenHandler): () => void {
    // Для pumpportal.fun подписки делаются через методы
    if (!this.handlers.has('all')) {
      this.handlers.set('all', []);
    }
    
    const handlers = this.handlers.get('all')!;
    handlers.push(handler);

    // Устанавливаем подписки при подключении
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.subscribeToEvents();
    }

    // Возвращаем функцию отписки
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  private subscribeToEvents(): void {
    // Подписка на новые токены
    if (!this.subscribedMethods.has('subscribeNewToken')) {
      this.ws?.send(JSON.stringify({ method: 'subscribeNewToken' }));
      this.subscribedMethods.add('subscribeNewToken');
    }

    // Подписка на миграции (опционально)
    if (!this.subscribedMethods.has('subscribeMigration')) {
      this.ws?.send(JSON.stringify({ method: 'subscribeMigration' }));
      this.subscribedMethods.add('subscribeMigration');
    }
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton экземпляр
let client: WebSocketClient | null = null;

export function getWebSocketClient(url: string): WebSocketClient {
  if (!client) {
    client = new WebSocketClient(url);
  }
  return client;
}
