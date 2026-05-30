import { NextRequest, NextResponse } from 'next/server';
import { collectNewTokens, filterScamTokens, performSecurityCheck } from '@/lib/token-collector';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API endpoint для получения новых токенов из multiple источников
 * 
 * Sources:
 * - On-chain (RPC / Indexer): TokenCreated, PairCreated, первые Swap
 * - Off-chain (API / Парсинг): CoinGecko/CMC листинги, DEX скринеры
 * 
 * Scam-filter:
 * - LP locked
 * - Renounced mint/freeze authority
 * - Honeypot check
 * - Audit status
 * 
 * Query Parameters:
 * - maxAgeHours: максимальный возраст токена (по умолчанию 24)
 * - limit: количество токенов (по умолчанию 50)
 * - sources: источники данных (pumpfun,dexscreener,coingecko,cmc)
 * - enableSecurityChecks: включить проверки безопасности (true/false)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const maxAgeHours = parseInt(searchParams.get('maxAgeHours') || '24');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sourcesParam = searchParams.get('sources') || 'pumpfun,dexscreener';
  const enableSecurityChecks = searchParams.get('enableSecurityChecks') !== 'false';

  const sources = sourcesParam.split(',').map(s => s.trim() as any);

  try {
    console.log(`[New Tokens API] Collecting tokens: maxAge=${maxAgeHours}h, limit=${limit}, sources=${sources.join(',')}`);

    const tokens = await collectNewTokens({
      maxAgeHours,
      limit,
      enableSecurityChecks,
      sources,
    });

    return NextResponse.json({
      tokens: tokens.map(t => ({
        mint: t.mint,
        name: t.name,
        symbol: t.symbol,
        source: t.source.name,
        deployedAt: t.deployedAt,
        poolCreatedAt: t.poolCreatedAt,
        liquiditySol: t.liquiditySol,
        initialLiquidityUsd: t.initialLiquidityUsd,
        firstTradeAt: t.firstTradeAt,
        tradesCount: t.tradesCount,
        volumeUsd: t.volumeUsd,
        marketCap: t.marketCap,
        isVerified: t.isVerified,
        security: t.security,
        imageUrl: t.imageUrl,
        metadataUri: t.metadataUri,
        website: t.website,
        twitter: t.twitter,
        telegram: t.telegram,
      })),
      total: tokens.length,
      limit,
      maxAgeHours,
      sources,
      securityChecksEnabled: enableSecurityChecks,
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
      { 
        error: 'Failed to fetch new tokens', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

