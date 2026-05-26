# Быстрый старт - MarketHub с Pump.fun интеграцией

## Шаг 1: Установка зависимостей

```bash
npm install
```

Или установите новые пакеты отдельно:

```bash
npm install @pump-fun/pump-sdk @pump-fun/pump-swap-sdk @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui axios
```

## Шаг 2: Настройка окружения (опционально)

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Измените значения если нужны кастомные RPC endpoints.

## Шаг 3: Запуск разработки

```bash
npm run dev
```

Откройте http://localhost:3000 и перейдите на страницу MarketHub.

## Что работает "из коробки"

### Колонка "New" (Новые токены)
- Получает самые свежие токены с Pump.fun
- Автоматическое обновление каждые 5 секунд
- WebSocket для мгновенных уведомлений о новых токенах
- Отображает: MC, объем, изменения цены, трейды, холдеров

### Колонка "Soon" (Трендовые токены)
- Получает трендовые токены
- Автоматическое обновление каждые 10 секунд
- Отображает популярные токены для торговли

### Колонка "Migration" (Токены для миграции)
- Получает токены с MC > $60k, готовые к миграции на Raydium
- Автоматическое обновление каждые 15 секунд
- Отображает токены близкие к завершению bonding curve

## Статус подключения

В каждой колонке отображается статус подключения:
- 🟢 **Live** - WebSocket подключен, обновления в реальном времени
- 🟠 **Polling** - WebSocket недоступен, используется периодический опрос API

## Ручное обновление

Нажмите на иконку ↻ в заголовке колонки для ручного обновления данных.

## Клики по карточкам

Клик по карточке токена открывает Solana Explorer с информацией о токене.

## API Endpoints используемые в проекте

- `https://frontend-api-v3.pump.fun/coins` - список токенов
- `https://frontend-api-v3.pump.fun/coins/trending` - трендовые токены
- `wss://ws.pump.fun` - WebSocket для реального времени

## Возможности

- ✅ Мгновенное получение новых токенов через WebSocket
- ✅ Автоматическое обновление через polling
- ✅ Обработка ошибок и переподключение
- ✅ Форматирование всех метрик (MC, объем, изменения %)
- ✅ Изображения токенов из metadata URI
- ✅ Ссылки на Solana Explorer
- ✅ Адаптивный UI для мобильных устройств

## Кастомизация

### Изменение интервалов обновления

В `src/app/market-hub/page.tsx` измените `refreshInterval`:

```tsx
<TrenchColumn
  title="New"
  columnType="new"
  refreshInterval={3000}  // Обновление каждые 3 секунды
/>
```

### Отключение WebSocket

```tsx
<TrenchColumn
  title="New"
  columnType="new"
  enableAutoRefresh={true}
  refreshInterval={5000}
/>
```

### Добавление новых колонок

Добавьте новый `TrenchColumn` с подходящим `columnType`:

```tsx
<TrenchColumn
  title="Custom"
  columnType="new"  // или "soon" | "migration"
  refreshInterval={5000}
/>
```

## Устранение проблем

### Ошибка "Failed to load tokens"

1. Проверьте подключение к интернету
2. Убедитесь что Pump.fun API доступен
3. Попробуйте нажать кнопку "Повторить" в колонке

### WebSocket не подключается

- WebSocket может быть недоступ в некоторых регионах
- Приложение автоматически переключается на polling
- Проверьте консоль браузера для деталей ошибки

### Изображения не загружаются

- Некоторые токены могут не иметь изображений
- Используется placeholder по умолчанию
- Проверьте metadata URI токена

## Дополнительные ресурсы

- [PUMP_FUN_INTEGRATION.md](./PUMP_FUN_INTEGRATION.md) - полная документация
- [Pump.fun API Docs](https://github.com/BankkRoll/pumpfun-apis)
- [@pump-fun/pump-sdk](https://www.npmjs.com/package/@pump-fun/pump-sdk)
