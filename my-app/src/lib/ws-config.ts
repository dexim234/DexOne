// Конфигурация WebSocket сервера

export const WS_CONFIG = {
  // URL WebSocket сервера
  URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://pumpportal.fun/api/data',
  
  // Таймауты переподключения
  RECONNECT_DELAY: 1000,
  MAX_RECONNECT_DELAY: 30000,
  
  // Таймаут подключения
  CONNECTION_TIMEOUT: 10000,
};
