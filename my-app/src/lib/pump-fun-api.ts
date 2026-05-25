import axios from 'axios';

// Типы данных для токенов Pump.fun
export interface PumpToken {
  uri?: string;
  name: string;
  symbol: string;
  metadataUri?: string;
  metadata_uri?: string;
  image_uri?: string;
  mint: string;
  mintAuthority?: string;
  freezeAuthority?: string | null;
  decimals?: number;
  createdTimestamp?: number;
  showHowToUse?: boolean;
  family?: string;
  virtualSolReserves?: number;
  virtualTokenReserves?: number;
  realSolReserves?: number;
  realTokenReserves?: number;
  totalSupply?: number;
  marketCap?: number;
  usd_market_cap?: number;
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
  description?: string;
  twitter?: string;
  creator?: string;
  complete?: boolean;
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

export class PumpFunApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  public useProxy: boolean = true; // Использовать прокси для обхода CORS

  constructor(baseUrl: string = 'https://frontend-api-v3.pump.fun') {
    this.baseUrl = baseUrl;
  }

  /**
   * Включить/выключить прокси
   */
  setProxyEnabled(enabled: boolean) {
    this.useProxy = enabled;
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
      }
    };

    if (this.authToken) {
      config.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return config;
  }

  /**
   * Получить URL для запроса (с прокси или напрямую)
   */
  private getApiUrl(path: string, params?: URLSearchParams): string {
    if (this.useProxy) {
      const proxyUrl = '/api/pump-proxy';
      const fullParams = new URLSearchParams(params?.toString() || '');
      fullParams.set('endpoint', path);
      return `${proxyUrl}?${fullParams.toString()}`;
    }
    
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      url.search = params.toString();
    }
    return url.toString();
  }

  /**
   * Получить список токенов с фильтрами
   */
  async getCoins(params?: PumpCoinsParams): Promise<PumpCoinsResponse> {
    const urlSearchParams = new URLSearchParams();
    
    if (params) {
      if (params.orderBy) urlSearchParams.append('orderBy', params.orderBy);
      if (params.orderDirection) urlSearchParams.append('orderDirection', params.orderDirection);
      if (params.limit) urlSearchParams.append('limit', params.limit.toString());
      if (params.cursor) urlSearchParams.append('cursor', params.cursor);
      if (params.createdAtGte) urlSearchParams.append('createdAtGte', params.createdAtGte.toString());
      if (params.createdAtLte) urlSearchParams.append('createdAtLte', params.createdAtLte.toString());
    }

    const url = this.getApiUrl('/coins', urlSearchParams);
    const response = await axios.get<PumpCoinsResponse | PumpToken[]>(url, this.getAxiosConfig());
    
    // Обработка разных форматов ответа
    if (Array.isArray(response.data)) {
      return {
        coins: response.data,
        hasNextPage: false,
      };
    }
    return response.data;
  }

  /**
   * Получить трендовые токены (топ по объему)
   */
  async getTrendingCoins(limit: number = 50): Promise<PumpToken[]> {
    const response = await this.getCoins({
      orderBy: 'volume24h',
      orderDirection: 'desc',
      limit,
    });
    return response.coins || [];
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
      const url = this.getApiUrl(`/coins/${mint}`);
      const response = await axios.get<PumpToken>(url, this.getAxiosConfig());
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

    const imageUrl = this.getTokenImageUrl(token);

    const anyToken = token as any;
    const marketCap = anyToken.usd_market_cap || token.marketCap || token.virtualSolReserves || 0;
    
    return {
      rank: rank.toString(),
      logo: imageUrl,
      name: token.name || token.symbol || 'Unknown',
      symbol: token.symbol || '',
      mint: token.mint,
      mc: formatNumber(marketCap),
      mcChange: formatPercent(token.mcChange || token.priceChange24h),
      volume24h: formatVolume(token.volume24h),
      volumeChange: formatPercent(token.volumeChange),
      priceChange1h: formatPercent(token.priceChange1h),
      priceChange24h: formatPercent(token.priceChange24h),
      priceChange7d: formatPercent(token.priceChange7d),
      trades: (token.trades || token.trades24h || 0).toString(),
      holders: (token.holders || 0).toString(),
      isVerified: token.isVerified || false,
      imageUrl: imageUrl,
      metadataUri: token.metadataUri || anyToken.metadata_uri,
    };
  }

  /**
   * Получить URL изображения токена
   */
  private getTokenImageUrl(token: PumpToken): string {
    const anyToken = token as any;
    
    // 1. Поле image_uri (основное поле в Pump.fun API)
    if (anyToken.image_uri) {
      return this.normalizeIpfsUrl(anyToken.image_uri);
    }
    
    // 2. Поле imageUrl (альтернативное)
    if (token.imageUrl) {
      return this.normalizeIpfsUrl(token.imageUrl);
    }
    
    // 3. Поле metadataUri
    if (token.metadataUri) {
      return this.normalizeIpfsUrl(token.metadataUri);
    }
    
    // 4. Поле uri
    if (token.uri) {
      return this.normalizeIpfsUrl(token.uri);
    }
    
    return '/placeholder.png';
  }
    
  /**
   * Нормализация IPFS URL
   */
  private normalizeIpfsUrl(url: string): string {
    if (!url) return '/placeholder.png';
    
    // Уже HTTP(S)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // IPFS протокол
    if (url.startsWith('ipfs://')) {
      return `https://pump.mypinata.cloud/ipfs/${url.replace('ipfs://', '')}`;
    }
    
    // Хэш IPFS (44 символа для base58)
    if (url.length === 44 || url.length === 46) {
      return `https://pump.mypinata.cloud/ipfs/${url}`;
    }
    
    return url;
  }

  /**
   * Получить токены для колонки "New" (самые свежие)
   */
  async getNewTokens(limit: number = 20): Promise<TokenMarketData[]> {
    try {
      const response = await this.getNewCoins(limit);
      const coins = response.coins || [];
      return coins.map((token, index) => 
        this.convertToMarketData(token, index + 1)
      );
    } catch (error) {
      console.error('Error loading new tokens:', error);
      return [];
    }
  }

  /**
   * Получить токены для колонки "Soon" (предстоящие/популярные)
   */
  async getSoonTokens(limit: number = 20): Promise<TokenMarketData[]> {
    try {
      const trending = await this.getTrendingCoins(limit);
      return trending.map((token, index) => 
        this.convertToMarketData(token, index + 1)
      );
    } catch (error) {
      console.error('Error loading soon tokens:', error);
      return [];
    }
  }

  /**
   * Получить токены для колонки "Migration" (готовящиеся к миграции)
   */
  async getMigrationTokens(limit: number = 20): Promise<TokenMarketData[]> {
    try {
      // Токены с высокой капитализацией, близкие к миграции
      const response = await this.getCoins({
        orderBy: 'marketCap',
        orderDirection: 'desc',
        limit,
      });
      
      const coins = response.coins || [];
      
      // Фильтруем токены, которые близки к миграции (например, MC > 60k)
      const migrationThreshold = 60000;
      const migrationTokens = coins.filter(
        token => (token.marketCap || 0) >= migrationThreshold
      );

      return migrationTokens.map((token, index) => 
        this.convertToMarketData(token, index + 1)
      );
    } catch (error) {
      console.error('Error loading migration tokens:', error);
      return [];
    }
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
// Принудительно включаем прокси для обхода CORS
pumpFunApi.setProxyEnabled(true);
// Версия API: 1.0.1

