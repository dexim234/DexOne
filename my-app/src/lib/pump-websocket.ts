import { PumpToken } from './pump-fun-api';

/**
 * Типы событий WebSocket Pump.fun
 */
export type PumpEventType = 'create' | 'trade' | 'complete' | 'bonding_curve_complete';

/**
 * Сообщение WebSocket Pump.fun
 */
export interface PumpWebSocketMessage {
  method: string;
  params: {
    result: {
      token: PumpToken;
      type: PumpEventType;
      timestamp: number;
    };
  };
}

/**
 * Коллбек для обработки событий
 */
export type PumpEventCallback = (event: {
  type: PumpEventType;
  token: PumpToken;
  timestamp: number;
}) => void;

/**
 * Конфигурация WebSocket подключения
 */
export interface PumpWebSocketConfig {
  url?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Класс для работы с WebSocket Pump.fun
 */
export class PumpWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private callbacks: Map<PumpEventType, PumpEventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isConnected = false;
  
  private config: Required<PumpWebSocketConfig>;

  constructor(config?: PumpWebSocketConfig) {
    this.url = config?.url || 'wss://pumpportal.fun/api/data';
    this.config = {
      url: this.url,
      autoReconnect: config?.autoReconnect ?? true,
      reconnectInterval: config?.reconnectInterval ?? 3000,
      maxReconnectAttempts: config?.maxReconnectAttempts ?? 5,
      onConnect: config?.onConnect ?? (() => {}),
      onDisconnect: config?.onDisconnect ?? (() => {}),
      onError: config?.onError ?? (() => {}),
    };
  }

  /**
   * Подписаться на событие
   */
  on(event: PumpEventType, callback: PumpEventCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  /**
   * Удалить подписку на событие
   */
  off(event: PumpEventType, callback: PumpEventCallback): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Подключиться к WebSocket
   */
  connect(): void {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        console.log('PumpPortal WebSocket connected');
        this.config.onConnect();

        // Подписаться на события создания новых токенов
        this.subscribeNewToken();
        this.subscribeTrades();
      };

      this.ws.onmessage = (event) => {
        try {
          // PumpPortal отправляет JSON объекты напрямую
          const data = JSON.parse(event.data);
          
          console.log('WebSocket message received:', data);
          
          // Определяем тип события на основе полей данных
          // PumpPortal использует txType вместо event
          let eventType: PumpEventType | null = null;
          
          // Событие создания нового токена (txType = 'create')
          if (data.txType === 'create' || data.event === 'newTokenCreation' || data.event === 'create') {
            eventType = 'create';
          } 
          // События торговли (buy/sell)
          else if (data.txType === 'buy' || data.txType === 'sell' || data.event === 'buy' || data.event === 'sell' || data.event === 'trade') {
            eventType = 'trade';
          }
          // Завершение bonding curve (миграция)
          else if (data.txType === 'complete' || data.event === 'complete' || data.event === 'bondingCurveComplete' || data.event === 'bonding_curve_complete') {
            eventType = 'complete';
          }
          
          if (eventType) {
            console.log('Detected event type:', eventType, 'for mint:', data.mint);
            
            // Преобразуем данные в формат PumpToken
            // Для create событий нужны дополнительные данные
            const token: PumpToken = {
              mint: data.mint || data.tokenMint || data.address,
              name: data.name || `Token-${data.mint?.slice(0, 4)}`,
              symbol: data.symbol || '???',
              uri: data.uri || data.metadata,
              image_uri: data.uri || data.metadata,
              createdTimestamp: data.timestamp || Math.floor(Date.now() / 1000),
              virtualSolReserves: data.virtualSolReserves || data.sol_reserve || 0,
              virtualTokenReserves: data.virtualTokenReserves || data.token_reserve || 0,
              realSolReserves: data.realSolReserves || data.sol_reserve || 0,
              realTokenReserves: data.realTokenReserves || data.token_reserve || 0,
              marketCap: data.marketCap || data.mc || 0,
              usd_market_cap: data.usd_market_cap,
              volume24h: data.volume24h || data.volume || 0,
              trades: data.trades || data.trade_count || 1,
              holders: data.holders || 1,
              isVerified: data.isVerified || data.verified || false,
            };
            
            console.log('Converted token:', token);
            
            // Вызов всех коллбеков для этого типа события
            const callbacks = this.callbacks.get(eventType);
            if (callbacks) {
              console.log('Calling', callbacks.length, 'callbacks for event:', eventType);
              callbacks.forEach(cb => cb({ 
                type: eventType, 
                token, 
                timestamp: data.timestamp || Math.floor(Date.now() / 1000) 
              }));
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Pump.fun WebSocket error:', error);
        this.config.onError(new Error('WebSocket error'));
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        
        console.log('Pump.fun WebSocket disconnected');
        this.config.onDisconnect();

        // Автоматическое переподключение
        if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.isConnecting = false;
      console.error('Failed to connect to Pump.fun WebSocket:', err);
      this.config.onError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  /**
   * Отключиться от WebSocket
   */
  disconnect(): void {
    // Отменяем плановое переподключение
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.callbacks.clear();
  }

  /**
   * Проверить статус подключения
   */
  getStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Подписаться на создание новых токенов
   */
  private subscribeNewToken(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribeNewToken',
      }));
      console.log('Subscribed to new token creation events');
    }
  }

  /**
   * Подписаться на сделки
   */
  private subscribeTrades(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: [], // Пустой массив = все токены
      }));
      console.log('Subscribed to token trade events');
    }
  }

  /**
   * Подписаться на события (устаревшее, используется для обратной совместимости)
   */
  private subscribe(): void {
    this.subscribeNewToken();
    this.subscribeTrades();
  }

  /**
   * Запланировать переподключение
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
}

// Singleton instance
export const pumpWebSocket = new PumpWebSocketClient({
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});
