"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Copy, Key, Trash2, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSolanaWallet, getWalletsFromStorage, removeWalletFromStorage, saveWalletsToStorage, WalletData } from "@/lib/solana-wallet-creator";
import { useTranslation } from "@/contexts/TranslationContext";

export default function AssetsPage() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({});
  const [newWalletName, setNewWalletName] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const savedWallets = getWalletsFromStorage();
    setWallets(savedWallets);
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newWallet = await generateSolanaWallet(newWalletName || undefined);
      const updated = [newWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
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
      const { importSolanaWallet } = await import("@/lib/solana-wallet-creator");
      const importedWallet = await importSolanaWallet(importPrivateKey.trim(), importWalletName || undefined);
      const updated = [importedWallet, ...wallets];
      saveWalletsToStorage(updated);
      setWallets(updated);
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
      setWallets(prev => prev.filter(w => w.id !== walletId));
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

        {/* Security Warning */}
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-orange-500">Security Warning</p>
                <p className="text-muted-foreground mt-1">
                  Never share your private key with anyone. Store it securely. Anyone with access to your private key can control your funds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Import Wallet Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importMode ? (
                <>
                  <Key className="h-5 w-5 text-yellow-500" />
                  Import Wallet
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-green-500" />
                  Create New Wallet
                </>
              )}
            </CardTitle>
            <CardDescription>
              {importMode
                ? "Import an existing wallet using your private key"
                : "Generate a new Solana wallet with a unique key pair"}
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
                    className="max-w-md"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
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
                        Create Wallet
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
                  <label className="text-sm font-medium mb-2 block">Private Key (Base58 or Base64)</label>
                  <Input
                    placeholder="Enter your private key..."
                    value={importPrivateKey}
                    onChange={(e) => setImportPrivateKey(e.target.value)}
                    className="max-w-md font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Wallet Name (optional)</label>
                  <Input
                    placeholder="Imported Wallet"
                    value={importWalletName}
                    onChange={(e) => setImportWalletName(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="flex gap-2">
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
        <div className="space-y-4">
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
                <p className="text-muted-foreground">No wallets yet. Create your first wallet above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Wallet Name & ID */}
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-teal-500" />
                          <span className="font-semibold">{wallet.name}</span>
                          <span className="text-xs text-muted-foreground">
                            (Created: {new Date(wallet.createdAt).toLocaleDateString()})
                          </span>
                        </div>

                        {/* Public Key */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-16">Public:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono truncate flex-1">
                            {wallet.publicKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(wallet.publicKey, `pub-${wallet.id}`)}
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            {copiedField === `pub-${wallet.id}` ? (
                              <span className="text-green-500 text-xs">OK</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Private Key */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground shrink-0 w-16">Private:</span>
                          <div className="flex-1 flex items-center gap-2">
                            <code className="text-sm bg-red-500/10 px-2 py-1 rounded font-mono truncate flex-1 text-red-400">
                              {showPrivateKeys[wallet.id] ? wallet.privateKeyBase58 : "••••••••••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePrivateKeyVisibility(wallet.id)}
                              className="h-8 w-8 p-0 shrink-0"
                            >
                              {showPrivateKeys[wallet.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.privateKeyBase58, `priv-${wallet.id}`)}
                              className="h-8 w-8 p-0 shrink-0"
                            >
                              {copiedField === `priv-${wallet.id}` ? (
                                <span className="text-green-500 text-xs">OK</span>
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Security Notice for Private Key */}
                    {showPrivateKeys[wallet.id] && (
                      <div className="mt-3 p-2 bg-red-500/5 border border-red-500/20 rounded text-xs text-red-500">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Keep your private key secret. Never share it or store it online.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Solana Wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Public Key</h4>
                <p className="text-muted-foreground">
                  Your public key (address) is safe to share. Others can use it to send you SOL and tokens.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Private Key</h4>
                <p className="text-muted-foreground">
                  Your private key controls your wallet. Anyone with this key can access your funds.
                </p>
              </div>
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-blue-500 font-medium mb-1">Backup Tip:</p>
              <p className="text-muted-foreground">
                Write down your private key on paper and store it in a safe place. This is your only way to recover your wallet if you lose access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
