# Pump.fun Integration Guide

## Установка зависимостей

Установите необходимые пакеты для работы с Pump.fun SDK и Solana:

```bash
npm install @pump-fun/pump-sdk @pump-fun/pump-swap-sdk @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui axios
```

## Настройка окружения

Создайте файл `.env.local` в корне проекта и добавьте следующие переменные:

```env
# Solana RPC endpoints (опционально, используются значения по умолчанию)
NEXT_PUBLIC_SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC=https://api.devnet.solana.com

# Pump.fun API (опционально, используется публичный endpoint)
NEXT_PUBLIC_PUMP_FUN_API_URL=https://frontend-api-v3.pump.fun
```

## Структура проекта

### `/src/lib/pump-fun-api.ts`
Сервис для работы с Pump.fun API:
- `getNewTokens(limit, hoursBack, options)` - получение новых токенов
  - Фильтры: `deployed_at ≤ X часов`, `pool_created_at ≤ X`, `status = "live"`, `is_verified = true/false`
  - Опции: `minLiquiditySol` (мин. ликвидность в SOL), `minTrades` (мин. количество сделок)
- `getSoonTokens(limit)` - получение трендовых токенов
- `getMigrationTokens(limit)` - получение токенов для миграции
- `getCoinById(mint)` - получение информации о конкретном токене
- `convertToMarketData(token, rank)` - конвертация данных в формат карточек

### `/src/lib/multi-launchpad-api.ts`
API для получения токенов с разных лаунчпадов:
- `getPumpSwapTokens(limit, maxAgeHours)` - токены PumpSwap
- `getLetsBonkTokens(limit, maxAgeHours)` - токены LetsBonk
- `getMeteoraTokens(limit, maxAgeHours)` - токены Meteora

### `/src/lib/use-pump-tokens.ts`
React хук для получения токенов с поддержкой:
- Автоматического обновления (polling)
- WebSocket для реального времени
- Обработки ошибок и состояний загрузки

### `/src/lib/solana-config.ts`
Конфигурация Solana сети и утилиты:
- Подключение к RPC узлам
- Форматирование адресов
- Explorer ссылки

## API Endpoints

### `/api/new-tokens` (Backend Proxy)
Получение новых токенов с всех лаунчпадов через DexScreener API.

**Query Parameters:**
- `limit` - количество токенов (по умолчанию 50)
- `maxAgeHours` - максимальный возраст токена в часах (по умолчанию 24)

**Пример:**
```
GET /api/new-tokens?limit=50&maxAgeHours=24
```

### Frontend API v3 (Основной)
```
Base URL: https://frontend-api-v3.pump.fun
```

Основные endpoints:
- `GET /coins` - получить список токенов
- `GET /coins/trending` - получить трендовые токены
- `GET /coins/:mint` - получить токен по адресу
- `GET /coins/new` - получить новые токены

### WebSocket (для реального времени)
```
wss://ws.pump.fun
```

События:
- `create` - создание нового токена
- `trade` - торговля токеном
- `complete` - завершение токена (миграция)

## Фильтры для новых токенов

Токены во вкладке "New" фильтруются по следующим критериям:

1. **deployed_at ≤ X часов/дней** - токен был создан недавно
2. **pool_created_at ≤ X** - пул ликвидности был создан недавно  
3. **status = "live"** - токен имеет активную торговлю (есть ликвидность и сделки)
4. **is_verified = true/false** - опциональная фильтрация по верификации

**Дополнительные фильтры:**
- `minLiquiditySol` - минимальная ликвидность в SOL (по умолчанию 0.1)
- `minTrades` - минимальное количество сделок (по умолчанию 1)

## Использование

### Базовое использование API

```typescript
import { pumpFunApi } from '@/lib/pump-fun-api';

// Получить новые токены за последние 2 часа с фильтрами
const newTokens = await pumpFunApi.getNewTokens(20, 2, {
  minLiquiditySol: 0.1,
  minTrades: 1
});

// Получить трендовые токены
const trending = await pumpFunApi.getSoonTokens(20);

// Получить токен по mint address
const token = await pumpFunApi.getCoinById('mint-address-here');
```

### Использование хука в компонентах

```typescript
import { usePumpTokens } from '@/lib/use-pump-tokens';

function MyComponent() {
  const { tokens, isLoading, error, refresh, lastUpdate } = usePumpTokens({
    columnType: 'new', // или 'soon' | 'migration'
    refreshInterval: 5000, // обновление каждые 5 секунд
    enableWebSocket: true, // включить WebSocket
  });

  return (
    <div>
      {isLoading ? 'Загрузка...' : (
        tokens.map(token => (
          <div key={token.mint}>
            <h3>{token.name}</h3>
            <p>MC: {token.mc}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

## Обновление данных в реальном времени

Система использует два метода для получения обновлений:

1. **WebSocket** - для мгновенных уведомлений о новых токенах и сделках
2. **Polling** - периодический опрос API (по умолчанию каждые 5-15 секунд в зависимости от колонки)

### Настройка интервалов обновления

В `page.tsx` для каждой колонки можно настроить свой интервал:

```typescript
<TrenchColumn
  title="New"
  columnType="new"
  refreshInterval={5000}   // 5 секунд
/>

<TrenchColumn
  title="Soon"
  columnType="soon"
  refreshInterval={10000}  // 10 секунд
/>

<TrenchColumn
  title="Migration"
  columnType="migration"
  refreshInterval={15000}  // 15 секунд
/>
```

## Обработка ошибок

Сервис включает обработку следующих ошибок:
- Сеть недоступна
- API возвращает ошибку
- Неверные данные

При ошибке компонент показывает кнопку "Повторить" для ручного обновления.

## Кэширование

API поддерживает ETag кэширование:
- Используйте заголовок `If-None-Match` для условных запросов
- Ответ `304 Not Modified` указывает на неизменность данных

## Производительность

Для оптимизации производительности:
- Используйте pagination при запросе большого количества токенов
- Отключите WebSocket если не требуется реальное время
- Настройте интервалы polling в зависимости от ваших нужд

## Адреса контрактов

- **Pump.fun Program**: `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`
- **Pump Swap Program**: `PUMPckSMTMi5xvR5WZqACqHrTQW5K8a1vF7d5G5tJgE`
- **Raydium AMM V4**: `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8`

## Ссылки

- [Pump.fun API Documentation](https://github.com/BankkRoll/pumpfun-apis)
- [@pump-fun/pump-sdk on npm](https://www.npmjs.com/package/@pump-fun/pump-sdk)
- [@pump-fun/pump-swap-sdk on npm](https://www.npmjs.com/package/@pump-fun/pump-swap-sdk)
- [Solana Documentation](https://docs.solana.com/)
