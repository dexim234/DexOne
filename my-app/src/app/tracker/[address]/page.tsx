"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Zap,
  Shield,
} from "lucide-react";

export default function WalletAnalyticsPage() {
  const params = useParams();
  const address = params.address as string;

  // В реальном приложении здесь будет fetch к API
  const walletData = {
    address: address,
    balance: "1,234.56 SOL",
    usdValue: "$234,567.89",
    totalProfit: "+$45,678.90",
    profitPercent: "+23.4%",
    totalTrades: 1234,
    winRate: "67%",
    lastActive: "2 мин назад",
    following: 45,
    followers: 1234,
  };

  const recentPositions = [
    {
      id: 1,
      coin: "WIF",
      action: "Buy",
      entry: "$0.45",
      current: "$0.67",
      pnl: "+48.9%",
      mc: "$1.2M",
      time: "2h ago",
      status: "profit",
    },
    {
      id: 2,
      coin: "BONK",
      action: "Sell",
      entry: "$0.00023",
      current: "$0.00031",
      pnl: "+34.8%",
      mc: "$890K",
      time: "5h ago",
      status: "profit",
    },
    {
      id: 3,
      coin: "POPCAT",
      action: "Buy",
      entry: "$0.12",
      current: "$0.08",
      pnl: "-33.3%",
      mc: "$2.3M",
      time: "1d ago",
      status: "loss",
    },
    {
      id: 4,
      coin: "MEW",
      action: "Sell",
      entry: "$0.0067",
      current: "$0.0089",
      pnl: "+32.8%",
      mc: "$1.8M",
      time: "2d ago",
      status: "profit",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tracker
        </Button>

        <div className="bg-card rounded-xl border border-border/50 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono mb-1">{address}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Top Trader
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Solscan
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Balance</span>
              </div>
              <div className="text-xl font-bold">{walletData.balance}</div>
              <div className="text-xs text-muted-foreground">{walletData.usdValue}</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Total Profit</span>
              </div>
              <div className="text-xl font-bold text-green-500">
                {walletData.totalProfit}
              </div>
              <div className="text-xs text-green-500">{walletData.profitPercent}</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Total Trades</span>
              </div>
              <div className="text-xl font-bold">{walletData.totalTrades}</div>
              <div className="text-xs text-muted-foreground">Win rate: {walletData.winRate}</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Last Active</span>
              </div>
              <div className="text-xl font-bold">{walletData.lastActive}</div>
              <div className="text-xs text-green-500">Active now</div>
            </div>
          </div>

          {/* Social Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/30">
            <div>
              <div className="text-2xl font-bold">{walletData.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{walletData.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Follow
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Positions */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-500" />
          Recent Positions
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Coin
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Action
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Entry → Current
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                PnL
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                MC
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPositions.map((pos) => (
              <TableRow key={pos.id} className="border-border/30">
                <TableCell>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {pos.coin}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-bold ${
                      pos.action === "Buy"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {pos.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {pos.entry} → {pos.current}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-bold ${
                      pos.pnl.startsWith("+") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {pos.pnl}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-semibold text-teal-500">
                  {pos.mc}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {pos.time}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
