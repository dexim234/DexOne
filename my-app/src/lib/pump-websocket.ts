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
    this.url = config?.url || 'wss://ws.pump.fun';
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
        
        console.log('Pump.fun WebSocket connected');
        this.config.onConnect();

        // Подписаться на все события
        this.subscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: PumpWebSocketMessage = JSON.parse(event.data);
          
          if (message.method === 'notification') {
            const { token, type, timestamp } = message.params.result;
            
            // Вызов всех коллбеков для этого типа события
            const callbacks = this.callbacks.get(type as PumpEventType);
            if (callbacks) {
              callbacks.forEach(cb => cb({ type, token, timestamp }));
            }
            
            // Также вызываем коллбеки для 'all' если есть
            const allCallbacks = this.callbacks.get('create' as PumpEventType);
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
   * Подписаться на события
   */
  private subscribe(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'subscribe',
        params: { 
          types: ['create', 'trade', 'complete', 'bonding_curve_complete'] 
        }
      }));
    }
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

  private reconnectTimeout: NodeJS.Timeout | null = null;
}

// Singleton instance
export const pumpWebSocket = new PumpWebSocketClient({
  autoReconnect: false,
  reconnectInterval: 5000,
  maxReconnectAttempts: 0,
});
