import axios from 'axios';

// Типы данных для токенов Pump.fun
export interface PumpToken {
  uri: string;
  name: string;
  symbol: string;
  metadataUri: string;
  mint: string;
  mintAuthority: string;
  freezeAuthority: string | null;
  decimals: number;
  createdTimestamp: number;
  showHowToUse: boolean;
  family: string;
  virtualSolReserves?: number;
  virtualTokenReserves?: number;
  realSolReserves?: number;
  realTokenReserves?: number;
  totalSupply?: number;
  marketCap?: number;
  price?: number;
  priceChange1h?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  volume24h?: number;
  volumeChange?: number;
  mcChange?: number;
  trades?: number;
  trades24h?: number;
  holders?: number;
  liquidity?: number;
  isVerified?: boolean;
  imageUrl?: string;
}

// Интерфейс для ответа API
export interface PumpCoinsResponse {
  coins: PumpToken[];
  hasNextPage: boolean;
  endCursor?: string;
}

// Интерфейс для параметров запроса
export interface PumpCoinsParams {
  orderBy?: 'createdAt' | 'marketCap' | 'volume24h' | 'trades';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
  createdAtGte?: number;
  createdAtLte?: number;
}

// Интерфейс для данных токена в формате TrenchCard
export interface TokenMarketData {
  rank: string;
  logo: string;
  name: string;
  symbol: string;
  mint: string;
  mc: string;
  mcChange: string;
  volume24h: string;
  volumeChange: string;
  priceChange1h: string;
  priceChange24h: string;
  priceChange7d: string;
  trades: string;
  holders: string;
  isVerified: boolean;
  imageUrl?: string;
  metadataUri?: string;
}

class PumpFunApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'https://frontend-api-v3.pump.fun') {
    this.baseUrl = baseUrl;
  }

  /**
   * Установить токен авторизации
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Получить общие настройки API
   */
  private getAxiosConfig() {
    const config: any = {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://pump.fun',
      }
    };

    if (this.authToken) {
      config.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return config;
  }

  /**
   * Получить список токенов с фильтрами
   */
  async getCoins(params?: PumpCoinsParams): Promise<PumpCoinsResponse> {
    const url = new URL(`${this.baseUrl}/coins`);
    
    if (params) {
      if (params.orderBy) url.searchParams.append('orderBy', params.orderBy);
      if (params.orderDirection) url.searchParams.append('orderDirection', params.orderDirection);
      if (params.limit) url.searchParams.append('limit', params.limit.toString());
      if (params.cursor) url.searchParams.append('cursor', params.cursor);
      if (params.createdAtGte) url.searchParams.append('createdAtGte', params.createdAtGte.toString());
      if (params.createdAtLte) url.searchParams.append('createdAtLte', params.createdAtLte.toString());
    }

    const response = await axios.get<PumpCoinsResponse>(url.toString(), this.getAxiosConfig());
    return response.data;
  }

  /**
   * Получить трендовые токены
   */
  async getTrendingCoins(limit: number = 50): Promise<PumpToken[]> {
    const response = await axios.get<PumpCoinsResponse>(
      `${this.baseUrl}/coins/trending`,
      { ...this.getAxiosConfig(), params: { limit } }
    );
    return response.data.coins || [];
  }

  /**
   * Получить новые токены (созданные недавно)
   */
  async getNewCoins(limit: number = 50, cursor?: string): Promise<PumpCoinsResponse> {
    return this.getCoins({
      orderBy: 'createdAt',
      orderDirection: 'desc',
      limit,
      cursor,
    });
  }

  /**
   * Получить токены по конкретному ID/mint address
   */
  async getCoinById(mint: string): Promise<PumpToken | null> {
    try {
      const response = await axios.get<PumpToken>(
        `${this.baseUrl}/coins/${mint}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching coin ${mint}:`, error);
      return null;
    }
  }

  /**
   * Получить несколько токенов по массиву mint addresses
   */
  async getCoinsByIds(mints: string[]): Promise<PumpToken[]> {
    const promises = mints.map(mint => this.getCoinById(mint));
    const results = await Promise.all(promises);
    return results.filter((token): token is PumpToken => token !== null);
  }

  /**
   * Преобразовать PumpToken в формат TokenMarketData для карточек
   */
  convertToMarketData(token: PumpToken, rank: number): TokenMarketData {
    const formatNumber = (num?: number): string => {
      if (num === undefined || num === null) return '0';
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
      if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
      return `$${num.toFixed(2)}`;
    };

    const formatPercent = (val?: number): string => {
      if (val === undefined || val === null) return '0.00%';
      return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
    };

    const formatVolume = (num?: number): string => {
      if (num === undefined || num === null) return '$0';
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
      if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
      return `$${num.toFixed(2)}`;
    };

    return {
      rank: rank.toString(),
      logo: token.imageUrl || token.metadataUri || '/placeholder.png',
      name: token.name || token.symbol || 'Unknown',
      symbol: token.symbol || '',
      mint: token.mint,
      mc: formatNumber(token.marketCap || token.virtualSolReserves || 0),
      mcChange: formatPercent(token.mcChange || token.priceChange24h),
      volume24h: formatVolume(token.volume24h),
      volumeChange: formatPercent(token.volumeChange),
      priceChange1h: formatPercent(token.priceChange1h),
      priceChange24h: formatPercent(token.priceChange24h),
      priceChange7d: formatPercent(token.priceChange7d),
      trades: (token.trades || token.trades24h || 0).toString(),
      holders: (token.holders || 0).toString(),
      isVerified: token.isVerified || false,
      imageUrl: token.imageUrl,
      metadataUri: token.metadataUri,
    };
  }

  /**
   * Получить токены для колонки "New" (самые свежие)
   */
  async getNewTokens(limit: number = 20): Promise<TokenMarketData[]> {
    const response = await this.getNewCoins(limit);
    return response.coins.map((token, index) => 
      this.convertToMarketData(token, index + 1)
    );
  }

  /**
   * Получить токены для колонки "Soon" (предстоящие/популярные)
   */
  async getSoonTokens(limit: number = 20): Promise<TokenMarketData[]> {
    const trending = await this.getTrendingCoins(limit);
    return trending.map((token, index) => 
      this.convertToMarketData(token, index + 1)
    );
  }

  /**
   * Получить токены для колонки "Migration" (готовящиеся к миграции)
   */
  async getMigrationTokens(limit: number = 20): Promise<TokenMarketData[]> {
    // Токены с высокой капитализацией, близкие к миграции
    const response = await this.getCoins({
      orderBy: 'marketCap',
      orderDirection: 'desc',
      limit,
    });
    
    // Фильтруем токены, которые близки к миграции (например, MC > 60k)
    const migrationThreshold = 60000;
    const migrationTokens = response.coins.filter(
      token => (token.marketCap || 0) >= migrationThreshold
    );

    return migrationTokens.map((token, index) => 
      this.convertToMarketData(token, index + 1)
    );
  }

  /**
   * Получить изображение токена из metadata
   */
  async getTokenImage(metadataUri: string): Promise<string | null> {
    try {
      const response = await axios.get(metadataUri, {
        timeout: 5000,
      });
      return response.data.image || null;
    } catch (error) {
      console.error('Error fetching token image:', error);
      return null;
    }
  }
}

// Экспорт singleton instance
export const pumpFunApi = new PumpFunApiService();

// Экспорт типов
export type { PumpToken, PumpCoinsResponse, PumpCoinsParams, TokenMarketData };
