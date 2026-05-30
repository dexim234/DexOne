"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  Droplets,
  Activity,
  Users,
  Clock,
  Flame,
  Target,
  Package,
  Crown,
  Globe,
  MessageCircle,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Shield,
  Percent,
  Info,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { pumpFunApi, TokenMarketData } from "@/lib/pump-fun-api";
import { dexScreenerApi, TokenDetailData } from "@/lib/dexscreener-api";
import { validateSolanaAddress } from "@/lib/solana-api";

// Интерфейс для данных графика
interface ChartData {
  time: string;
  mc: number;
  price: number;
}

// Интерфейс для транзакций
interface Transaction {
  id: string;
  type: "buy" | "sell";
  wallet: string;
  amount: number;
  price: number;
  mc: number;
  time: string;
  tokenAmount: number;
}

export default function TokenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mint = params.mint as string;

  const [dexToken, setDexToken] = useState<TokenDetailData | null>(null);
  const [pumpToken, setPumpToken] = useState<TokenMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Данные графика
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1h");
  
  // Данные транзакций
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Торговая панель
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // Метрики
  const [mcHistory, setMcHistory] = useState<number[]>([]);
  const [currentMC, setCurrentMC] = useState<number>(0);

  useEffect(() => {
    const fetchToken = async () => {
      if (!mint) return;
      setLoading(true);
      try {
        const [dexData, pumpData] = await Promise.all([
          dexScreenerApi.getTokenData(mint).catch((err) => {
            console.warn("DexScreener fetch failed:", err);
            return null;
          }),
          pumpFunApi.getCoinById(mint).catch((err) => {
            console.warn("Pump.fun fetch failed:", err);
            return null;
          }),
        ]);

        if (dexData) setDexToken(dexData);
        if (pumpData) setPumpToken(pumpFunApi.convertToMarketData(pumpData, 1));
        
        // Генерируем начальные данные графика
        generateInitialChartData(dexData, pumpData);
        // Генерируем начальные транзакции
        generateInitialTransactions(dexData, pumpData);
      } catch (err) {
        console.error("Error fetching token:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [mint]);

  // Обновление графика в реальном времени
  useEffect(() => {
    const interval = setInterval(() => {
      if (dexToken || pumpToken) {
        updateChartData();
        updateTransactions();
      }
    }, 5000); // Обновление каждые 5 секунд

    return () => clearInterval(interval);
  }, [dexToken, pumpToken]);

  const generateInitialChartData = (dexData: TokenDetailData | null, pumpData: any) => {
    const now = Date.now();
    const points = 60; // 60 точек для графика
    const baseMC = dexData?.marketCap || pumpData?.mc || 1000000;
    const basePrice = dexData?.priceUsd || "0.001";
    
    const data: ChartData[] = [];
    let currentMC = parseFloat(baseMC.toString().replace(/[^0-9.]/g, '')) || 1000000;
    let currentPrice = parseFloat(basePrice) || 0.001;

    for (let i = points; i >= 0; i--) {
      const time = new Date(now - i * 60000); // Каждая точка - 1 минута
      const volatility = (Math.random() - 0.5) * 0.02; // 2% волатильность
      currentMC = currentMC * (1 + volatility);
      currentPrice = currentPrice * (1 + volatility);

      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mc: currentMC,
        price: currentPrice,
      });
    }

    setChartData(data);
    setCurrentMC(currentMC);
    setMcHistory(data.map(d => d.mc));
  };

  const updateChartData = () => {
    setChartData(prev => {
      const lastPoint = prev[prev.length - 1];
      const volatility = (Math.random() - 0.5) * 0.02;
      const newMC = lastPoint.mc * (1 + volatility);
      const newPrice = lastPoint.price * (1 + volatility);
      const now = new Date();

      const newPoint = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mc: newMC,
        price: newPrice,
      };

      setCurrentMC(newMC);
      setMcHistory(h => [...h.slice(1), newMC]);

      return [...prev.slice(1), newPoint];
    });
  };

  const generateInitialTransactions = (dexData: TokenDetailData | null, pumpData: any) => {
    const txs: Transaction[] = [];
    const basePrice = parseFloat(dexData?.priceUsd || "0.001");
    const baseMC = parseFloat((dexData?.marketCap || pumpData?.mc || "1000000").toString().replace(/[^0-9.]/g, ''));

    for (let i = 0; i < 20; i++) {
      const isBuy = Math.random() > 0.4;
      const amount = Math.random() * 10;
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
      const tokenAmount = amount / price;

      txs.push({
        id: `tx-${i}`,
        type: isBuy ? "buy" : "sell",
        wallet: generateRandomWallet(),
        amount,
        price,
        mc: baseMC,
        time: `${Math.floor(Math.random() * 5)}m ago`,
        tokenAmount,
      });
    }

    setTransactions(txs);
  };

  const updateTransactions = () => {
    const isBuy = Math.random() > 0.4;
    const amount = Math.random() * 10;
    const lastPrice = chartData[chartData.length - 1]?.price || 0.001;
    const price = lastPrice * (1 + (Math.random() - 0.5) * 0.01);
    const tokenAmount = amount / price;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: isBuy ? "buy" : "sell",
      wallet: generateRandomWallet(),
      amount,
      price,
      mc: currentMC,
      time: "Just now",
      tokenAmount,
    };

    setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
  };

  const generateRandomWallet = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let wallet = "";
    for (let i = 0; i < 4; i++) wallet += chars[Math.floor(Math.random() * chars.length)];
    return wallet + "..." + wallet;
  };

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number): string => {
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const handleConnectWallet = () => {
    // Здесь будет логика подключения кошелька
    if (walletAddress && validateSolanaAddress(walletAddress)) {
      setIsWalletConnected(true);
    }
  };

  const handleTrade = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    // Здесь будет логика торговли
    console.log(`${tradeMode.toUpperCase()} ${tradeAmount} SOL for ${dexToken?.symbol || "TOKEN"}`);
    alert(`${tradeMode.toUpperCase()} order placed!`);
    setTradeAmount("");
  };

  const getGeckoTerminalUrl = (tokenMint: string) => {
    return `https://www.geckoterminal.com/solana/tokens/${tokenMint}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`;
  };

  const getDexScreenerUrl = (tokenMint: string) => {
    return `https://dexscreener.com/solana/${tokenMint}`;
  };

  const getPumpFunUrl = (tokenMint: string) => {
    return `https://pump.fun/coin/${tokenMint}`;
  };

  const getSolscanUrl = (tokenMint: string) => {
    return `https://solscan.io/token/${tokenMint}`;
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "twitter":
        return <TrendingUp className="h-4 w-4" />;
      case "telegram":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const displayName = dexToken?.name || pumpToken?.name || "Unknown Token";
  const displaySymbol = dexToken?.symbol || pumpToken?.symbol || "???";
  const displayImage = dexToken?.imageUrl || pumpToken?.logo || "/placeholder.png";
  const displayMc = formatNumber(currentMC || parseFloat((dexToken?.marketCap || "0").toString().replace(/[^0-9.]/g, '')) || 0);
  const displayMcChange = pumpToken?.mcChange || dexToken?.priceChange24h || "0.00%";
  const displayVolume24h = dexToken?.volume24h || pumpToken?.volume24h || "$0";
  const displayVolumeChange = pumpToken?.volumeChange || "0.00%";
  const displayHolders = pumpToken?.holders || "0";
  const displayTrades = dexToken?.txns24h || pumpToken?.trades || "0";
  const displayPriceChange1h = dexToken?.priceChange1h || pumpToken?.priceChange1h || "0.00%";
  const displayPriceChange24h = dexToken?.priceChange24h || pumpToken?.priceChange24h || "0.00%";
  const displayPriceChange7d = pumpToken?.priceChange7d || "0.00%";
  const currentPrice = parseFloat(dexToken?.priceUsd || "0");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading token data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dexToken && !pumpToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold mb-2">Token not found</p>
          <p className="text-muted-foreground">
            Could not fetch token data for {formatAddress(mint)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100dvh-4rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => router.push("/market-hub")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPumpFunUrl(mint), "_blank")}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
              Pump.fun
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getDexScreenerUrl(mint), "_blank")}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              DexScreener
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getSolscanUrl(mint), "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Solscan
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Column - Chart & Info */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
          {/* Token Info Card */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-teal-500/60">
                    <Image
                      src={displayImage}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold">{displayName}</h1>
                      <Badge variant="secondary" className="uppercase text-xs">
                        {displaySymbol}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatAddress(mint)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={copyMint}
                      >
                        {copied ? (
                          <span className="text-green-500 text-xs">✓</span>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-500">{displayMc}</div>
                  <div className={`text-sm ${displayMcChange.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {displayMcChange}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Card */}
          <Card className="flex-1 min-h-[400px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-500" />
                  <h2 className="font-semibold">Market Cap</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 mb-4">
                {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                  <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>

              {/* Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
                        if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
                        return value.toFixed(0);
                      }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      formatter={(value: any) => [formatNumber(value), 'MC']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mc" 
                      stroke="#14b8a6" 
                      fillOpacity={1} 
                      fill="url(#colorMc)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Price</div>
                  <div className="font-semibold">{formatPrice(currentPrice)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">1h</div>
                  <div className={`font-semibold ${displayPriceChange1h.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {displayPriceChange1h}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">24h</div>
                  <div className={`font-semibold ${displayPriceChange24h.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {displayPriceChange24h}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">24h Vol</div>
                  <div className="font-semibold">{displayVolume24h}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-teal-500" />
                  Recent Transactions
                </h3>
                <Button variant="ghost" size="sm" className="h-7">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-xs text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-2 text-xs text-muted-foreground">Wallet</th>
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">Amount</th>
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">Price</th>
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">Tokens</th>
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-2">
                          <Badge 
                            variant="secondary" 
                            className={tx.type === "buy" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}
                          >
                            {tx.type === "buy" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {tx.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 font-mono text-xs">{tx.wallet}</td>
                        <td className="py-2 px-2 text-right font-semibold">{tx.amount.toFixed(4)} SOL</td>
                        <td className="py-2 px-2 text-right">{formatPrice(tx.price)}</td>
                        <td className="py-2 px-2 text-right">{tx.tokenAmount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-muted-foreground">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Trade Panel & Metrics */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Trade Panel */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-teal-500" />
                <h3 className="font-semibold">Trade</h3>
              </div>

              {/* Wallet Connection */}
              {!isWalletConnected ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Wallet Address</label>
                    <Input
                      placeholder="Enter your Solana address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleConnectWallet}
                    disabled={!walletAddress}
                  >
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
                    <div className="font-mono text-sm flex items-center gap-2">
                      <span>{formatAddress(walletAddress)}</span>
                      <Shield className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setIsWalletConnected(false)}>
                    Disconnect
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              {/* Trade Form */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={tradeMode === "buy" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTradeMode("buy")}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={tradeMode === "sell" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTradeMode("sell")}
                  >
                    Sell
                  </Button>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Amount (SOL)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    disabled={!isWalletConnected}
                  />
                </div>

                {tradeAmount && parseFloat(tradeAmount) > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens</span>
                      <span className="font-semibold">
                        {(parseFloat(tradeAmount) / currentPrice).toFixed(2)} {displaySymbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">{formatPrice(currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee (0.3%)</span>
                      <span className="font-semibold">{(parseFloat(tradeAmount) * 0.003).toFixed(4)} SOL</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleTrade}
                  disabled={!isWalletConnected || !tradeAmount}
                >
                  {tradeMode === "buy" ? "Buy" : "Sell"} {displaySymbol}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Token Metrics */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-teal-500" />
                <h3 className="font-semibold">Token Metrics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Holders</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {displayHolders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Trades</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {displayTrades}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Liquidity</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {dexToken?.liquidity || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">FDV</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {dexToken?.fdv || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Metrics */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-teal-500" />
                <h3 className="font-semibold">Safety Score</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dev Hold</span>
                  <span className="font-medium">{pumpToken?.devHold || "0"}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top 10 Hold</span>
                  <span className="font-medium">{pumpToken?.top10Hold || "0"}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LP Burn</span>
                  <span className="font-medium">{pumpToken?.lpBurn || "0"}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Snipers</span>
                  <span className="font-medium">{pumpToken?.snipersCount || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint Authority</span>
                  <span className={`font-medium ${pumpToken?.isVerified ? "text-green-500" : "text-yellow-500"}`}>
                    {pumpToken?.isVerified ? "Revoked" : "Active"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          {(dexToken?.websites?.length || dexToken?.socials?.length) && (
            <Card className="shrink-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-teal-500" />
                  <h3 className="font-semibold">Socials</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dexToken?.websites?.map((site, i) => (
                    <Button
                      key={`web-${i}`}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(site.url, "_blank")}
                    >
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      {site.label}
                    </Button>
                  ))}
                  {dexToken?.socials?.map((social, i) => (
                    <Button
                      key={`soc-${i}`}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(social.url, "_blank")}
                    >
                      {getSocialIcon(social.type)}
                      <span className="ml-1.5 capitalize">{social.type}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
