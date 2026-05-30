# Token Collector Service

Система сбора новых токенов из multiple источников с проверками безопасности.

## Архитектура

### Источники данных

#### On-Chain (RPC / Indexer)
- **TokenCreated** - события создания токенов через Token Program
- **PairCreated** - создание пулов ликвидности (Raydium, PumpSwap)
- **Первые Swap** - отслеживание первых сделок

#### Off-Chain (API / Парсинг)
- **Pump.fun API** - новые токены с pump.fun
- **DexScreener API** - новые пары на DEX
- **CoinGecko API** - новые листинги
- **CoinMarketCap API** - новые листинги

### Scam-Filter

Проверки безопасности для каждого токена:

1. **LP Locked** - проверка заблокированной ликвидности
2. **Renounced** - проверка renounced mint/freeze authority
3. **Honeypot Check** - анализ контракта на блокировку продаж
4. **Audit Status** - статус аудита контракта

## Использование

### Базовый пример

```typescript
import { collectNewTokens } from '@/lib/token-collector';

// Получить новые токены за последние 2 часа
const tokens = await collectNewTokens({
  maxAgeHours: 2,
  limit: 50,
  enableSecurityChecks: true,
  sources: ['pumpfun', 'dexscreener']
});
```

### Параметры

```typescript
interface CollectOptions {
  maxAgeHours?: number;        // Максимальный возраст токена (по умолчанию 24)
  limit?: number;              // Количество токенов (по умолчанию 50)
  enableSecurityChecks?: boolean; // Включить проверки безопасности (по умолчанию true)
  sources?: Array<'pumpfun' | 'dexscreener' | 'coingecko' | 'cmc'>; // Источники
}
```

### API Endpoint

```bash
GET /api/new-tokens?maxAgeHours=24&limit=50&sources=pumpfun,dexscreener&enableSecurityChecks=true
```

**Query Parameters:**
- `maxAgeHours` - максимальный возраст токена в часах
- `limit` - количество токенов
- `sources` - источники через запятую (pumpfun, dexscreener, coingecko, cmc)
- `enableSecurityChecks` - включить/выключить проверки безопасности

## Интеграция с WebSocket

### Мониторинг создания токенов

```typescript
import { monitorTokenCreates, monitorPairCreates } from '@/lib/token-collector';

// Мониторинг создания токенов
const unsubscribe = monitorTokenCreates(async (mint, timestamp) => {
  console.log(`New token created: ${mint} at ${timestamp}`);
  
  // Выполняем проверки безопасности
  const security = await performSecurityCheck({ mint });
  
  if (!security.isHoneypot && security.lpLocked) {
    // Токен безопасен, добавляем в список
    console.log('Safe token detected!');
  }
});

// Остановка мониторинга
unsubscribe();
```

### Отслеживание первых сделок

```typescript
import { monitorFirstSwaps } from '@/lib/token-collector';

const stopMonitoring = monitorFirstSwaps((mint, tradeData) => {
  console.log(`First swap detected for ${mint}:`, tradeData);
  
  // Обновляем данные токена
  updateTokenData(mint, {
    firstTradeAt: Date.now(),
    tradesCount: 1,
    volumeUsd: tradeData.amountUsd
  });
});
```

## Типы данных

### CollectedToken

```typescript
interface CollectedToken {
  mint: string;                      // Адрес токена
  name: string;                      // Название
  symbol: string;                    // Символ
  source: TokenSource;               // Источник данных
  deployedAt: number;                // Timestamp развертывания
  poolCreatedAt: number;             // Timestamp создания пула
  liquiditySol: number;              // Ликвидность в SOL
  initialLiquidityUsd: number;       // Начальная ликвидность в USD
  firstTradeAt?: number;             // Timestamp первой сделки
  tradesCount: number;               // Количество сделок
  volumeUsd: number;                 // Объем в USD
  marketCap: number;                 // Рыночная капитализация
  isVerified?: boolean;              // Статус верификации
  security: TokenSecurityData;       // Данные безопасности
  metadataUri?: string;              // URI metadata
  imageUrl?: string;                 // URL изображения
  website?: string;                  // Сайт
  twitter?: string;                  // Twitter
  telegram?: string;                 // Telegram
}
```

### TokenSecurityData

