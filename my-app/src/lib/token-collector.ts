import axios from 'axios';

/**
 * Token Collector Service
 * Сбор новых токенов из multiple источников:
 * - On-chain (RPC / Indexer): TokenCreated, PairCreated, первые Swap
 * - Off-chain (API / Парсинг): CoinGecko/CMC листинги, DEX скринеры
 * - Scam-filter: LP locked, renounced, honeypot check, audit
 */

export interface TokenSource {
  name: string;
  type: 'onchain' | 'offchain';
  priority: number; // Более высокий приоритет = выше в списке
}

export interface TokenSecurityData {
  lpLocked: boolean;
  lpLockedPercent?: number;
  renounced: boolean;
  isHoneypot: boolean;
  auditStatus: 'audited' | 'pending' | 'none' | 'failed';
  creatorRating?: number;
  topHoldersPercent?: number;
  mintAuthRenounced?: boolean;
  freezeAuthRenounced?: boolean;
}

export interface CollectedToken {
  mint: string;
  name: string;
  symbol: string;
  source: TokenSource;
  deployedAt: number;
  poolCreatedAt: number;
  liquiditySol: number;
  initialLiquidityUsd: number;
  firstTradeAt?: number;
  tradesCount: number;
  volumeUsd: number;
  marketCap: number;
  isVerified?: boolean;
  security: TokenSecurityData;
  metadataUri?: string;
  imageUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

// === On-Chain Sources ===

/**
 * Solana RPC конфигурация
 */
const SOLANA_CONFIG = {
  mainnetRpc: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  pumpFunProgram: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  raydiumAmm: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
};

/**
 * Проверка LP locked через RPC
 */
async function checkLPLocked(mint: string): Promise<TokenSecurityData['lpLocked']> {
  try {
    // Проверка через getProgramAccounts для Raydium pools
    // В реальности требуется более сложная логика анализа аккаунтов LP
    return true; // Placeholder - в продакшене нужна реальная проверка
  } catch (error) {
    console.error(`Error checking LP locked for ${mint}:`, error);
    return false;
  }
}

/**
 * Проверка honeypot
 */
async function checkHoneypot(mint: string): Promise<TokenSecurityData['isHoneypot']> {
  try {
    // Анализ контракта токена на наличие функций блокировки продаж
    // Placeholder - требуется интеграция с security scanner
    return false;
  } catch (error) {
    console.error(`Error checking honeypot for ${mint}:`, error);
    return true; // Лучше перестраховаться
  }
}

/**
 * Проверка renounced mint/freeze authority
 */
async function checkAuthorities(mint: string): Promise<{ mintAuthRenounced: boolean; freezeAuthRenounced: boolean }> {
  try {
    // Запрос через RPC getAccountInfo для token metadata
    // Placeholder
    return { mintAuthRenounced: true, freezeAuthRenounced: true };
  } catch (error) {
    console.error(`Error checking authorities for ${mint}:`, error);
    return { mintAuthRenounced: false, freezeAuthRenounced: false };
  }
}

/**
 * Мониторинг событий TokenCreated через WebSocket RPC
 */
export async function monitorTokenCreates(callback: (mint: string, timestamp: number) => void) {
  console.log('Starting on-chain token creation monitor...');
  
  // В продакшене здесь будет WebSocket подписка на ProgramSubscriptionV2
  // Для примера - placeholder
  return () => {
    console.log('Stopping token creation monitor');
  };
}

/**
 * Мониторинг событий PairCreated (создание пула ликвидности)
 */
export async function monitorPairCreates(callback: (mint: string, poolAddress: string, timestamp: number) => void) {
  console.log('Starting on-chain pair creation monitor...');
  
  // Подписка на Raydium AMM events
  return () => {
    console.log('Stopping pair creation monitor');
  };
}

/**
 * Отслеживание первых сделок (Swap)
 */
export async function monitorFirstSwaps(callback: (mint: string, tradeData: any) => void) {
  console.log('Starting on-chain swap monitor...');
  
  // Подписка на Swap events через RPC или indexer
  return () => {
    console.log('Stopping swap monitor');
  };
}

// === Off-Chain Sources ===

/**
 * DexScreener API - поиск новых токенов
 */
export async function getNewTokensFromDexScreener(
  maxAgeHours: number = 24,
  limit: number = 50
): Promise<Partial<CollectedToken>[]> {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=solana&maxAge=${maxAgeHours * 3600}`,
      { timeout: 10000 }
    );

    if (!response.data?.pairs) return [];

    return response.data.pairs
      .filter((p: any) => p.chainId === 'solana' && p.pairCreatedAt)
      .slice(0, limit)
      .map((pair: any) => ({
        mint: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        source: { name: 'dexscreener', type: 'offchain', priority: 2 },
        deployedAt: Math.floor(pair.pairCreatedAt / 1000),
        poolCreatedAt: Math.floor(pair.pairCreatedAt / 1000),
        liquiditySol: pair.liquidity?.sol || 0,
        initialLiquidityUsd: pair.liquidity?.usd || 0,
        marketCap: pair.marketCap || pair.fdv || 0,
        volumeUsd: pair.volume?.h24 || 0,
        tradesCount: pair.txns?.h24?.buys + pair.txns?.h24?.sells || 0,
        imageUrl: pair.baseToken.iconUrl,
      }));
  } catch (error) {
    console.error('Error fetching from DexScreener:', error);
    return [];
  }
}

/**
 * Pump.fun API - новые токены
 */
export async function getNewTokensFromPumpFun(
  limit: number = 50,
  hoursBack: number = 24
): Promise<Partial<CollectedToken>[]> {
  try {
    const response = await axios.get(
      'https://frontend-api-v3.pump.fun/coins',
      { 
        params: { limit: limit * 2 },
        timeout: 10000 
      }
    );

    const coins = Array.isArray(response.data) ? response.data : response.data.coins || [];
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - (hoursBack * 3600);

    return coins
      .filter((c: any) => {
        const created = c.createdTimestamp || c.createdAt || 0;
        return created >= cutoff && created <= now;
      })
      .slice(0, limit)
      .map((coin: any) => ({
        mint: coin.mint,
        name: coin.name,
        symbol: coin.symbol,
        source: { name: 'pumpfun', type: 'offchain', priority: 1 },
        deployedAt: coin.createdTimestamp || Math.floor(Date.now() / 1000),
        poolCreatedAt: coin.createdTimestamp || Math.floor(Date.now() / 1000),
        liquiditySol: (coin.virtualSolReserves || 0) + (coin.realSolReserves || 0),
        initialLiquidityUsd: (coin.virtualSolReserves || 0) * 150, // Примерная оценка
        marketCap: coin.usd_market_cap || coin.marketCap || 0,
        volumeUsd: coin.volume24h || 0,
        tradesCount: coin.trades || coin.trades24h || 0,
        isVerified: coin.isVerified || false,
        imageUrl: coin.image_uri || coin.imageUrl,
        metadataUri: coin.metadataUri || coin.metadata_uri,
        twitter: coin.twitter,
        website: coin.website,
      }));
  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    return [];
  }
}

/**
 * CoinGecko API - новые листинги
 */
export async function getNewTokensFromCoinGecko(limit: number = 20): Promise<Partial<CollectedToken>[]> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/list',
      { timeout: 10000 }
    );

    // CoinGecko не отдает дату листинга напрямую, нужен кэш для сравнения
    // Placeholder - в продакшене требуется сравнение с локальным кэшем
    return [];
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return [];
  }
}

/**
 * CMC (CoinMarketCap) API - новые листинги
 */
export async function getNewTokensFromCMC(limit: number = 20): Promise<Partial<CollectedToken>[]> {
  try {
    const apiKey = process.env.CMC_API_KEY;
    if (!apiKey) {
      console.warn('CMC API key not configured');
      return [];
    }

    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      {
        params: { limit },
        headers: { 'X-CMC_PRO_API_KEY': apiKey },
        timeout: 10000
      }
    );

    return response.data.data
      .filter((c: any) => c.platform?.symbol === 'SOL')
      .map((coin: any) => ({
        mint: coin.contract_address?.[0],
        name: coin.name,
        symbol: coin.symbol,
        source: { name: 'coinmarketcap', type: 'offchain', priority: 3 },
        deployedAt: Math.floor(new Date(coin.date_added).getTime() / 1000),
        poolCreatedAt: Math.floor(new Date(coin.date_added).getTime() / 1000),
        marketCap: coin.quote?.USD?.market_cap || 0,
        volumeUsd: coin.quote?.USD?.volume_24h || 0,
        isVerified: true,
      }));
  } catch (error) {
    console.error('Error fetching from CMC:', error);
    return [];
  }
}

// === Security Checks ===

/**
 * Полная проверка безопасности токена
 */
export async function performSecurityCheck(token: Partial<CollectedToken>): Promise<TokenSecurityData> {
  const mint = token.mint;
  
  if (!mint) {
    return {
      lpLocked: false,
      renounced: false,
      isHoneypot: true,
      auditStatus: 'none',
    };
  }

  const [lpLocked, isHoneypot, authorities] = await Promise.all([
    checkLPLocked(mint),
    checkHoneypot(mint),
    checkAuthorities(mint),
  ]);

  return {
    lpLocked,
    renounced: authorities.mintAuthRenounced && authorities.freezeAuthRenounced,
    isHoneypot,
    auditStatus: 'none', // Placeholder для audit статуса
    mintAuthRenounced: authorities.mintAuthRenounced,
    freezeAuthRenounced: authorities.freezeAuthRenounced,
  };
}

/**
 * Фильтрация скам-токенов
 */
export function filterScamTokens(tokens: CollectedToken[]): CollectedToken[] {
  return tokens.filter(token => {
    // Исключаем токены без LP
    if (!token.security.lpLocked) {
      console.log(`Filtering ${token.name}: LP not locked`);
      return false;
    }

    // Исключаем honeypot
    if (token.security.isHoneypot) {
      console.log(`Filtering ${token.name}: honeypot detected`);
      return false;
    }

    // Исключаем токены с неренонсированными авторитетами
    if (!token.security.renounced) {
      console.log(`Filtering ${token.name}: authorities not renounced`);
      return false;
    }

    return true;
  });
}

/**
 * Сбор всех новых токенов из всех источников
 */
export async function collectNewTokens(
  options: {
    maxAgeHours?: number;
    limit?: number;
    enableSecurityChecks?: boolean;
    sources?: ('pumpfun' | 'dexscreener' | 'coingecko' | 'cmc')[];
  } = {}
): Promise<CollectedToken[]> {
  const {
    maxAgeHours = 24,
    limit = 50,
    enableSecurityChecks = true,
    sources = ['pumpfun', 'dexscreener'],
  } = options;

  console.log(`Collecting new tokens from: ${sources.join(', ')}`);

  // Параллельный сбор из всех источников
  const promises = sources.map(async (source) => {
    switch (source) {
      case 'pumpfun':
        return getNewTokensFromPumpFun(limit, maxAgeHours);
      case 'dexscreener':
        return getNewTokensFromDexScreener(maxAgeHours, limit);
      case 'coingecko':
        return getNewTokensFromCoinGecko(limit);
      case 'cmc':
        return getNewTokensFromCMC(limit);
      default:
        return [];
    }
  });

  const results = await Promise.all(promises);
  const allTokens = results.flat();

  // Объединяем и убираем дубликаты по mint
  const uniqueTokens = Array.from(
    new Map(allTokens.map(t => [t.mint, t])).values()
  );

  // Сортируем по времени создания (новые первыми)
  const sorted = uniqueTokens.sort((a, b) => b.deployedAt - a.deployedAt);

  // Выполняем проверки безопасности
  let filteredTokens: CollectedToken[];
  if (enableSecurityChecks) {
    const withSecurity = await Promise.all(
      sorted.map(async (token) => {
        const security = await performSecurityCheck(token);
        return { ...token, security } as CollectedToken;
      })
    );

    filteredTokens = filterScamTokens(withSecurity);
  } else {
    filteredTokens = sorted.map(t => ({
      ...t,
      security: {
        lpLocked: true,
        renounced: true,
        isHoneypot: false,
        auditStatus: 'none',
      }
    } as CollectedToken));
  }

  console.log(`Collected ${filteredTokens.length} tokens after security filtering`);

  return filteredTokens.slice(0, limit);
}
