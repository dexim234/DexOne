import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Лаунчпады для получения новых токенов
const LAUNCHPAD_QUERIES = [
  'pump.fun',
  'meteora',
  'pumpswap',
  'bonk',
  'redium v4',
  'redium crmm'
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const maxAgeHours = parseInt(searchParams.get('maxAgeHours') || '24');

  try {
    // Параллельно запрашиваем новые токены с всех лаунчпадов
    const promises = LAUNCHPAD_QUERIES.map(async (query) => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}&_cb=${Date.now()}`,
          {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          }
        );

        if (!response.ok) {
          console.warn(`DexScreener error for ${query}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        
        if (!data.pairs || !Array.isArray(data.pairs)) {
          return [];
        }

        // Фильтруем: Solana + нужный лаунчпад + возраст
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
        
        return data.pairs
          .filter((pair: any) => {
            if (pair.chainId !== 'solana') return false;
            if (!pair.pairCreatedAt) return false;
            
            // Проверка по времени создания
            const pairAge = Date.now() - pair.pairCreatedAt;
            const ageInHours = pairAge / (1000 * 60 * 60);
            if (ageInHours > maxAgeHours) return false;

            return true;
          })
          .map((pair: any) => ({
            ...pair,
            source: detectSource(pair),
            ageHours: ((Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60)).toFixed(1)
          }));
      } catch (error) {
        console.error(`Error fetching ${query}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    
    // Объединяем все токены
    const allTokens = results.flat();

    // Сортируем по возрасту (новые первыми)
    const sorted = allTokens.sort((a: any, b: any) => {
      return (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0);
    });

    // Ограничиваем лимитом
    const limited = sorted.slice(0, limit);

    console.log(`[New Tokens] Fetched ${allTokens.length} tokens, showing top ${limited.length}`);

    return NextResponse.json({
      tokens: limited,
      total: allTokens.length,
      limit,
      maxAgeHours,
      timestamp: Date.now()
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error('Error fetching new tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new tokens', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Определение источника токена
function detectSource(pair: any): string {
  const dexId = (pair.dexId || '').toLowerCase();
  const url = (pair.url || '').toLowerCase();
  const baseName = (pair.baseToken?.name || '').toLowerCase();

  if (dexId.includes('pump') || url.includes('pump.fun')) return 'pumpfun';
  if (dexId.includes('meteora') || url.includes('meteora')) return 'meteora';
  if (dexId.includes('raydium')) {
    if (url.includes('pumpswap')) return 'pumpswap';
    if (url.includes('bonk')) return 'bonk';
    if (url.includes('redium')) return 'redium';
    return 'raydium';
  }
  
  if (baseName.includes('redium')) return 'redium';
  
  return 'unknown';
}
