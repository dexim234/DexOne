"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Copy,
  Trash2,
  BellOff,
  Bell,
  FileSpreadsheet,
  Download,
  Settings,
  Plus,
  Users,
  Wallet,
  Coins,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  Zap,
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  X,
} from "lucide-react";
import { searchWallet } from "@/lib/solana-api";

interface Wallet {
  id: number;
  group: string;
  wallet: string;
  balance: string;
  active: boolean;
  lastActivity: number;
  name?: string;
}

interface Position {
  id: number;
  group: string;
  wallet: string;
  asset: string;
  coin: string;
  action: string;
  mc: string;
  liq: string;
  time: string;
  makers5m: string;
  mcValue: number;
  liqValue: number;
  makersValue: number;
}

const initialGroups = ["All", "Main", "Trading", "Sniper", "Alpha"];

const initialWallets: Wallet[] = [
  {
    id: 1,
    group: "Main",
    wallet: "7xKXtvQp9ZmKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    balance: "1,234.56 SOL",
    active: true,
    lastActivity: Date.now() - 120000,
    name: "Primary Wallet",
  },
  {
    id: 2,
    group: "Trading",
    wallet: "3mPLkJ8nXpnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    balance: "890.23 SOL",
    active: false,
    lastActivity: Date.now() - 3600000,
    name: "Trading Bot",
  },
  {
    id: 3,
    group: "Sniper",
    wallet: "9qWZRhR2mYihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8u",
    balance: "2,567.89 SOL",
    active: true,
    lastActivity: Date.now() - 30000,
    name: "Sniper #1",
  },
  {
    id: 4,
    group: "Alpha",
    wallet: "5nBCpT4kLOTOE5TF83wUUFt3GsCEz19ppKDu8QaBn53Hf",
    balance: "456.78 SOL",
    active: true,
    lastActivity: Date.now() - 7200000,
    name: "Alpha Access",
  },
];

