import { NextRequest, NextResponse } from 'next/server';

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
const DEXSCREENER_PROFILES_BASE = 'https://api.dexscreener.com';

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
      },
      next: { revalidate: 10 },
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

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
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

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
