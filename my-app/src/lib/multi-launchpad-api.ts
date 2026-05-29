import { TokenMarketData, LaunchpadSource } from './pump-fun-api';

// === DexScreener Fallback для Pump.fun ===
// Если Pump.fun API не возвращает данные, используем DexScreener как fallback
export async function getDexScreenerFallbackTokens(limit: number = 20): Promise<TokenMarketData[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    // Ищем новые Solana токены на DexScreener
    const response = await fetch(
      `/api/dexscreener-proxy?endpoint=search&q=solana&order=createdAt&_cb=${Date.now()}`,
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`DexScreener fallback failed: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.pairs && Array.isArray(data.pairs)) {
      // Фильтруем Solana токены и сортируем по времени создания
      const solanaPairs = data.pairs
        .filter((p: any) => p.chainId === 'solana')
        .sort((a: any, b: any) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
        .slice(0, limit);

      console.log(`[DexScreener Fallback] Loaded ${solanaPairs.length} tokens from DexScreener`);

      return solanaPairs.map((pair: any, index: number) => 
        convertDexPairToMarketData(pair, index + 1, 'pumpfun')
      );
    }
  } catch (e) {
    console.warn('DexScreener fallback failed:', e);
  }

  return generateFallbackTokens('pumpfun', limit);
}

// === PumpSwap API ===
// Токены, мигрировавшие или запущенные на PumpSwap (DEX от Pump.fun)
export async function getPumpSwapTokens(limit: number = 10): Promise<TokenMarketData[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `/api/dexscreener-proxy?endpoint=search&q=pumpswap&_cb=${Date.now()}`,
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);
    const data = await response.json();

    if (data.pairs && Array.isArray(data.pairs)) {
      return data.pairs
        .filter((p: any) => p.chainId === 'solana')
        .slice(0, limit)
        .map((pair: any, index: number) => convertDexPairToMarketData(pair, index + 1, 'pumpswap'));
    }
  } catch (e) {
    console.warn('PumpSwap API fetch failed, using fallback:', e);
  }

  return generateFallbackTokens('pumpswap', limit);
}

// === LetsBonk API ===
export async function getLetsBonkTokens(limit: number = 10): Promise<TokenMarketData[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `/api/dexscreener-proxy?endpoint=search&q=letsbonk&_cb=${Date.now()}`,
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);
    const data = await response.json();

    if (data.pairs && Array.isArray(data.pairs)) {
      return data.pairs
        .filter((p: any) => p.chainId === 'solana')
        .slice(0, limit)
        .map((pair: any, index: number) => convertDexPairToMarketData(pair, index + 1, 'letsbonk'));
    }
  } catch (e) {
    console.warn('LetsBonk API fetch failed, using fallback:', e);
  }

  return generateFallbackTokens('letsbonk', limit);
}

// === Meteora API ===
export async function getMeteoraTokens(limit: number = 10): Promise<TokenMarketData[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(
      `/api/dexscreener-proxy?endpoint=search&q=meteora&_cb=${Date.now()}`,
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);
    const data = await response.json();

    if (data.pairs && Array.isArray(data.pairs)) {
      return data.pairs
        .filter((p: any) => p.chainId === 'solana')
        .slice(0, limit)
        .map((pair: any, index: number) => convertDexPairToMarketData(pair, index + 1, 'meteora'));
    }
  } catch (e) {
    console.warn('Meteora API fetch failed, using fallback:', e);
  }

  return generateFallbackTokens('meteora', limit);
}

// === DexScreener Pair → TokenMarketData ===
function convertDexPairToMarketData(pair: any, rank: number, source: LaunchpadSource): TokenMarketData {
  const base = pair.baseToken || {};
  const quote = pair.quoteToken || {};
  
  // Получаем MC разными способами
  let mc = 0;
  if (pair.marketCap) {
    mc = pair.marketCap;
  } else if (pair.fdv) {
    mc = pair.fdv;
  } else if (pair.priceUsd && quote.priceUsd) {
    // Вычисляем MC через резервы
    const solReserves = pair.baseToken.reserveInUsd || 0;
    mc = solReserves * 2; // Упрощенная оценка
  }
  
  const vol = pair.volume?.h24 || pair.volume24h || 0;
  const priceChange1h = pair.priceChange?.h1 || 0;
  const priceChange24h = pair.priceChange?.h24 || 0;

  const formatNum = (num: number): string => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    if (num === 0) return '$0';
    return `$${num.toFixed(2)}`;
  };

  return {
    rank: rank.toString(),
    logo: base.iconUrl || pair.info?.imageUrl || pair.info?.logo || '/placeholder.png',
    name: base.name || 'Unknown',
    symbol: base.symbol || '',
    mint: base.address || '',
    mc: formatNum(mc),
    mcChange: `${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
    volume24h: formatNum(vol),
    volumeChange: '0.00%',
    priceChange1h: `${priceChange1h >= 0 ? '+' : ''}${priceChange1h.toFixed(2)}%`,
    priceChange24h: `${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
    priceChange7d: '0.00%',
    trades: (pair.txns?.h24?.buys || 0 + pair.txns?.h24?.sells || 0).toString(),
    holders: '-',
    isVerified: pair.info?.verified || false,
    imageUrl: base.iconUrl || pair.info?.imageUrl || pair.info?.logo || '/placeholder.png',
    createdTimestamp: pair.pairCreatedAt ? Math.floor(pair.pairCreatedAt / 1000) : undefined,
    twitter: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
    telegram: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
    website: pair.info?.socials?.find((s: any) => s.type === 'website')?.url,
    source,
    kingOfTheHillRank: '-',
    kingOfTheHillTotal: '-',
    watchers: pair.fdw?.toString() || '-',
    replies: '-',
    replyRate: '-',
    buySellRatio: '-',
    fomoScore: '-',
    devHold: '-',
    top10Hold: '-',
    lpBurn: '-',
    snipersCount: '-',
    bundlersCount: '-',
    freshWallets: '-',
    botTraders: '-',
    dexTaxBuy: '-',
    dexTaxSell: '-',
  };
}

// === Fallback generators ===
const PUMPSwap_NAMES = [
  'SwapCat', 'PumpRocket', 'ApeSwap', 'CurveBall', 'DexFlow',
  'MoonPump', 'SwapStar', 'TurboPump', 'JetSwap', 'AlphaCurve',
];
const LETSBONK_NAMES = [
  'BonkInu', 'BonkRocket', 'BONKzilla', 'BonkMoon', 'SuperBonk',
  'BonkMaster', 'BonkCoin', 'MegaBonk', 'BonkStorm', 'UltraBonk',
];
const METEORA_NAMES = [
  'MeteoraX', 'OrbitPool', 'NovaSwap', 'StellarDex', 'CosmosFlow',
  'Meteorite', 'GalaxyPool', 'NebulaDex', 'AstroSwap', 'CometTrade',
];

function generateFallbackTokens(source: LaunchpadSource, limit: number): TokenMarketData[] {
  const names =
    source === 'pumpswap' ? PUMPSwap_NAMES :
    source === 'letsbonk' ? LETSBONK_NAMES :
    METEORA_NAMES;

  return Array.from({ length: limit }).map((_, i) => {
    const name = names[i % names.length];
    const symbol = name.slice(0, 4).toUpperCase();

    return {
      rank: (i + 1).toString(),
      logo: '/placeholder.png',
      name,
      symbol,
      mint: `${source}${i}Mint${Date.now()}`.slice(0, 44),
      mc: '-',
      mcChange: '-',
      volume24h: '-',
      volumeChange: '-',
      priceChange1h: '-',
      priceChange24h: '-',
      priceChange7d: '-',
      trades: '-',
      holders: '-',
      isVerified: false,
      createdTimestamp: Math.floor(Date.now() / 1000),
      source,
      // Аналитические метрики недоступны без API — показываем "-"
      kingOfTheHillRank: '-',
      kingOfTheHillTotal: '-',
      watchers: '-',
      replies: '-',
      replyRate: '-',
      buySellRatio: '-',
      fomoScore: '-',
      devHold: '-',
      top10Hold: '-',
      lpBurn: '-',
      snipersCount: '-',
      bundlersCount: '-',
      freshWallets: '-',
      botTraders: '-',
      dexTaxBuy: '-',
      dexTaxSell: '-',
    };
  });
}
