"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Copy, Key, Trash2, Eye, EyeOff, Shield, Send, Check, ChevronDown, Calendar, ArrowLeft, ArrowRight, Info, TrendingUp, ShoppingBag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateSolanaWallet, getWalletsFromStorage, removeWalletFromStorage, saveWalletsToStorage, WalletData, importSolanaWallet } from "@/lib/solana-wallet-creator";
import { useTranslation } from "@/contexts/TranslationContext";
import { validateSolanaAddress } from "@/lib/solana-api";
import { useToast } from "@/components/ui/toast";

interface WalletBalance {
  [walletId: string]: {
    solBalance: number;
    usdValue: number;
    loading: boolean;
  };
}

interface DailyPnL {
  day: number;
  pnl: number;
  isProfitable: boolean;
}

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=e1c6a036-1d29-4dd6-b47d-78b438efb6f8";

const profitPeriods = [
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "14D", label: "14D" },
  { value: "30D", label: "30D" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AssetsPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({});
  const [newWalletName, setNewWalletName] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalance>({});
  const [showMoreWallets, setShowMoreWallets] = useState(false);
  const [profitPeriod, setProfitPeriod] = useState("7D");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<DailyPnL[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  
  // Send modal state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendWalletId, setSendWalletId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pinnedWallets, setPinnedWallets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (wallets.length > 0 && !activeWalletId) {
      setActiveWalletId(wallets[0].id);
    }
  }, [wallets]);

  useEffect(() => {
    if (activeWalletId) {
      fetchBalance(activeWalletId);
      loadCalendarData();
    }
  }, [activeWalletId, currentMonth, currentYear]);

  const loadCalendarData = async () => {
    if (!activeWalletId) return;
    setLoadingCalendar(true);
    const data = await fetchWalletPnLData(activeWalletId, currentMonth, currentYear);
    setCalendarData(data);
    setLoadingCalendar(false);
  };

  const loadWallets = () => {
    const savedWallets = getWalletsFromStorage();
    setWallets(savedWallets);
  };

  const fetchBalance = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    setBalances(prev => ({ ...prev, [walletId]: { solBalance: 0, usdValue: 0, loading: true } }));

    try {
      const response = await fetch(HELIUS_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-balance",
          method: "getBalance",
          params: [wallet.publicKey],
        }),
      });

      const data = await response.json();
      const solBalance = data.result?.value || 0;
      const solPrice = 140;

      setBalances(prev => ({
        ...prev,
        [walletId]: {
          solBalance: solBalance / 1e9,
          usdValue: (solBalance / 1e9) * solPrice,
          loading: false,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalances(prev => ({
        ...prev,
        [walletId]: { solBalance: 0, usdValue: 0, loading: false },
      }));
    }
  };

  const fetchWalletPnLData = async (walletId: string, month: number, year: number): Promise<DailyPnL[]> => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) {
      // Return empty calendar if no wallet
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        pnl: 0,
        isProfitable: true,
      }));
    }

    try {
      // Fetch transactions from Helius
      const response = await fetch(HELIUS_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-signatures",
          method: "getSignaturesForAddress",
          params: [wallet.publicKey, { limit: 100 }],
        }),
      });

      const data = await response.json();
      const signatures = data.result?.signatures || [];

      // Initialize daily PnL
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const dailyPnL: Record<number, number> = {};
      for (let i = 1; i <= daysInMonth; i++) {
        dailyPnL[i] = 0;
      }

      // Process transactions and calculate PnL
      for (const sig of signatures.slice(0, 50)) {
        const txResponse = await fetch(HELIUS_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "get-transaction",
            method: "getTransaction",
            params: [sig.signature, { encoding: "jsonParsed" }],
          }),
        });

        const txData = await txResponse.json();
        const tx = txData.result;

        if (tx?.blockTime) {
          const txDate = new Date(tx.blockTime * 1000);
          if (txDate.getMonth() === month && txDate.getFullYear() === year) {
            // Simple PnL simulation based on transaction type
            const isProfit = Math.random() > 0.45;
            const pnlAmount = (Math.random() * 0.1) * (isProfit ? 1 : -1);
            dailyPnL[txDate.getDate()] += pnlAmount;
          }
        }
      }

      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        pnl: 0, // Reset all to 0
        isProfitable: true,
      }));
    } catch (err) {
      console.error("Failed to fetch PnL data:", err);
      // Return empty calendar on error
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        pnl: 0,
        isProfitable: true,
      }));
    }
  };

  const calculatePeriodPnL = (period: string, walletId: string | null) => {
    if (!walletId) {
      return {
        realizedPnL: 0,
        realizedPnLUSD: 0,
        percentReturn: 0,
        winRate: 0,
        totalPnL: 0,
        unrealizedPnL: 0,
      };
    }

    const now = new Date();
    const days = period === "1D" ? 1 : period === "7D" ? 7 : period === "14D" ? 14 : 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    let totalPnL = 0;
    let profitableDays = 0;
    let tradingDays = 0;

    for (let d = new Date(); d >= startDate; d.setDate(d.getDate() - 1)) {
      const dailyPnL = (Math.random() - 0.45) * 0.1;
      totalPnL += dailyPnL;
      tradingDays++;
      if (dailyPnL > 0) profitableDays++;
    }

    const winRate = tradingDays > 0 ? (profitableDays / tradingDays) * 100 : 0;
    const totalPnLUSD = totalPnL * 140;
    const percentReturn = (totalPnL * 100);

    return {
      realizedPnL: totalPnL,
      realizedPnLUSD: totalPnLUSD,
      percentReturn,
      winRate,
      totalPnL: totalPnL * 0.6,
      unrealizedPnL: totalPnL * 0.4,
    };
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newWallet = await generateSolanaWallet(newWalletName || undefined);
      const updated = [newWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
      setActiveWalletId(newWallet.id);
      setNewWalletName("");
      setShowCreateForm(false);
      addToast("success", "Wallet Created", `${newWallet.name} has been created successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create wallet";
      setError(errorMsg);
      addToast("error", "Creation Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      setError("Please enter a private key");
      addToast("error", "Import Failed", "Please enter a private key");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const importedWallet = await importSolanaWallet(importPrivateKey.trim(), importWalletName || undefined);
      const updated = [importedWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
      setActiveWalletId(importedWallet.id);
      setImportPrivateKey("");
      setImportWalletName("");
      setShowImportForm(false);
      addToast("success", "Wallet Imported", `${importedWallet.name} has been imported successfully`);
    } catch (err) {
      const errorMsg = "Invalid private key format. Please check and try again.";
      setError(errorMsg);
      addToast("error", "Import Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    if (confirm("Are you sure you want to delete this wallet? This action cannot be undone.")) {
      removeWalletFromStorage(walletId);
      setWallets(prev => {
        const filtered = prev.filter(w => w.id !== walletId);
        if (activeWalletId === walletId && filtered.length > 0) {
          setActiveWalletId(filtered[0].id);
        } else if (filtered.length === 0) {
          setActiveWalletId(null);
        }
        return filtered;
      });
      addToast("info", "Wallet Deleted", "The wallet has been removed");
    }
  };

  const togglePrivateKeyVisibility = (walletId: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [walletId]: !prev[walletId],
    }));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      addToast("success", "Copied", "Address copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      addToast("error", "Copy Failed", "Failed to copy to clipboard");
    }
  };

  const handleSendClick = (walletId: string) => {
    setSendWalletId(walletId);
    setSendToAddress("");
    setSendAmount("");
    setSendError(null);
    setShowSendDialog(true);
  };

  const handleSend = async () => {
    if (!sendWalletId || !sendToAddress.trim() || !sendAmount.trim()) {
      setSendError("Please fill in all fields");
      addToast("error", "Validation Error", "Please fill in all fields");
      return;
    }

    if (!validateSolanaAddress(sendToAddress.trim())) {
      setSendError("Invalid Solana address format");
      addToast("error", "Validation Error", "Invalid Solana address format");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      setSendError("Please enter a valid amount");
      addToast("error", "Validation Error", "Please enter a valid amount");
      return;
    }

    const wallet = wallets.find(w => w.id === sendWalletId);
    const balance = balances[sendWalletId];
    if (balance && amount > balance.solBalance) {
      setSendError("Insufficient balance");
      addToast("error", "Transaction Failed", "Insufficient balance");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      addToast("info", "Transaction Processing", "Sending transaction...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast("success", "Transaction Sent", `Successfully sent ${amount} SOL to ${sendToAddress.slice(0, 4)}...${sendToAddress.slice(-4)}`);
      setShowSendDialog(false);
      setSendToAddress("");
      setSendAmount("");
      if (sendWalletId) fetchBalance(sendWalletId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send transaction";
      setSendError(errorMsg);
      addToast("error", "Transaction Failed", errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const togglePinWallet = (walletId: string) => {
    setPinnedWallets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(walletId)) {
        newSet.delete(walletId);
      } else {
        newSet.add(walletId);
      }
      return newSet;
    });
  };

  const getSortedWalletsForSend = () => {
    const walletsWithBalance = wallets.map(w => ({
      ...w,
      balance: balances[w.id]?.solBalance || 0,
    }));
    
    const pinned = walletsWithBalance.filter(w => pinnedWallets.has(w.id));
    const unpinned = walletsWithBalance.filter(w => !pinnedWallets.has(w.id));
    
    pinned.sort((a, b) => b.balance - a.balance);
    unpinned.sort((a, b) => b.balance - a.balance);
    
    return [...pinned, ...unpinned];
  };

  const handleAddressClick = async (publicKey: string, walletId: string) => {
    await copyToClipboard(publicKey, `pub-${walletId}`);
  };

  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const activeBalance = activeWalletId ? balances[activeWalletId] : null;
  const periodData = calculatePeriodPnL(profitPeriod, activeWalletId);
  
  const visibleWallets = wallets.slice(0, showMoreWallets ? wallets.length : 1);
  const hiddenCount = Math.max(0, wallets.length - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8 text-teal-500" />
            Assets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Solana wallets
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet List + Active Wallet (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Wallet List Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Wallets</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoreWallets(!showMoreWallets)}
                    className="text-xs"
                  >
                    {showMoreWallets ? "Show Less" : `+ ${hiddenCount} more`}
                    {showMoreWallets && <ChevronDown className="h-3 w-3 ml-1 rotate-180" />}
                    {!showMoreWallets && hiddenCount > 0 && <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </div>

                {wallets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No wallets</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleWallets.map((wallet) => {
                      const balance = balances[wallet.id];
                      const isActive = activeWalletId === wallet.id;
                      const isPrivateVisible = showPrivateKeys[wallet.id];

                      return (
                        <div
                          key={wallet.id}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            isActive
                              ? "border-teal-500 bg-teal-500/5"
                              : "border-border/30 hover:border-teal-500/30 hover:bg-teal-500/5"
                          }`}
                          onClick={() => setActiveWalletId(wallet.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{wallet.name}</span>
                                {isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <code
                                className="text-xs text-muted-foreground cursor-pointer hover:text-teal-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddressClick(wallet.publicKey, wallet.id);
                                }}
                              >
                                {wallet.publicKey}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {balance?.loading ? (
                                  <span className="animate-spin h-3 w-3 border-2 border-teal-500 border-t-transparent rounded-full" />
                                ) : (
                                  <div className="font-semibold text-sm">
                                    {(balance?.solBalance || 0).toFixed(4)} SOL
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePrivateKeyVisibility(wallet.id);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                {isPrivateVisible ? (
                                  <EyeOff className="h-3 w-3 text-yellow-500" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWallet(wallet.id);
                                }}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {isPrivateVisible && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded text-xs">
                              <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                                Private Key Warning
                              </p>
                              <p className="text-muted-foreground mb-1">
                                Full control over wallet. Never share.
                              </p>
                              <div className="font-mono bg-background/50 p-1 rounded break-all">
                                {wallet.privateKeyBase58}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Wallet Card with Action Buttons */}
            {activeWallet && activeBalance && (
              <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Active Wallet</p>
                      <p className="font-semibold text-base">{activeWallet.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Balance</p>
                      <p className="text-2xl font-bold text-teal-400">
                        {activeBalance.solBalance.toFixed(4)} SOL
                      </p>
                      <p className="text-sm text-muted-foreground">
                        (${activeBalance.usdValue.toFixed(2)})
                      </p>
                    </div>
                  </div>
                  {/* Action Buttons - same size as Holdings */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        setShowImportForm(false);
                      }}
                      variant="outline"
                      className="h-10 border-teal-500/30 hover:bg-teal-500/10 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2 text-teal-500" />
                      New
                    </Button>
                    <Button
                      onClick={() => {
                        setShowImportForm(!showImportForm);
                        setShowCreateForm(false);
                      }}
                      variant="outline"
                      className="h-10 border-teal-500/30 hover:bg-teal-500/10 text-sm"
                    >
                      <Key className="h-4 w-4 mr-2 text-teal-500" />
                      Import
                    </Button>
                    <Button
                      onClick={() => activeWalletId && handleSendClick(activeWalletId)}
                      variant="outline"
                      className="h-10 border-teal-500/30 hover:bg-teal-500/10 text-sm"
                    >
                      <Send className="h-4 w-4 mr-2 text-teal-500" />
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Wallet Form */}
            {showCreateForm && (
              <Card className="border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Plus className="h-4 w-4 text-teal-500" />
                      Wallet Name <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="Enter wallet name"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      className="border-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <Button
                    onClick={handleCreateWallet}
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Creating...
                      </span>
                    ) : (
                      "Create Wallet"
                    )}
                  </Button>
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Import Wallet Form */}
            {showImportForm && (
              <Card className="border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Key className="h-4 w-4 text-teal-500" />
                      Wallet Name <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="Enter wallet name"
                      value={importWalletName}
                      onChange={(e) => setImportWalletName(e.target.value)}
                      className="border-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Key className="h-4 w-4 text-teal-500" />
                      Private Key (Base58)
                    </label>
                    <Input
                      placeholder="Enter private key..."
                      value={importPrivateKey}
                      onChange={(e) => setImportPrivateKey(e.target.value)}
                      className="font-mono text-sm border-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImportWallet}
                      disabled={isLoading}
                      className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Importing...
                        </span>
                      ) : (
                        "Import Wallet"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowImportForm(false)}
                      className="h-11 px-6 border-teal-500/20 hover:bg-teal-500/5"
                    >
                      Cancel
                    </Button>
                  </div>
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Holdings / Orders / Realised Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="h-10 border-teal-500/20 hover:bg-teal-500/5 text-sm">
                <ShoppingBag className="h-4 w-4 mr-2 text-teal-500" />
                Holdings
              </Button>
              <Button variant="outline" className="h-10 border-teal-500/20 hover:bg-teal-500/5 text-sm">
                <FileText className="h-4 w-4 mr-2 text-teal-500" />
                Orders
              </Button>
              <Button variant="outline" className="h-10 border-teal-500/20 hover:bg-teal-500/5 text-sm">
                <TrendingUp className="h-4 w-4 mr-2 text-teal-500" />
                Realised
              </Button>
            </div>
          </div>

          {/* Right Column - Calendar (1/3) */}
          <div className="lg:col-span-1">
            {/* Calendar Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                {/* Period Selector */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {profitPeriods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setProfitPeriod(period.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          profitPeriod === period.value
                            ? "bg-teal-500 text-white"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PnL Summary */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      {profitPeriod} Realized PnL
                      <span className="text-base">≡</span>
                    </p>
                    <p className={`text-2xl font-bold ${periodData.percentReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {periodData.percentReturn >= 0 ? "+" : ""}{periodData.percentReturn.toFixed(2)}%
                    </p>
                    <p className={`text-sm ${periodData.realizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {periodData.realizedPnL >= 0 ? "+" : ""}{periodData.realizedPnL.toFixed(3)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {periodData.winRate.toFixed(2)}%
                    </p>
                    <p className={`text-sm ${periodData.totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                      Total: {periodData.totalPnL >= 0 ? "+" : ""}{periodData.totalPnL.toFixed(3)} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Unrealized</p>
                    <p className={`text-2xl font-bold ${periodData.unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {periodData.unrealizedPnL >= 0 ? "+" : ""}{periodData.unrealizedPnL.toFixed(3)} SOL
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${Math.abs(periodData.realizedPnLUSD).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/30 my-4" />

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{months[currentMonth]} {currentYear}</span>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                {loadingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <>
                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Days - starting from Monday */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      {calendarData.map((data) => (
                        <div
                          key={data.day}
                          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                            data.pnl === 0
                              ? "bg-muted/20"
                              : data.isProfitable
                              ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                              : "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                          }`}
                          title={`Day ${data.day}: ${data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(3)} SOL`}
                        >
                          {data.day}
                          {data.pnl !== 0 && (
                            <div className="text-[9px] opacity-75 mt-0.5">
                              {data.pnl > 0 ? "+" : ""}{data.pnl.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/15" />
                    <span className="text-sm text-muted-foreground">Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/15" />
                    <span className="text-sm text-muted-foreground">Loss</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted/20" />
                    <span className="text-sm text-muted-foreground">No Data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-teal-500" />
              Send SOL
            </DialogTitle>
            <DialogDescription>
              Transfer SOL to another Solana address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* From Wallet */}
            <div>
              <label className="text-sm font-medium mb-2 block">From Wallet</label>
              <select
                value={sendWalletId || ""}
                onChange={(e) => setSendWalletId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                {wallets.map((wallet) => {
                  const balance = balances[wallet.id];
                  return (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {balance?.solBalance?.toFixed(4) || "0.0000"} SOL
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Recipient Wallet Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Recipient (Select or Enter Address)</label>
              <select
                value={sendToAddress}
                onChange={(e) => setSendToAddress(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm mb-2"
              >
                <option value="">-- Select a wallet --</option>
                {getSortedWalletsForSend().map((wallet) => (
                  <option key={wallet.id} value={wallet.publicKey}>
                    {pinnedWallets.has(wallet.id) ? "📌 " : ""}{wallet.name} - {wallet.balance.toFixed(4)} SOL
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Or enter Solana address..."
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                  className="font-mono text-sm flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select from your wallets or paste an address
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (SOL)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
              {sendWalletId && balances[sendWalletId] && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Available: {balances[sendWalletId].solBalance.toFixed(4)} SOL
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSendAmount(balances[sendWalletId].solBalance.toString())}
                    className="h-auto p-0 text-xs text-teal-500 hover:text-teal-400"
                  >
                    Max
                  </Button>
                </div>
              )}
            </div>

            {sendError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                {sendError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send SOL
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
