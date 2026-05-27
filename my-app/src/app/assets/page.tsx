"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Copy, Key, Trash2, Eye, EyeOff, Shield, AlertTriangle, Send, Check, ChevronDown, TrendingUp, DollarSign } from "lucide-react";
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

interface ProfitData {
  period: string;
  profit: number;
  percent: number;
}

const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=e1c6a036-1d29-4dd6-b47d-78b438efb6f8";

const profitPeriods: { value: string; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "14D", label: "14D" },
  { value: "30D", label: "30D" },
];

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
  
  // Send modal state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendWalletId, setSendWalletId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
    }
  }, [activeWalletId]);

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

  const generateMockProfitData = (period: string): ProfitData => {
    const baseProfits: Record<string, { profit: number; percent: number }> = {
      "1D": { profit: Math.random() * 1000, percent: Math.random() * 10 },
      "7D": { profit: Math.random() * 5000, percent: Math.random() * 20 },
      "14D": { profit: Math.random() * 10000, percent: Math.random() * 30 },
      "30D": { profit: Math.random() * 20000, percent: Math.random() * 50 },
    };
    const data = baseProfits[period] || baseProfits["7D"];
    return {
      period,
      profit: data.profit,
      percent: data.percent,
    };
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
      setImportMode(false);
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

  const handleAddressClick = async (publicKey: string, walletId: string) => {
    await copyToClipboard(publicKey, `pub-${walletId}`);
  };

  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const activeBalance = activeWalletId ? balances[activeWalletId] : null;
  const profitData = generateMockProfitData(profitPeriod);

  const visibleWallets = wallets.slice(0, showMoreWallets ? wallets.length : 1);
  const hiddenCount = Math.max(0, wallets.length - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-teal-500" />
                  Assets
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your Solana wallets
                </p>
              </div>
            </div>

            {/* Wallet List Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Wallets</h2>
                  <div className="flex items-center gap-2">
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
                </div>

                {wallets.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No wallets yet</p>
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
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {balance?.loading ? (
                                  <div className="flex items-center gap-2">
                                    <span className="animate-spin h-3 w-3 border-2 border-teal-500 border-t-transparent rounded-full" />
                                  </div>
                                ) : (
                                  <>
                                    <div className="font-semibold">
                                      {(balance?.solBalance || 0).toFixed(4)} SOL
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      ${((balance?.usdValue) || 0).toFixed(2)}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePrivateKeyVisibility(wallet.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  {isPrivateVisible ? (
                                    <EyeOff className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendClick(wallet.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWallet(wallet.id);
                                  }}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {isPrivateVisible && (
                            <div className="mt-3 p-2 bg-red-500/5 border border-red-500/20 rounded text-xs">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-red-500 mb-1">Private Key Warning</p>
                                  <p className="text-red-400">
                                    Never share your private key. Full control over wallet. We will never ask for it.
                                  </p>
                                  <div className="mt-2 font-mono bg-red-500/10 p-1 rounded truncate">
                                    {wallet.privateKeyBase58}
                                  </div>
                                </div>
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
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {!importMode ? (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Wallet Name (optional)</label>
                        <Input
                          placeholder="Leave empty for address"
                          value={newWalletName}
                          onChange={(e) => setNewWalletName(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleCreateWallet}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Creating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Wallet
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setImportMode(true)}
                        className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Import Wallet
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Private Key (Base58)</label>
                        <Input
                          placeholder="Enter private key..."
                          value={importPrivateKey}
                          onChange={(e) => setImportPrivateKey(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Wallet Name (optional)</label>
                        <Input
                          placeholder="Leave empty for address"
                          value={importWalletName}
                          onChange={(e) => setImportWalletName(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleImportWallet}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Importing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Import
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setImportMode(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {error && (
                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-xs">
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Wallet Stats */}
            {activeWallet && activeBalance && (
              <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Wallet</p>
                      <p className="font-semibold">{activeWallet.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold text-teal-400">
                        {activeBalance.solBalance.toFixed(4)} SOL
                      </p>
                      <p className="text-sm text-muted-foreground">
                        (${activeBalance.usdValue.toFixed(2)})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profit Calendar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Profit/Loss
                    </h3>
                    <select
                      value={profitPeriod}
                      onChange={(e) => setProfitPeriod(e.target.value)}
                      className="px-2 py-1 bg-background border border-input rounded text-xs"
                    >
                      {profitPeriods.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{profitPeriod} Profit</span>
                      <span className={`font-semibold ${profitData.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {profitData.profit >= 0 ? "+" : ""}${profitData.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Return</span>
                      <span className={`font-semibold ${profitData.percent >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {profitData.percent >= 0 ? "+" : ""}{profitData.percent.toFixed(2)}%
                      </span>
                    </div>
                    {/* Simple profit visualization */}
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            profitData.profit >= 0
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-red-500 to-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.abs(profitData.percent), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activeWalletId && handleSendClick(activeWalletId)}
                    className="border-teal-500/30 text-teal-500 hover:bg-teal-500/10"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportMode(true)}
                    className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Import
                  </Button>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Recipient Address (Solana)</label>
              <Input
                placeholder="Enter Solana address..."
                value={sendToAddress}
                onChange={(e) => setSendToAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a valid Solana address (32-44 base58 characters)
              </p>
            </div>

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
