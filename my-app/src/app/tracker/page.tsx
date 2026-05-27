"use client";

import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  Filter,
  X,
  Check,
  Image as ImageIcon,
  AlertTriangle,
  Shield,
  TrendingDown,
} from "lucide-react";
import { useRef } from "react";
import { searchWallet, getWalletTransactions } from "../../lib/solana-api";
import {
  WalletData,
  GroupData,
  addWalletToFirestore,
  getWalletsFromFirestore,
  updateWalletInFirestore,
  deleteWalletFromFirestore,
  addGroupToFirestore,
  getGroupsFromFirestore,
  updateGroupInFirestore,
  deleteGroupFromFirestore,
} from "../../lib/firebase";

interface Wallet {
  id: number;
  group: string;
  groupEmoji?: string;
  wallet: string;
  balance: string;
  active: boolean;
  lastActivity: number;
  name?: string;
  firebaseId?: string;
}

interface Position {
  id: string;
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
  tokenAddress?: string;
}

const initialGroups = ["All"];

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
  const [groups, setGroups] = useState<{ name: string; emoji?: string }[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isSearchingWallet, setIsSearchingWallet] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Firestore on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingWallets(true);
    setError(null);
    try {
      // Load groups
      try {
        const groupsData = await getGroupsFromFirestore();
        const formattedGroups = groupsData.map(g => ({
          name: g.name,
          emoji: g.emoji,
        }));
        setGroups([{ name: "All", emoji: "" }, ...formattedGroups]);
      } catch (groupsError) {
        console.warn("Error loading groups, using default:", groupsError);
        setGroups([{ name: "All", emoji: "" }]);
      }

      // Load wallets
      try {
        const walletsData = await getWalletsFromFirestore();
        const formattedWallets: Wallet[] = walletsData.map((w, index) => ({
          id: index + 1,
          group: w.group,
          wallet: w.wallet,
          balance: w.balance,
          active: w.active,
          lastActivity: w.lastActivity,
          name: w.name,
          firebaseId: w.id,
        }));
        setWallets(formattedWallets);

        // Load positions from wallets
        await loadPositionsFromWallets(formattedWallets);
      } catch (walletsError) {
        console.error("Error loading wallets:", walletsError);
        setError("Failed to load wallets from Firestore");
        setWallets([]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data from Firestore");
      setWallets([]);
      setGroups([{ name: "All", emoji: "" }]);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const loadPositionsFromWallets = async (walletsList: Wallet[]) => {
    const allPositions: Position[] = [];
    
    for (const wallet of walletsList) {
      try {
        const transactions = await getWalletTransactions(wallet.wallet, 5);
        const positions = transactions.map((tx, idx) => ({
          id: `${wallet.id}-${idx}`,
          group: wallet.group,
          wallet: wallet.wallet,
          asset: "SOL",
          coin: tx.coin,
          action: tx.action,
          mc: tx.mc,
          liq: tx.liq,
          time: tx.time,
          makers5m: "0",
          mcValue: Math.random() * 1000000,
          liqValue: Math.random() * 100000,
          makersValue: 0,
          tokenAddress: tx.mint || undefined,
        }));
        allPositions.push(...positions);
      } catch (err) {
        console.error(`Error loading transactions for wallet ${wallet.wallet}:`, err);
      }
    }
    
    setPositions(allPositions);
  };

  // Position column visibility filters
  const [columnVisibility, setColumnVisibility] = useState({
    group: true,
    wallet: true,
    asset: true,
    coin: true,
    action: true,
    mc: true,
    liq: true,
    time: true,
    makers: true,
  });

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
  const [showManageGroupsDialog, setShowManageGroupsDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  
  // Form states
  const [newWallet, setNewWallet] = useState({ name: "", wallet: "", group: "All" });
  const [newGroupName, setNewGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("");
  const [editingGroupEmoji, setEditingGroupEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [importText, setImportText] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);

  const toggleActive = async (id: number) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;

    setWallets(prev =>
      prev.map(w => (w.id === id ? { ...w, active: !w.active } : w))
    );

    if (wallet.firebaseId) {
      try {
        await updateWalletInFirestore(wallet.firebaseId, { active: !wallet.active });
      } catch (err) {
        console.error("Error updating wallet active status:", err);
      }
    }
  };

  const deleteWallet = async (id: number) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;

    setWallets(prev => prev.filter(w => w.id !== id));

    if (wallet.firebaseId) {
      try {
        await deleteWalletFromFirestore(wallet.firebaseId);
      } catch (err) {
        console.error("Error deleting wallet:", err);
      }
    }
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

  const addWallet = async () => {
    if (!newWallet.wallet) return;
    
    try {
      // Get wallet balance and data from API
      const walletData = await searchWallet(newWallet.wallet);
      const balance = walletData?.balance || "0 SOL";
      const lastActivity = walletData?.lastActive ? Date.now() : Date.now();

      const walletId = await addWalletToFirestore({
        group: newWallet.group,
        wallet: newWallet.wallet,
        balance: balance,
        active: true,
        lastActivity,
        name: newWallet.name || formatAddressName(newWallet.wallet),
      });

      const newId = Math.max(...wallets.map(w => w.id), 0) + 1;
      setWallets(prev => [...prev, {
        id: newId,
        group: newWallet.group,
        wallet: newWallet.wallet,
        balance: balance,
        active: true,
        lastActivity,
        name: newWallet.name || formatAddressName(newWallet.wallet),
        firebaseId: walletId,
      }]);

      // Reload positions for this wallet
      await loadPositionsFromWallets([{
        id: newId,
        group: newWallet.group,
        wallet: newWallet.wallet,
        balance: balance,
        active: true,
        lastActivity,
        name: newWallet.name || formatAddressName(newWallet.wallet),
      }]);

      setNewWallet({ name: "", wallet: "", group: "All" });
      setShowAddWalletDialog(false);
    } catch (err) {
      console.error("Error adding wallet:", err);
      alert("Failed to add wallet to Firestore");
    }
  };

  const formatAddressName = (addr: string): string => {
    if (addr.length < 8) return addr;
    return `${addr.slice(0, 3)}...${addr.slice(-4)}`;
  };

  const saveEditWallet = async () => {
    if (!editingWallet || !newWallet.wallet) return;

    try {
      const updates: Partial<WalletData> = {
        group: newWallet.group || "All",
        wallet: newWallet.wallet,
        name: newWallet.name || formatAddressName(newWallet.wallet),
      };

      await updateWalletInFirestore(editingWallet.firebaseId!, updates);

      setWallets(prev =>
        prev.map(w =>
          w.id === editingWallet.id
            ? { ...w, name: updates.name!, group: updates.group!, wallet: updates.wallet! }
            : w
        )
      );
      setEditingWallet(null);
      setShowEditWalletDialog(false);
    } catch (err) {
      console.error("Error updating wallet:", err);
      alert("Failed to update wallet in Firestore");
    }
  };

  // Group management with emoji support and Firestore persistence
  const addGroup = async () => {
    if (!newGroupName || groups.some(g => g.name === newGroupName)) return;
    
    try {
      const groupId = await addGroupToFirestore({
        name: newGroupName,
        emoji: groupEmoji,
      });
      
      setGroups(prev => [...prev, { name: newGroupName, emoji: groupEmoji }]);
      setNewGroupName("");
      setGroupEmoji("");
      setShowGroupDialog(false);
    } catch (err) {
      console.error("Error adding group:", err);
      alert("Failed to add group");
    }
  };

  const deleteGroup = async (groupName: string) => {
    if (groupName === "All") return;
    const confirmed = confirm(`Delete group "${groupName}"? Wallets will be moved to "All".`);
    if (!confirmed) return;
    
    try {
      // Find group in state to get firebase ID
      const groupToDelete = groups.find(g => g.name === groupName);
      // Note: We don't have firebase ID in current state, need to store it
      // For now, we'll just update local state
      setGroups(prev => prev.filter(g => g.name !== groupName));
      setWallets(prev =>
        prev.map(w => (w.group === groupName ? { ...w, group: "All" } : w))
      );
      if (selectedGroup === groupName) setSelectedGroup("All");
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  const editGroup = (groupName: string, currentEmoji: string) => {
    setEditingGroup(groupName);
    setNewGroupName(groupName);
    setEditingGroupEmoji(currentEmoji);
    setShowGroupDialog(true);
  };

  const saveGroupEdit = async () => {
    if (!editingGroup || !newGroupName) return;
    
    try {
      setGroups(prev =>
        prev.map(g => (g.name === editingGroup ? { name: newGroupName, emoji: editingGroupEmoji } : g))
      );
      setWallets(prev =>
        prev.map(w => (w.group === editingGroup ? { ...w, group: newGroupName } : w))
      );
      if (selectedGroup === editingGroup) setSelectedGroup(newGroupName);
      setEditingGroup(null);
      setNewGroupName("");
      setEditingGroupEmoji("");
      setShowGroupDialog(false);
    } catch (err) {
      console.error("Error updating group:", err);
    }
  };

  const deleteAllWallets = async () => {
    setShowDeleteAllDialog(true);
  };

  const deleteAllWalletsConfirmed = async () => {
    try {
      // Delete all wallets from Firestore
      for (const wallet of wallets) {
        if (wallet.firebaseId) {
          await deleteWalletFromFirestore(wallet.firebaseId);
        }
      }
      setWallets([]);
      setPositions([]);
      setShowDeleteAllDialog(false);
    } catch (err) {
      console.error("Error deleting all wallets:", err);
      alert("Failed to delete all wallets");
    }
  };

  const importWallets = () => {
    setShowImportDialog(true);
  };

  const processImport = () => {
    const lines = importText.split("\n").filter(line => line.trim());
    const newWalletsData: Wallet[] = [];
    
    lines.forEach((line, index) => {
      const addr = line.trim();
      if (addr.length > 10) {
        const newId = Math.max(...wallets.map(w => w.id), 0) + index + 1;
        newWalletsData.push({
          id: newId,
          group: "All",
          wallet: addr,
          balance: "0 SOL",
          active: true,
          lastActivity: Date.now(),
          name: formatAddressName(addr),
        });
      }
    });

    setWallets(prev => [...prev, ...newWalletsData]);
    setImportText("");
    setShowImportDialog(false);
  };

  const emojis = ["🚀", "💎", "🔥", "⭐", "🌟", "💫", "✨", "🎯", "🎨", "🎮", "⚡", "🌈", "🦄", "🐲", "🏆", "💰", "⚔️", "🛡️", "👑", "🎪", "🎭", "🎨", "🌺", "🌻", "🌹", "🍀", "🍁", "❄️", "🔥", "⛵", "🚀", "🛸", "🌙", "🌞", "🌟", "💥", "🎵", "🎶", "🎸", "🎹", "🎺", "🎻", "🥁", "🎬", "🎮", "🎲", "🎯", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🎗️"];

  const openEditWalletDialog = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setNewWallet({ name: wallet.name || "", wallet: wallet.wallet, group: wallet.group });
    setShowEditWalletDialog(true);
  };

  const copyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
  };

  // Get coin icon from DexScreener or return default
  const getCoinIcon = (tokenAddress?: string, coinName?: string) => {
    if (tokenAddress) {
      return `https://api.dexscreener.com/token-icons/v1/solana/${tokenAddress}`;
    }
    return null;
  };

  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);
  const coinImageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

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
    setColumnVisibility({
      group: true,
      wallet: true,
      asset: true,
      coin: true,
      action: true,
      mc: true,
      liq: true,
      time: true,
      makers: true,
    });
  };

  const hasActiveFilters = filterGroup !== "All" || filterWallets || filterAsset !== "All" || 
    filterAction !== "All" || filterMcMin || filterMcMax || filterLiqMin || filterLiqMax || 
    filterMakersMin || filterMakersMax || 
    !columnVisibility.group || !columnVisibility.wallet || !columnVisibility.asset || 
    !columnVisibility.coin || !columnVisibility.action || !columnVisibility.time ||
    !columnVisibility.mc || !columnVisibility.liq || !columnVisibility.time || !columnVisibility.makers;

  const filteredWallets = wallets.filter(w => {
    const matchesGroup = selectedGroup === "All" || w.group === selectedGroup;
    const matchesSearch =
      w.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.balance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.name && w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-150px)]">
      {/* Loading State */}
      {isLoadingWallets && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span className="ml-3 text-muted-foreground">Loading wallets...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* External Wallet Search */}
      <div className="mb-6 flex-shrink-0">
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

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Side - Wallets Table */}
        <div className="w-1/3 shrink-0 flex flex-col min-h-0">
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col flex-1 min-h-0">
            {/* Header with Add Button */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wallets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchExternalWallet();
                  }
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              onClick={() => {
                setShowAddWalletDialog(true);
                if (walletSearchQuery.trim()) {
                  setNewWallet({ name: "", wallet: walletSearchQuery, group: "All" });
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
                <Button
                  key={group.name}
                  variant={selectedGroup === group.name ? "default" : "secondary"}
                  size="sm"
                  className="h-8 text-xs font-semibold px-3 rounded-lg"
                  onClick={() => setSelectedGroup(group.name)}
                >
                  {group.emoji && <span className="mr-1">{group.emoji}</span>}
                  {group.name}
                </Button>
              ))}
              <Button
                onClick={() => { setShowManageGroupsDialog(true); }}
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
                  <DropdownMenuItem onClick={importWallets}>
                    <Download className="h-4 w-4 mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setShowManageGroupsDialog(true); }}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Groups
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteAllDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Wallets Table */}
            <Table className="flex-1 min-h-0">
              <TableHeader className="sticky top-0 bg-card z-10">
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
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                    Active
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[110px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/30">
                {filteredWallets.map((wallet) => {
                  const groupEmoji = groups.find(g => g.name === wallet.group)?.emoji || "";
                  return (
                  <TableRow key={wallet.id} className="border-border/30">
                    <TableCell className="text-center py-2">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {groupEmoji && <span className="mr-0.5">{groupEmoji}</span>}
                        {wallet.group}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="text-center font-mono text-xs cursor-pointer hover:text-teal-500 transition-colors py-2"
                      onClick={() => viewWalletAnalytics(wallet.wallet)}
                      title="Click to copy and view analytics"
                    >
                      {wallet.name || formatAddressName(wallet.wallet)}
                    </TableCell>
                    <TableCell 
                      className="text-center text-xs font-semibold cursor-pointer hover:text-teal-500 transition-colors py-2"
                      onClick={() => viewWalletAnalytics(wallet.wallet)}
                    >
                      {wallet.balance}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div 
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => viewWalletAnalytics(wallet.wallet)}
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(wallet.lastActivity)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); copyWallet(wallet.wallet); }}
                          title="Copy"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); toggleActive(wallet.id); }}
                          title={wallet.active ? "Mute" : "Unmute"}
                        >
                          {wallet.active ? (
                            <Bell className="h-3 w-3 text-green-500" />
                          ) : (
                            <BellOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); deleteWallet(wallet.id); }}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-red-500 hover:text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Side - Positions Table */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col flex-1 min-h-0">
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
                  {/* Column Visibility - Beautiful Toggle Pills */}
                  <div className="col-span-4 mb-2 pb-2 border-b border-border/30">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Show/Hide Columns</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(columnVisibility).map(([key, visible]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setColumnVisibility(prev => ({ ...prev, [key]: !prev[key as keyof typeof columnVisibility] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            visible
                              ? "bg-teal-500/20 text-teal-500 border border-teal-500/40"
                              : "bg-muted text-muted-foreground border border-border/50 opacity-60"
                          }`}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Group</label>
                    <select
                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                      value={filterGroup}
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <option value="All">All Groups</option>
                      {groups.filter(g => g.name !== "All").map(g => (
                        <option key={g.name} value={g.name}>{g.emoji ? `${g.emoji} ${g.name}` : g.name}</option>
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
            <Table className="flex-1 min-h-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border/30">
                  {columnVisibility.group && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                      Group
                    </TableHead>
                  )}
                  {columnVisibility.wallet && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[100px]">
                      Wallet
                    </TableHead>
                  )}
                  {columnVisibility.asset && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                      Asset
                    </TableHead>
                  )}
                  {columnVisibility.coin && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[120px]">
                      Coin
                    </TableHead>
                  )}
                  {columnVisibility.action && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[70px]">
                      Action
                    </TableHead>
                  )}
                  {columnVisibility.mc && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                      MC
                    </TableHead>
                  )}
                  {columnVisibility.liq && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                      LIQ
                    </TableHead>
                  )}
                  {columnVisibility.time && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[80px]">
                      Time
                    </TableHead>
                  )}
                  {columnVisibility.makers && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-[90px]">
                      Makers/5m
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/30">
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
                      {columnVisibility.group && (
                        <TableCell className="text-center py-2">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {position.group}
                          </Badge>
                        </TableCell>
                      )}
                      {columnVisibility.wallet && (
                        <TableCell 
                          className="text-center font-mono text-xs cursor-pointer hover:text-teal-500 transition-colors py-2"
                          onClick={() => {
                            navigator.clipboard.writeText(position.wallet);
                            router.push(`/tracker/${position.wallet}`);
                          }}
                          title="Click to copy and view analytics"
                        >
                          {position.wallet}
                        </TableCell>
                      )}
                      {columnVisibility.asset && (
                        <TableCell className="text-center py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Coins className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{position.asset}</span>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.coin && (
                        <TableCell className="text-center py-2">
                          <div 
                            className="flex items-center justify-center gap-2 cursor-pointer"
                            onMouseEnter={() => setHoveredCoin(position.coin)}
                            onMouseLeave={() => setHoveredCoin(null)}
                          >
                            {position.tokenAddress ? (
                              <>
                                <div className="relative">
                                  <img
                                    ref={(el) => { coinImageRefs.current[position.coin] = el; }}
                                    src={getCoinIcon(position.tokenAddress) || ""}
                                    alt={position.coin}
                                    className={`h-6 w-6 rounded-full object-cover transition-all duration-200 ${
                                      hoveredCoin === position.coin ? "scale-150 shadow-lg" : ""
                                    }`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                  <ImageIcon 
                                    className={`h-6 w-6 rounded-full bg-muted flex items-center justify-center absolute inset-0 ${
                                      hoveredCoin === position.coin ? "scale-150 shadow-lg" : ""
                                    }`}
                                    style={{ display: position.tokenAddress && coinImageRefs.current[position.coin]?.style.display === 'none' ? 'flex' : 'none' }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-foreground">{position.coin}</span>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-foreground">{position.coin}</span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.action && (
                        <TableCell className="text-center py-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              position.action === "Buy"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                            }`}
                          >
                            {position.action}
                          </span>
                        </TableCell>
                      )}
                      {columnVisibility.mc && (
                        <TableCell className="text-center text-xs font-semibold text-teal-500 py-2">
                          {position.mc}
                        </TableCell>
                      )}
                      {columnVisibility.liq && (
                        <TableCell className="text-center text-xs font-semibold text-blue-500 py-2">
                          {position.liq}
                        </TableCell>
                      )}
                      {columnVisibility.time && (
                        <TableCell className="text-center text-xs text-muted-foreground py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            {position.time}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.makers && (
                        <TableCell className="text-center py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-bold text-foreground">
                              {position.makers5m}
                            </span>
                          </div>
                        </TableCell>
                      )}
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
          setNewWallet({ name: "", wallet: "", group: "All" });
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
                {groups.map(g => (
                  <option key={g.name} value={g.name}>{g.emoji ? `${g.emoji} ${g.name}` : g.name}</option>
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
                setNewWallet({ name: "", wallet: "", group: "All" });
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
          setGroupEmoji("");
          setEditingGroupEmoji("");
          setShowEmojiPicker(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Create New Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? `Edit group: ${editingGroup}`
                : "Enter a name and emoji for the new group"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Group Name</label>
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Emoji (optional)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Choose emoji..."
                  value={editingGroup ? editingGroupEmoji : groupEmoji}
                  onChange={(e) => editingGroup ? setEditingGroupEmoji(e.target.value) : setGroupEmoji(e.target.value)}
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  {editingGroup ? (editingGroupEmoji || "Select") : (groupEmoji || "Select")}
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="grid grid-cols-10 gap-2 mt-2 p-2 bg-muted/50 rounded-lg">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl p-2 hover:bg-muted rounded transition-colors"
                      onClick={() => {
                        if (editingGroup) {
                          setEditingGroupEmoji(emoji);
                        } else {
                          setGroupEmoji(emoji);
                        }
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGroupDialog(false);
                setEditingGroup(null);
                setNewGroupName("");
                setGroupEmoji("");
                setEditingGroupEmoji("");
                setShowEmojiPicker(false);
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

      {/* Manage Groups Dialog */}
      <Dialog open={showManageGroupsDialog} onOpenChange={(open) => {
        if (!open) {
          setShowManageGroupsDialog(false);
          setNewGroupName("");
          setGroupEmoji("");
          setEditingGroup(null);
          setEditingGroupEmoji("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Groups</DialogTitle>
            <DialogDescription>
              Create, edit, or delete wallet groups
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {groups.filter(g => g.name !== "All").map((group) => (
              <div key={group.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
                <span className="font-medium">{group.emoji && <span className="mr-2">{group.emoji}</span>}{group.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingGroup(group.name);
                      setNewGroupName(group.name);
                      setEditingGroupEmoji(group.emoji || "");
                      setShowManageGroupsDialog(false);
                      setShowGroupDialog(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => deleteGroup(group.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {groups.filter(g => g.name !== "All").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No groups yet. Create your first group!</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-border/30">
            <Button
              className="w-full"
              onClick={() => {
                setShowManageGroupsDialog(false);
                setEditingGroup(null);
                setNewGroupName("");
                setGroupEmoji("");
                setShowGroupDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        if (!open) {
          setShowImportDialog(false);
          setImportText("");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Wallets</DialogTitle>
            <DialogDescription>
              Paste wallet addresses (one per line) to import them all at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Wallet Addresses</label>
              <textarea
                className="w-full h-48 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                placeholder={`7xKXtg2jm...Zk9pQx\n3mPLk8nXv...Bn2wQr\n9qWZhR2mY...Tp5kLs`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportText("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={processImport} disabled={!importText.trim()}>
              <Download className="h-4 w-4 mr-2" />
              Import {importText.split('\n').filter(l => l.trim().length > 10).length} Wallets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-lg font-bold">Delete All Wallets?</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently remove all wallets and their associated Live Positions from your tracker. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Warning:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All wallet data will be deleted</li>
                  <li>All live positions will be cleared</li>
                  <li>This action is irreversible</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteAllDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAllWalletsConfirmed}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

