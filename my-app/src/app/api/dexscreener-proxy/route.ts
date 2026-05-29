import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
const DEXSCREENER_PROFILES_BASE = 'https://api.dexscreener.com';

// Лаунчпады для фильтрации новых токенов
const LAUNCHPADS = ['pump.fun', 'meteora', 'pumpswap', 'bonk', 'redium', 'rediumcrrm'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  const baseUrl = endpoint.startsWith('token-profiles')
    ? DEXSCREENER_PROFILES_BASE
    : DEXSCREENER_BASE;

  const url = new URL(`${baseUrl}/${endpoint}`);

  // Forward remaining query params except 'endpoint'
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DexScreener API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `DexScreener API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Если это search endpoint - фильтруем по лаунчпадам
    if (endpoint === 'search' || endpoint.includes('search')) {
      const filteredData = filterByLaunchpads(data);
      return NextResponse.json(filteredData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error proxying to DexScreener API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Фильтрация токенов по лаунчпадам
function filterByLaunchpads(data: any): any {
  if (!data.pairs || !Array.isArray(data.pairs)) {
    return data;
  }

  const filtered = data.pairs.filter((pair: any) => {
    if (pair.chainId !== 'solana') return false;
    
    const dexId = (pair.dexId || '').toLowerCase();
    const url = (pair.url || '').toLowerCase();
    const baseName = (pair.baseToken?.name || '').toLowerCase();
    
    // Проверка по dexId
    if (dexId.includes('pump')) return true;
    if (dexId.includes('meteora')) return true;
    if (dexId.includes('raydium')) return true; // PumpSwap и Bonk используют Raydium
    
    // Проверка по URL
    if (url.includes('pump.fun')) return true;
    if (url.includes('meteora')) return true;
    if (url.includes('raydium')) return true;
    
    // Проверка по имени токена (для Redium)
    if (baseName.includes('redium')) return true;
    
    return false;
  });

  // Сортировка по времени создания (новые первыми)
  const sorted = filtered.sort((a: any, b: any) => {
    const timeA = a.pairCreatedAt || 0;
    const timeB = b.pairCreatedAt || 0;
    return timeB - timeA; // Новые первыми
  });

  return { ...data, pairs: sorted };
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
