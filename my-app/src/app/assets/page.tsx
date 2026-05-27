"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Copy, Key, Trash2, Eye, EyeOff, Shield, AlertTriangle, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateSolanaWallet, getWalletsFromStorage, removeWalletFromStorage, saveWalletsToStorage, WalletData, importSolanaWallet } from "@/lib/solana-wallet-creator";
import { useTranslation } from "@/contexts/TranslationContext";
import { validateSolanaAddress } from "@/lib/solana-api";

interface WalletBalance {
  [walletId: string]: {
    solBalance: number;
    usdValue: number;
    loading: boolean;
  };
}

export default function AssetsPage() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({});
  const [newWalletName, setNewWalletName] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalance>({});
  
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
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  useEffect(() => {
    if (selectedWalletId) {
      fetchBalance(selectedWalletId);
    }
  }, [selectedWalletId]);

  const loadWallets = () => {
    const savedWallets = getWalletsFromStorage();
    setWallets(savedWallets);
  };

  const fetchBalance = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    setBalances(prev => ({ ...prev, [walletId]: { solBalance: 0, usdValue: 0, loading: true } }));

    try {
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=e1c6a036-1d29-4dd6-b47d-78b438efb6f8`, {
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
      const solPrice = 140; // fallback price

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

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newWallet = await generateSolanaWallet(newWalletName || undefined);
      const updated = [newWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
      setSelectedWalletId(newWallet.id);
      setNewWalletName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      setError("Please enter a private key");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const importedWallet = await importSolanaWallet(importPrivateKey.trim(), importWalletName || undefined);
      const updated = [importedWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
      setSelectedWalletId(importedWallet.id);
      setImportPrivateKey("");
      setImportWalletName("");
      setImportMode(false);
    } catch (err) {
      setError("Invalid private key format. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    if (confirm("Are you sure you want to delete this wallet? This action cannot be undone.")) {
      removeWalletFromStorage(walletId);
      setWallets(prev => {
        const filtered = prev.filter(w => w.id !== walletId);
        if (selectedWalletId === walletId && filtered.length > 0) {
          setSelectedWalletId(filtered[0].id);
        } else if (filtered.length === 0) {
          setSelectedWalletId(null);
        }
        return filtered;
      });
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
    } catch (err) {
      console.error("Failed to copy:", err);
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
      return;
    }

    if (!validateSolanaAddress(sendToAddress.trim())) {
      setSendError("Invalid Solana address format");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      setSendError("Please enter a valid amount");
      return;
    }

    const wallet = wallets.find(w => w.id === sendWalletId);
    const balance = balances[sendWalletId];
    if (balance && amount > balance.solBalance) {
      setSendError("Insufficient balance");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Send transaction simulated!\nFrom: ${wallet?.name}\nTo: ${sendToAddress}\nAmount: ${amount} SOL`);
      setShowSendDialog(false);
      setSendToAddress("");
      setSendAmount("");
      if (sendWalletId) fetchBalance(sendWalletId);
    } catch (err) {
      setSendError("Failed to send transaction");
    } finally {
      setIsSending(false);
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const selectedBalance = selectedWalletId ? balances[selectedWalletId] : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wallet className="h-8 w-8 text-teal-500" />
              {t("nav.assets")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your Solana wallets
            </p>
          </div>
        </div>

        {/* Add Wallet & Wallets List Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Add Wallet Panel */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Add Wallet
              </CardTitle>
              <CardDescription>
                Create a new wallet or import an existing one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!importMode ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Wallet Name (optional)</label>
                    <Input
                      placeholder="My Wallet"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleCreateWallet}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Wallet
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImportMode(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Import Existing Wallet
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Private Key (Base58)</label>
                    <Input
                      placeholder="Enter your private key..."
                      value={importPrivateKey}
                      onChange={(e) => setImportPrivateKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Wallet Name (optional)</label>
                    <Input
                      placeholder="Imported Wallet"
                      value={importWalletName}
                      onChange={(e) => setImportWalletName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleImportWallet}
                      disabled={isLoading}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Importing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Import Wallet
                        </span>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setImportMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallets List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-500" />
                Your Wallets ({wallets.length})
              </h2>
            </div>

            {wallets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No wallets yet. Create your first wallet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {wallets.map((wallet) => {
                  const balance = balances[wallet.id];
                  const isSelected = selectedWalletId === wallet.id;
                  const isPrivateVisible = showPrivateKeys[wallet.id];

                  return (
                    <Card 
                      key={wallet.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? "border-teal-500 ring-2 ring-teal-500/20" 
                          : "border-border/40 hover:border-border"
                      }`}
                      onClick={() => setSelectedWalletId(wallet.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Wallet Header with Name, Balance, and Actions */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Wallet className="h-4 w-4 text-teal-500 shrink-0" />
                                <span className="font-semibold truncate">{wallet.name}</span>
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Eye Button for Private Key */}
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
                                {/* Send Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendClick(wallet.id);
                                  }}
                                  className="h-8 px-3"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWallet(wallet.id);
                                  }}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Balance Display */}
                            <div className="mb-3">
                              {balance?.loading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full" />
                                  <span className="text-sm">Loading balance...</span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-3">
                                  <span className="text-2xl font-bold">
                                    {balance?.solBalance?.toFixed(4) || "0.0000"} SOL
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    (${(balance?.usdValue || 0).toFixed(2)})
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Public Key */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground shrink-0 w-16">Public:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate flex-1">
                                {wallet.publicKey}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(wallet.publicKey, `pub-${wallet.id}`);
                                }}
                                className="h-7 w-7 p-0 shrink-0"
                              >
                                {copiedField === `pub-${wallet.id}` ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {/* Private Key (with toggle visibility) */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground shrink-0 w-16">Private:</span>
                              <div className="flex-1 flex items-center gap-2">
                                <code className={`text-xs bg-muted px-2 py-1 rounded font-mono truncate flex-1 ${
                                  isPrivateVisible ? "text-red-400 bg-red-500/10" : ""
                                }`}>
                                  {isPrivateVisible ? wallet.privateKeyBase58 : "••••••••••••••••"}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(wallet.privateKeyBase58, `priv-${wallet.id}`);
                                  }}
                                  className="h-7 w-7 p-0 shrink-0"
                                >
                                  {copiedField === `priv-${wallet.id}` ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Private Key Security Warning (shown when visible) */}
                            {isPrivateVisible && (
                              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs">
                                <AlertTriangle className="h-3 w-3 inline mr-1 text-red-500" />
                                <span className="font-semibold text-red-500">Private Key Warning: </span>
                                <span className="text-red-400">
                                  Never share your private key. It gives full control over the wallet, allows sending funds, and importing. We will never ask for it.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
            {/* From Wallet (if multiple) */}
            {wallets.length > 1 && (
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
            )}

            {/* To Address */}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {balances[sendWalletId].solBalance.toFixed(4)} SOL
                </p>
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
            <Button onClick={handleSend} disabled={isSending}>
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
