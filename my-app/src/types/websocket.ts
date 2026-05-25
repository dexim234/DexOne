// Типы данных для токенов

export interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  timestamp: number;
}

// Комнаты WebSocket для подписки
export enum Rooms {
  TOKEN_MONITOR = 'TOKEN_MONITOR',  // Trending
  NEW_PAIRS = 'NEW_PAIRS',          // New (trenches)
  SOON = 'SOON',                    // Soon (trenches)
  RECENT = 'RECENT',                // Recent (trenches)
}

// События WebSocket
export enum SocketEvents {
  UPDATE_TOKEN_MONITOR = 'update_token_monitor',
  UPDATE_NEW_PAIRS = 'update_new_pairs',
  UPDATE_SOON = 'update_soon',
  UPDATE_RECENT = 'update_recent',
}

// Карта соответствия комнат и событий
export const ROOM_TO_EVENT: Record<Rooms, SocketEvents> = {
  [Rooms.TOKEN_MONITOR]: SocketEvents.UPDATE_TOKEN_MONITOR,
  [Rooms.NEW_PAIRS]: SocketEvents.UPDATE_NEW_PAIRS,
  [Rooms.SOON]: SocketEvents.UPDATE_SOON,
  [Rooms.RECENT]: SocketEvents.UPDATE_RECENT,
};