const samplePositions: Position[] = [
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
    mcValue: 1200000,
    liqValue: 345000,
    makersValue: 234,
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
    mcValue: 890000,
    liqValue: 123000,
    makersValue: 89,
  },
  {
    id: 3,
    group: "Sniper",
    wallet: "9qWZ...hR2mY",
    asset: "ETH",
    coin: "POPCAT",
    action: "Buy",
    mc: "$2.3M",
    liq: "$567K",
    time: "1m ago",
    makers5m: "456",
    mcValue: 2300000,
    liqValue: 567000,
    makersValue: 456,
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
    mcValue: 1800000,
    liqValue: 234000,
    makersValue: 178,
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
    mcValue: 3400000,
    liqValue: 789000,
    makersValue: 312,
  },
  {
    id: 6,
    group: "Trading",
    wallet: "3mPL...kJ8nX",
    asset: "ETH",
    coin: "SLERF",
    action: "Buy",
    mc: "$5.6M",
    liq: "$1.2M",
    time: "12m ago",
    makers5m: "567",
    mcValue: 5600000,
    liqValue: 1200000,
    makersValue: 567,
  },
  {
    id: 7,
    group: "Sniper",
    wallet: "9qWZ...hR2mY",
    asset: "SOL",
    coin: "TURBO",
    action: "Sell",
    mc: "$780K",
    liq: "$89K",
    time: "15m ago",
    makers5m: "45",
    mcValue: 780000,
    liqValue: 89000,
    makersValue: 45,
  },
];

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default function TrackerPage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [walletSearchQuery, setWalletSearchQuery] = useState<string>("");
  const [groups, setGroups] = useState<string[]>(initialGroups);
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [positions] = useState<Position[]>(samplePositions);
  const [isSearchingWallet, setIsSearchingWallet] = useState(false);

  // Position filters
  const [positionFilters, setShowPositionFilters] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>("All");
  const [filterWallets, setFilterWallets] = useState<string>("");
  const [filterAsset, setFilterAsset] = useState<string>("All");
  const [filterAction, setFilterAction] = useState<string>("All");
  const [filterMcMin, setFilterMcMin] = useState<string>("");
  const [filterMcMax, setFilterMcMax] = useState<string>("");
  const [filterLiqMin, setFilterLiqMin] = useState<string>("");
  const [filterLiqMax, setFilterLiqMax] = useState<string>("");
  const [filterMakersMin, setFilterMakersMin] = useState<string>("");
  const [filterMakersMax, setFilterMakersMax] = useState<string>("");

  // Dialog states
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);
  const [showEditWalletDialog, setShowEditWalletDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  
  // Form states
  const [newWallet, setNewWallet] = useState({ name: "", wallet: "", group: "Main" });
  const [newGroupName, setNewGroupName] = useState("");

  const toggleActive = (id: number) => {
    setWallets(prev =>
      prev.map(w => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const deleteWallet = (id: number) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const viewWalletAnalytics = (address: string) => {
    navigator.clipboard.writeText(address);
    router.push(`/tracker/${address}`);
  };

  const searchExternalWallet = async () => {
    if (!walletSearchQuery.trim()) return;
    
    setIsSearchingWallet(true);
    try {
      const result = await searchWallet(walletSearchQuery);
      if (result) {
        router.push(`/tracker/${walletSearchQuery}`);
      } else {
        alert("Wallet not found or invalid address");
      }
    } catch (error) {
      console.error("Error searching wallet:", error);
      alert("Error searching wallet");
    } finally {
      setIsSearchingWallet(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchExternalWallet();
    }
  };

  const addWallet = () => {
    if (!newWallet.wallet) return;
    const newId = Math.max(...wallets.map(w => w.id)) + 1;
    setWallets(prev => [...prev, {
      id: newId,
      group: newWallet.group,
      wallet: newWallet.wallet,
      balance: "0 SOL",
      active: true,
      lastActivity: Date.now(),
      name: newWallet.name || formatAddressName(newWallet.wallet),
    }]);
    setNewWallet({ name: "", wallet: "", group: "Main" });
    setShowAddWalletDialog(false);
  };

  const formatAddressName = (addr: string): string => {
    if (addr.length < 8) return addr;
    return `${addr.slice(0, 3)}...${addr.slice(-4)}`;
  };

  const saveEditWallet = () => {
    if (!editingWallet) return;
    setWallets(prev =>
      prev.map(w =>
        w.id === editingWallet.id
          ? { ...w, name: newWallet.name, group: newWallet.group, wallet: newWallet.wallet }
          : w
      )
    );
    setEditingWallet(null);
    setShowEditWalletDialog(false);
  };

  const addGroup = () => {
    if (!newGroupName || groups.includes(newGroupName)) return;
    setGroups(prev => [...prev, newGroupName]);
    setNewGroupName("");
    setShowGroupDialog(false);
  };

  const deleteGroup = (groupName: string) => {
    if (groupName === "All") return;
    setGroups(prev => prev.filter(g => g !== groupName));
    setWallets(prev =>
      prev.map(w => (w.group === groupName ? { ...w, group: "Main" } : w))
    );
    if (selectedGroup === groupName) setSelectedGroup("All");
  };

  const editGroup = (groupName: string) => {
    setEditingGroup(groupName);
    setNewGroupName(groupName);
    setShowGroupDialog(true);
  };

  const saveGroupEdit = () => {
    if (!editingGroup || !newGroupName) return;
    setGroups(prev =>
      prev.map(g => (g === editingGroup ? newGroupName : g))
    );
    setWallets(prev =>
      prev.map(w => (w.group === editingGroup ? { ...w, group: newGroupName } : w))
    );
    if (selectedGroup === editingGroup) setSelectedGroup(newGroupName);
    setEditingGroup(null);
    setNewGroupName("");
    setShowGroupDialog(false);
  };

  const openEditWalletDialog = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setNewWallet({ name: wallet.name || "", wallet: wallet.wallet, group: wallet.group });
    setShowEditWalletDialog(true);
  };

  const copyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
  };

  // Filter positions
  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      // Group filter
      if (filterGroup !== "All" && p.group !== filterGroup) return false;
      
      // Wallet filter (comma-separated)
      if (filterWallets.trim()) {
        const walletList = filterWallets.split(",").map(w => w.trim().toLowerCase());
        const walletMatch = walletList.some(w => 
          p.wallet.toLowerCase().includes(w) || w.includes(p.wallet.toLowerCase())
        );
        if (!walletMatch) return false;
      }
      
      // Asset filter
      if (filterAsset !== "All" && p.asset !== filterAsset) return false;
      
      // Action filter
      if (filterAction !== "All" && p.action !== filterAction) return false;
      
      // MC filter
      if (filterMcMin && p.mcValue < parseFloat(filterMcMin)) return false;
      if (filterMcMax && p.mcValue > parseFloat(filterMcMax)) return false;
      
      // LIQ filter
      if (filterLiqMin && p.liqValue < parseFloat(filterLiqMin)) return false;
      if (filterLiqMax && p.liqValue > parseFloat(filterLiqMax)) return false;
      
      // Makers filter
      if (filterMakersMin && p.makersValue < parseInt(filterMakersMin)) return false;
      if (filterMakersMax && p.makersValue > parseInt(filterMakersMax)) return false;
      
      return true;
    });
  }, [positions, filterGroup, filterWallets, filterAsset, filterAction, 
      filterMcMin, filterMcMax, filterLiqMin, filterLiqMax, filterMakersMin, filterMakersMax]);

  const clearFilters = () => {
    setFilterGroup("All");
    setFilterWallets("");
    setFilterAsset("All");
    setFilterAction("All");
    setFilterMcMin("");
    setFilterMcMax("");
    setFilterLiqMin("");
    setFilterLiqMax("");
    setFilterMakersMin("");
    setFilterMakersMax("");
  };

  const hasActiveFilters = filterGroup !== "All" || filterWallets || filterAsset !== "All" || 
    filterAction !== "All" || filterMcMin || filterMcMax || filterLiqMin || filterLiqMax || 
    filterMakersMin || filterMakersMax;

  const filteredWallets = wallets.filter(w => {
    const matchesGroup = selectedGroup === "All" || w.group === selectedGroup;
    const matchesSearch =
      w.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.balance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.name && w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* External Wallet Search */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
              <Input
                placeholder="Search any Solana wallet address..."
                value={walletSearchQuery}
                onChange={(e) => setWalletSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchExternalWallet()}
                className="pl-10 h-11"
              />
            </div>
            <Button
              onClick={searchExternalWallet}
              disabled={isSearchingWallet}
              className="h-11 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {isSearchingWallet ? "Searching..." : "Analyze Wallet"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Paste a full Solana wallet address to view analytics, PnL, and trading history
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Side - Wallets Table */}
        <div className="w-1/3 shrink-0">
          <div className="bg-card rounded-xl border border-border/50 p-4">
            {/* Header with Add Button */}
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
            <Button
              onClick={() => {
                setShowAddWalletDialog(true);
                if (walletSearchQuery.trim()) {
                  setNewWallet(prev => ({ ...prev, wallet: walletSearchQuery, name: formatAddressName(walletSearchQuery) }));
                }
              }}
              className="h-9 px-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
            </div>

            {/* Group Management */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {groups.map((group) => (
                <div key={group} className="relative group">
                  <Button
                    variant={selectedGroup === group ? "default" : "secondary"}
                    size="sm"
                    className="h-8 text-xs font-semibold px-3 rounded-lg"
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group}
                  </Button>
                  {group !== "All" && (
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); editGroup(group); }}
                        className="p-1 bg-muted rounded-full hover:bg-accent"
                      >
                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteGroup(group); }}
                        className="p-1 bg-muted rounded-full hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                onClick={() => { setEditingGroup(null); setNewGroupName(""); setShowGroupDialog(true); }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
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
                  <DropdownMenuItem onClick={() => { setShowGroupDialog(true); setEditingGroup(null); setNewGroupName(""); }}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Groups
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
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                    Group
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[100px]">
                    Wallet
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                    Balance
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                    Active
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id} className="border-border/30">
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {wallet.group}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="text-center font-mono text-xs cursor-pointer hover:text-teal-500 transition-colors"
                      onClick={() => viewWalletAnalytics(wallet.wallet)}
                      title="Click to copy and view analytics"
                    >
                      {wallet.name || wallet.wallet.slice(0, 8) + "..." + wallet.wallet.slice(-4)}
                    </TableCell>
                    <TableCell 
                      className="text-center text-xs font-semibold cursor-pointer hover:text-teal-500 transition-colors"
                      onClick={() => viewWalletAnalytics(wallet.wallet)}
                    >
                      {wallet.balance}
                    </TableCell>
                    <TableCell className="text-center">
                      <div 
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => viewWalletAnalytics(wallet.wallet)}
                      >
                        <div className={`h-2 w-2 rounded-full ${wallet.active ? "bg-green-500" : "bg-gray-500"}`} />
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {formatTimeAgo(wallet.lastActivity)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); copyWallet(wallet.wallet); }}
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); toggleActive(wallet.id); }}
                          title={wallet.active ? "Mute" : "Unmute"}
                        >
                          {wallet.active ? (
                            <Bell className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
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
            {/* Positions Header with Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-500" />
                  Live Positions
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredPositions.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={positionFilters ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs px-3"
                  onClick={() => setShowPositionFilters(!positionFilters)}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1.5 h-2 w-2 rounded-full bg-teal-500" />
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {positionFilters && (
              <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border/30">
                <div className="grid grid-cols-4 gap-4">
                  {/* Group */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Group</label>
                    <select
                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                      value={filterGroup}
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <option value="All">All Groups</option>
                      {groups.filter(g => g !== "All").map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Wallets */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Wallets</label>
                    <Input
                      placeholder="addr1, addr2..."
                      value={filterWallets}
                      onChange={(e) => setFilterWallets(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Asset */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Asset</label>
                    <select
                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                      value={filterAsset}
                      onChange={(e) => setFilterAsset(e.target.value)}
                    >
                      <option value="All">All Assets</option>
                      <option value="SOL">SOL</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Action</label>
                    <select
                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                    >
                      <option value="All">All Actions</option>
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                  </div>

                  {/* MC */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Market Cap ($)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filterMcMin}
                        onChange={(e) => setFilterMcMin(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filterMcMax}
                        onChange={(e) => setFilterMcMax(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* LIQ */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Liquidity ($)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filterLiqMin}
                        onChange={(e) => setFilterLiqMin(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filterLiqMax}
                        onChange={(e) => setFilterLiqMax(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Makers */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Makers/5m</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filterMakersMin}
                        onChange={(e) => setFilterMakersMin(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filterMakersMax}
                        onChange={(e) => setFilterMakersMax(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Positions Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    Group
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[100px]">
                    Wallet
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                    Asset
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    Coin
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                    Action
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    MC
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    LIQ
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[90px]">
                    Makers/5m
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No positions match your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPositions.map((position) => (
                    <TableRow key={position.id} className="border-border/30">
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {position.group}
                        </Badge>
                      </TableCell>
                      <TableCell 
                        className="text-center font-mono text-xs cursor-pointer hover:text-teal-500 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(position.wallet);
                          router.push(`/tracker/${position.wallet}`);
                        }}
                        title="Click to copy and view analytics"
                      >
                        {position.wallet}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{position.asset}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={position.action === "Buy" ? "default" : "destructive"}
                          className="text-[10px] font-semibold"
                        >
                          {position.coin}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`text-[10px] font-bold ${
                            position.action === "Buy"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {position.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-teal-500">
                        {position.mc}
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-blue-500">
                        {position.liq}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.time}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-bold text-foreground">
                            {position.makers5m}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add/Edit Wallet Dialog */}
      <Dialog open={showAddWalletDialog || showEditWalletDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddWalletDialog(false);
          setShowEditWalletDialog(false);
          setEditingWallet(null);
          setNewWallet({ name: "", wallet: "", group: "Main" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showEditWalletDialog ? "Edit Wallet" : "Add New Wallet"}
            </DialogTitle>
            <DialogDescription>
              {showEditWalletDialog
                ? "Update wallet details"
                : "Enter wallet information to add to tracker"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="Wallet name (optional)"
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Wallet Address</label>
              <Input
                placeholder="Wallet address"
                value={newWallet.wallet}
                onChange={(e) => setNewWallet({ ...newWallet, wallet: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Group</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={newWallet.group}
                onChange={(e) => setNewWallet({ ...newWallet, group: e.target.value })}
              >
                {groups.filter(g => g !== "All").map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddWalletDialog(false);
                setShowEditWalletDialog(false);
                setEditingWallet(null);
                setNewWallet({ name: "", wallet: "", group: "Main" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={showEditWalletDialog ? saveEditWallet : addWallet}>
              {showEditWalletDialog ? "Save Changes" : "Add Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={(open) => {
        if (!open) {
          setShowGroupDialog(false);
          setEditingGroup(null);
          setNewGroupName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Create New Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? `Edit group name: ${editingGroup}`
                : "Enter a name for the new group"}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Group Name</label>
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGroupDialog(false);
                setEditingGroup(null);
                setNewGroupName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingGroup ? saveGroupEdit : addGroup}>
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

