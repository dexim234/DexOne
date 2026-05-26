"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Copy,
  Trash2,
  BellOff,
  Bell,
  FileSpreadsheet,
  Download,
  Settings,
  MoreHorizontal,
  Users,
  Wallet,
  Coins,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  Zap,
} from "lucide-react";

const groups = ["All", "Main", "Trading", "Sniper", "Alpha"];

const sampleWallets = [
  {
    id: 1,
    group: "Main",
    wallet: "7xKX...vQp9Z",
    balance: "1,234.56 SOL",
    active: true,
  },
  {
    id: 2,
    group: "Trading",
    wallet: "3mPL...kJ8nX",
    balance: "890.23 SOL",
    active: false,
  },
  {
    id: 3,
    group: "Sniper",
    wallet: "9qWZ...hR2mY",
    balance: "2,567.89 SOL",
    active: true,
  },
  {
    id: 4,
    group: "Alpha",
    wallet: "5nBC...pT4kL",
    balance: "456.78 SOL",
    active: true,
  },
];

const samplePositions = [
  {
    id: 1,
    group: "Main",
    wallet: "7xKX...vQp9Z",
    asset: "SOL",
    coin: "WIF",
    action: "Buy",
    mc: "$1.2M",
    liq: "$345K",
    time: "2m ago",
    makers5m: "234",
  },
  {
    id: 2,
    group: "Trading",
    wallet: "3mPL...kJ8nX",
    asset: "SOL",
    coin: "BONK",
    action: "Sell",
    mc: "$890K",
    liq: "$123K",
    time: "5m ago",
    makers5m: "89",
  },
  {
    id: 3,
    group: "Sniper",
    wallet: "9qWZ...hR2mY",
    asset: "USDC",
    coin: "POPCAT",
    action: "Buy",
    mc: "$2.3M",
    liq: "$567K",
    time: "1m ago",
    makers5m: "456",
  },
  {
    id: 4,
    group: "Main",
    wallet: "7xKX...vQp9Z",
    asset: "SOL",
    coin: "MEW",
    action: "Sell",
    mc: "$1.8M",
    liq: "$234K",
    time: "8m ago",
    makers5m: "178",
  },
  {
    id: 5,
    group: "Alpha",
    wallet: "5nBC...pT4kL",
    asset: "SOL",
    coin: "BOME",
    action: "Buy",
    mc: "$3.4M",
    liq: "$789K",
    time: "3m ago",
    makers5m: "312",
  },
];

export default function TrackerPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wallets, setWallets] = useState(sampleWallets);
  const [positions] = useState(samplePositions);

  const toggleActive = (id: number) => {
    setWallets(prev =>
      prev.map(w => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const deleteWallet = (id: number) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const filteredWallets = wallets.filter(w => {
    const matchesGroup = selectedGroup === "All" || w.group === selectedGroup;
    const matchesSearch =
      w.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.balance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const filteredPositions = positions.filter(p => {
    const matchesGroup = selectedGroup === "All" || p.group === selectedGroup;
    const matchesSearch =
      p.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wallet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Left Side - Wallets Table */}
        <div className="w-1/3 shrink-0">
          <div className="bg-card rounded-xl border border-border/50 p-4">
            {/* Header Controls */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Group Selector */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {groups.map((group) => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? "default" : "secondary"}
                  size="sm"
                  className="h-8 text-xs font-semibold px-3 rounded-lg"
                  onClick={() => setSelectedGroup(group)}
                >
                  {group}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Wallets
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Wallets Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    Group
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[100px]">
                    Wallet
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Balance
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[60px]">
                    Active
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id} className="border-border/30">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {wallet.group}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{wallet.wallet}</TableCell>
                    <TableCell className="text-xs font-semibold">{wallet.balance}</TableCell>
                    <TableCell>
                      {wallet.active ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigator.clipboard.writeText(wallet.wallet)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleActive(wallet.id)}
                        >
                          {wallet.active ? (
                            <BellOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Bell className="h-3 w-3 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => deleteWallet(wallet.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Side - Positions Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border border-border/50 p-4">
            {/* Positions Header */}
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-500" />
                Live Positions
              </h2>
              <Badge variant="secondary" className="text-xs">
                {filteredPositions.length} active
              </Badge>
            </div>

            {/* Positions Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    Group
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[100px]">
                    Wallet
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[60px]">
                    Asset
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    Coin
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[60px]">
                    Action
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    MC
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    LIQ
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">
                    Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-[80px] text-right">
                    Makers/5m
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow key={position.id} className="border-border/30">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {position.group}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{position.wallet}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{position.asset}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={position.action === "Buy" ? "default" : "destructive"}
                        className="text-[10px] font-semibold"
                      >
                        {position.coin}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          position.action === "Buy"
                            ? "default"
                            : "secondary"
                        }
                        className={`text-[10px] font-bold ${
                          position.action === "Buy"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {position.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-teal-500">
                      {position.mc}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-blue-500">
                      {position.liq}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {position.time}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-bold text-foreground">
                          {position.makers5m}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