```typescript
interface TokenSecurityData {
  lpLocked: boolean;                 // LP заблокирована
  lpLockedPercent?: number;          // Процент заблокированной LP
  renounced: boolean;                // Авторитарии renounced
  isHoneypot: boolean;               // Honeypot detected
  auditStatus: 'audited' | 'pending' | 'none' | 'failed';
  creatorRating?: number;            // Рейтинг создателя
  topHoldersPercent?: number;        // Процент у топ держателей
  mintAuthRenounced?: boolean;       // Mint authority renounced
  freezeAuthRenounced?: boolean;     // Freeze authority renounced
}
```

## Настройка RPC

### .env.local

```env
# Solana RPC
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# CoinMarketCap API
CMC_API_KEY=your_cmc_api_key

# CoinGecko API (опционально)
COINGECKO_API_KEY=your_coingecko_api_key
```

## Производительность

### Оптимизации

1. **Параллельный сбор** - данные собираются из всех источников параллельно
2. **Кэширование** - результаты кэшируются для избежания дублирования запросов
3. **Ленивая загрузка** - проверки безопасности выполняются только при необходимости

### Рекомендации

- Используйте `maxAgeHours: 2-4` для получения действительно свежих токенов
- Включите `enableSecurityChecks: true` для защиты от скам-токенов
- Настройте WebSocket мониторинг для real-time уведомлений

## Расширения

### Добавление нового источника

```typescript
export async function getNewTokensFromNewSource(limit: number): Promise<Partial<CollectedToken>[]> {
  try {
    const response = await axios.get('https://api.newsource.com/tokens');
    
    return response.data.tokens
      .filter(t => t.chain === 'solana')
      .slice(0, limit)
      .map((token: any) => ({
        mint: token.address,
        name: token.name,
        symbol: token.symbol,
        source: { name: 'newsource', type: 'offchain', priority: 4 },
        deployedAt: Math.floor(new Date(token.created_at).getTime() / 1000),
        poolCreatedAt: Math.floor(new Date(token.pool_created_at).getTime() / 1000),
        liquiditySol: token.liquidity_sol,
        marketCap: token.market_cap,
        volumeUsd: token.volume_24h,
      }));
  } catch (error) {
    console.error('Error fetching from NewSource:', error);
    return [];
  }
}

// Добавить в collectNewTokens
const sources = ['pumpfun', 'dexscreener', 'newsource'];
```

### Кастомные проверки безопасности

```typescript
export async function customSecurityCheck(token: Partial<CollectedToken>): Promise<TokenSecurityData> {
  const baseSecurity = await performSecurityCheck(token);
  
  // Добавляем свои проверки
  const creatorRatings = await checkCreatorReputation(token.mint);
  
  return {
    ...baseSecurity,
    creatorRating: creatorRatings.rating,
    topHoldersPercent: creatorRatings.topHoldersPercent,
  };
}
```

## Уведомления

### WebSocket события

```typescript
import { pumpWebSocket, PumpEventType } from '@/lib/pump-websocket';
import { collectNewTokens } from '@/lib/token-collector';

pumpWebSocket.on('create', async (event) => {
  if (event.type === 'create') {
    const tokens = await collectNewTokens({
      maxAgeHours: 1,
      limit: 5,
      sources: ['pumpfun']
    });
    
    const newToken = tokens.find(t => t.mint === event.token.mint);
    if (newToken && newToken.security.lpLocked && !newToken.security.isHoneypot) {
      console.log('🚀 Safe new token:', newToken.name, newToken.symbol);
    }
  }
});
```

## Обработка ошибок

```typescript
try {
  const tokens = await collectNewTokens({
    maxAgeHours: 24,
    limit: 50,
    enableSecurityChecks: true
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error collecting tokens:', error.message);
    
    // Fallback на кэшированные данные
    const cachedTokens = getCachedTokens();
    if (cachedTokens) {
      displayTokens(cachedTokens);
    }
  }
}
```

## Мониторинг

### Логирование

```typescript
const startTime = Date.now();
const tokens = await collectNewTokens({ maxAgeHours: 24, limit: 50 });
const duration = Date.now() - startTime;

console.log(`Collected ${tokens.length} tokens in ${duration}ms`);
console.log(`Average: ${duration / tokens.length}ms per token`);
```

### Метрики

- Общее количество собранных токенов
- Количество токенов после фильтрации
- Время выполнения каждой проверки
- Источники данных и их доступность
