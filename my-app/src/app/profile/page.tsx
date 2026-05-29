"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  User,
  Camera,
  Send,
  Play,
  Link as LinkIcon,
  ChevronRight,
  Settings,
  Copy,
  Check,
  Plus,
  Trash2,
  TrendingUp,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/contexts/UserContext";

interface SocialLink {
  id: string;
  platform: "telegram" | "youtube" | "other";
  url: string;
  label: string;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { userId, isLoading, profile, wallets, activeWalletId, setActiveWallet, updateProfile, uploadAvatar, isFirebaseConnected } = useUser();

  const [nickname, setNickname] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [callerLevel, setCallerLevel] = useState("Новичок");

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || "");
      // Ensure social links have ids
      const links = profile.socialLinks?.map((link: any) => ({
        ...link,
        id: link.id || crypto.randomUUID()
      })) || [];
      setSocialLinks(links);
    }
  }, [profile]);

  const activeWallet = wallets.find((w) => w.id === activeWalletId);

  const handleSaveProfile = async () => {
    console.log("💾 Saving profile...");
    try {
      await updateProfile({ 
        nickname, 
        socialLinks 
      });
      addToast("success", "Profile Saved", "Your profile has been updated");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      addToast("error", "Save Failed", "Failed to save profile: " + (err.message || ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500KB for Firestore)
    if (file.size > 500 * 1024) {
      addToast("error", "File Too Large", "Image must be less than 500KB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      addToast("error", "Invalid File", "Please select an image file");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Convert to Base64
      const base64 = await fileToBase64(selectedFile);
      
      // Save to Firestore (stored as base64 string)
      await updateProfile({ avatarUrl: base64 });
      
      addToast("success", "Avatar Uploaded", "Your avatar has been updated");
      setShowUploadDialog(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      addToast("error", "Upload Failed", "Failed to upload avatar (may be too large)");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatarUrl: undefined });
      addToast("success", "Avatar Removed", "Your avatar has been removed");
    } catch (err) {
      addToast("error", "Remove Failed", "Failed to remove avatar");
    }
  };

  const addSocialLink = (platform: "telegram" | "youtube" | "other") => {
    if (socialLinks.length >= 3) {
      addToast("error", "Limit Reached", "You can add up to 3 links");
      return;
    }
    setSocialLinks([
      ...socialLinks,
      {
        id: crypto.randomUUID(),
        platform,
        url: "",
        label: platform === "telegram" ? "Telegram" : platform === "youtube" ? "YouTube" : "Link",
      },
    ]);
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setSocialLinks(socialLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      addToast("success", "Copied", "Address copied to clipboard");
    } catch {
      addToast("error", "Copy Failed", "Failed to copy to clipboard");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "telegram":
        return <Send className="h-4 w-4" />;
      case "youtube":
        return <Play className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "telegram":
        return "bg-[#24A1DE]/10 text-[#24A1DE] border-[#24A1DE]/20";
      case "youtube":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted/50 text-muted-foreground border-border/50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (wallets.length === 0 && !isFirebaseConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="mb-8 bg-gradient-to-br from-muted/80 via-muted/50 to-muted/30 backdrop-blur-sm border-border/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-purple/5" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-teal via-teal-light to-teal-dark flex items-center justify-center shadow-xl">
                  <Wallet className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Firebase Not Connected</h1>
                  <p className="text-muted-foreground max-w-md">Your wallets are stored locally. Profile features require Firebase connection.</p>
                </div>
                <Link href="/assets">
                  <Button size="lg" className="h-14 px-8 gap-3 bg-gradient-to-r from-teal to-teal-light hover:from-teal-dark hover:to-teal text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <Wallet className="h-5 w-5" />
                    {t("connect.connectWallet")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M11.25 2h1.5a8.99 8.99 0 0 1 6.36 2.64 9 9 0 0 1 0 12.72 9 9 0 0 1-12.72 0 8.99 8.99 0 0 1-2.64-6.36v-1.5a2 2 0 0 1 2-2h5.5Z" />
                    </svg>
                    <span className="text-sm font-medium text-muted-foreground">Phantom</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M13.8 2h-3.6l-6 18h3.6l1.4-4.2h4.8l1.4 4.2h3.6l-6-18zm-1.8 9l-2.1-6.3 2.1 6.3zm1.8 5.4h-3.6l1.8-5.4 1.8 5.4z" />
                    </svg>
                    <span className="text-sm font-medium text-muted-foreground">Solflare</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User ID Badge - Top Right */}
        {userId && (
          <div className="absolute top-8 right-8 z-10">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">User ID</span>
              <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded border border-border/30">
                {userId.slice(0, 8)}...{userId.slice(-6)}
              </code>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-br from-muted/80 via-muted/50 to-muted/30 backdrop-blur-sm border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-purple/5" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative shrink-0 group">
                  {profile?.avatarUrl ? (
                    <div className="relative">
                      <img 
                        src={profile.avatarUrl} 
                        alt="Avatar" 
                        className="h-24 w-24 rounded-3xl object-cover shadow-xl"
                      />
                      <button
                        onClick={() => handleRemoveAvatar()}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove avatar"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-teal via-teal-light to-teal-dark flex items-center justify-center shadow-xl">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
                    title="Upload avatar"
                  >
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-3 w-full max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nickname</label>
                    <Input
                      placeholder="Enter your nickname..."
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="max-w-sm border-teal-500/20 focus:border-teal-500 bg-background/50"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                      <TrendingUp className="h-3 w-3 mr-1" /> {callerLevel}
                    </Badge>
                    {activeWallet && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg border border-border/30 cursor-pointer hover:border-teal-500/30 transition-colors"
                        onClick={() => copyToClipboard(activeWallet.publicKey, "profile-pk")}
                      >
                        <code className="text-xs font-mono text-muted-foreground">
                          {activeWallet.publicKey.slice(0, 8)}...{activeWallet.publicKey.slice(-6)}
                        </code>
                        {copiedField === "profile-pk" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full h-10 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all mt-2">
                    Save Profile
                  </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-teal-500" />
                      Caller Profile
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Share your sources so others can follow your calls</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{socialLinks.length}/3</Badge>
                </div>
                <div className="space-y-2.5 mb-4">
                  {socialLinks.map((link) => (
                    <div key={link.id} className={`flex items-center gap-3 p-3 rounded-xl border ${getPlatformColor(link.platform)} transition-all`}>
                      <div className="shrink-0">{getPlatformIcon(link.platform)}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <Input
                          placeholder="Label (e.g. My Channel)"
                          value={link.label}
                          onChange={(e) => updateSocialLink(link.id, "label", e.target.value)}
                          className="h-7 text-xs bg-background/50 border-0 focus-visible:ring-1 px-2 py-1"
                        />
                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                          className="h-7 text-xs bg-background/50 border-0 focus-visible:ring-1 px-2 py-1 font-mono"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSocialLink(link.id)} className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                {socialLinks.length < 3 && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => addSocialLink("telegram")} className="gap-1.5 text-xs h-8 border-[#24A1DE]/30 hover:bg-[#24A1DE]/10 hover:border-[#24A1DE]/50">
                      <Plus className="h-3.5 w-3.5" /><Send className="h-3.5 w-3.5" />Telegram
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addSocialLink("youtube")} className="gap-1.5 text-xs h-8 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50">
                      <Plus className="h-3.5 w-3.5" /><Play className="h-3.5 w-3.5" />YouTube
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addSocialLink("other")} className="gap-1.5 text-xs h-8">
                      <Plus className="h-3.5 w-3.5" /><LinkIcon className="h-3.5 w-3.5" />Other
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Trading Setups
                  </h2>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Save and share your favorite trading setups and strategies. This feature will be available in a future update.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted/30 border border-border/30 border-dashed flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Setup {i}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
              <CardContent className="p-5 h-full flex flex-col">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Wallets</h2>
                <div className="space-y-2 flex-1">
                  {wallets.map((wallet) => {
                    const isActive = activeWalletId === wallet.id;
                    return (
                      <button
                        key={wallet.id}
                        onClick={() => {
                          setActiveWallet(wallet.id);
                          localStorage.setItem("active-wallet-id", wallet.id);
                          window.dispatchEvent(new CustomEvent("activeWalletChanged", { detail: wallet.id }));
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          isActive ? "bg-teal-500/10 border-teal-500/30" : "bg-card/60 border-transparent hover:border-border/50 hover:bg-card/80"
                        }`}
                      >
                        <div className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 ${isActive ? "bg-gradient-to-br from-teal-500 to-purple-600" : "bg-muted/50"}`}>
                          <Wallet className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{wallet.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}</div>
                        </div>
                        {isActive && <Check className="h-4 w-4 text-teal-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <Separator className="my-3" />
                <Link href="/assets">
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                    <Settings className="h-3.5 w-3.5" />Manage Wallets<ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Avatar Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-teal-500" />
              Upload Avatar
            </DialogTitle>
            <DialogDescription>
              Select an image file (max 500KB, stored in Firestore)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-teal-500/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                    {selectedFile ? (
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Preview" 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Click to select image"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : "Max 500KB"}
                  </p>
                </div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadAvatar} 
              disabled={!selectedFile || isUploading}
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
