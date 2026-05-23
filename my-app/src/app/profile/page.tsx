"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Copy,
  Check,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  Zap,
  Shield,
  ArrowRight,
  Camera,
  Wallet,
  Award,
  Globe,
  Star,
  Clock,
  ChevronRight,
  Edit3,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [nickname, setNickname] = useState("Trader_2024");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);
  const [copied, setCopied] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const referralLink = "https://onedex.io/ref/Trader_2024";

  const tradeStats = {
    totalTrades: 1247,
    winRate: 73.5,
    totalProfit: 45670.82,
    avgHoldTime: "4h 32m",
    bestTrade: 8540.0,
    totalVolume: 892456.5,
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleNicknameSave = () => {
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim());
      setIsEditingNickname(false);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    {
      label: "Total Trades",
      value: tradeStats.totalTrades.toLocaleString(),
      icon: TrendingUp,
      colorClass: "text-teal-500",
      trend: "+12.5%",
    },
    {
      label: "Win Rate",
      value: `${tradeStats.winRate}%`,
      icon: Target,
      colorClass: "text-green-500",
      trend: "+5.2%",
    },
    {
      label: "Total Profit",
      value: `$${tradeStats.totalProfit.toLocaleString()}`,
      icon: Wallet,
      colorClass: "text-blue-500",
      trend: "+28.3%",
    },
    {
      label: "Best Trade",
      value: `$${tradeStats.bestTrade.toLocaleString()}`,
      icon: Award,
      colorClass: "text-purple-500",
      trend: "All-time high",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Banner */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal/20 via-purple/20 to-pink/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Profile Header */}
        <div className="relative -mt-24 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-teal via-teal-light to-teal p-1 shadow-2xl">
                <div className="h-full w-full rounded-[22px] overflow-hidden bg-muted relative">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 h-10 w-10 rounded-xl bg-teal hover:bg-teal-dark flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Nickname & Badge */}
            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {isEditingNickname ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="h-10 w-48 font-bold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNicknameSave();
                        if (e.key === "Escape") {
                          setTempNickname(nickname);
                          setIsEditingNickname(false);
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleNicknameSave}
                      className="h-10 w-10 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setTempNickname(nickname);
                        setIsEditingNickname(false);
                      }}
                      className="h-10 w-10 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {nickname}
                      </h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditingNickname(true)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="bg-teal text-white hover:bg-teal-dark">
                      <Zap className="h-3 w-3 mr-1" />
                      Pro Trader
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Member since 2024 • Top 5% Trader
              </p>
            </div>

            {/* Caller Profile Button */}
            <Link href="/calls">
              <Button className="h-12 px-6 gap-2 bg-gradient-to-r from-teal to-teal-light hover:from-teal-dark hover:to-teal text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Users className="h-4 w-4" />
                Caller Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trading Statistics */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-teal" />
                      Trading Statistics
                    </CardTitle>
                    <CardDescription>
                      Your overall trading performance
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setDetailsModalOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    More Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon
                        className={`h-4 w-4 ${stat.colorClass}`}
                      />
                      <span className="text-xs font-semibold text-green-500">
                        {stat.trend}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-2xl bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Avg Hold Time
                      </span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {tradeStats.avgHoldTime}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Total Volume
                      </span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      ${(tradeStats.totalVolume / 1000000).toFixed(2)}M
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card className="bg-gradient-to-br from-teal-muted/40 via-purple-muted/40 to-pink-muted/40 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Invite friends and earn rewards together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Referral Link */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">
                        Your Referral Link
                      </div>
                      <div className="font-mono text-sm text-foreground truncate">
                        {referralLink}
                      </div>
                    </div>
                    <Button
                      onClick={handleCopyReferral}
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Referral Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-background/50">
                      <div className="text-2xl font-bold text-teal">247</div>
                      <div className="text-xs text-muted-foreground">
                        Referrals
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/50">
                      <div className="text-2xl font-bold text-purple">$3,240</div>
                      <div className="text-xs text-muted-foreground">
                        Earned
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-background/50">
                      <div className="text-2xl font-bold text-pink">12.5%</div>
                      <div className="text-xs text-muted-foreground">
                        Commission
                      </div>
                    </div>
                  </div>

                  {/* Benefits Button */}
                  <Button
                    onClick={() => setReferralModalOpen(true)}
                    className="w-full h-12 gap-2 bg-gradient-to-r from-teal to-teal-light hover:from-teal-dark hover:to-teal text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Star className="h-4 w-4" />
                    View Referral Benefits
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Account Level
                  </span>
                  <Badge variant="outline" className="bg-teal-muted text-teal">
                    VIP 3
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    Verification
                  </span>
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-semibold">Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    2FA Status
                  </span>
                  <div className="flex items-center gap-1 text-green-500">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-semibold">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  Connect Wallet
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Achievements
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Referral Benefits Modal */}
      <Dialog open={referralModalOpen} onOpenChange={setReferralModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Referral Program Benefits
            </DialogTitle>
            <DialogDescription>
              Discover all the rewards you can earn by inviting friends
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Tier 1 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-muted/50 to-transparent border border-teal/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-teal flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Direct Referrals</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn from your direct invites
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-13">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  12.5% commission on trading fees
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Instant payouts to your wallet
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No maximum earning limit
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-muted/50 to-transparent border border-purple/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Indirect Referrals</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn from your referrals&apos; invites
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-13">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  5% commission on 2nd level
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Build your network passive income
                </li>
              </ul>
            </div>

            {/* Bonuses */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-muted/50 to-transparent border border-pink/20">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <h4 className="font-bold text-lg">Special Bonuses</h4>
                  <p className="text-sm text-muted-foreground">
                    Exclusive rewards for top referrers
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Bonus 25% for 100+ referrals
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  VIP status upgrades
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Exclusive NFT rewards
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Personal account manager
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={() => setReferralModalOpen(false)}
              className="w-full h-12 gap-2 bg-gradient-to-r from-teal to-teal-light hover:from-teal-dark hover:to-teal text-white"
            >
              Start Referring Friends
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trading Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-6 w-6 text-teal" />
              Trading Performance Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of your trading activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <div className="text-3xl font-bold text-teal">1,247</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Trades
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <div className="text-3xl font-bold text-green">73.5%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Win Rate
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <div className="text-3xl font-bold text-blue">$45.6K</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Profit
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <div className="text-3xl font-bold text-purple">$892K</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Volume
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="p-6 rounded-xl bg-muted/30">
              <h4 className="font-bold mb-4">Performance Overview</h4>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-bold mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  {
                    type: "win",
                    pair: "SOL/USDC",
                    profit: "+$2,540",
                    time: "2 hours ago",
                  },
                  {
                    type: "win",
                    pair: "BONK/USDC",
                    profit: "+$890",
                    time: "5 hours ago",
                  },
                  {
                    type: "loss",
                    pair: "RAY/USDC",
                    profit: "-$320",
                    time: "1 day ago",
                  },
                  {
                    type: "win",
                    pair: "JUP/USDC",
                    profit: "+$1,250",
                    time: "2 days ago",
                  },
                ].map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          trade.type === "win"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        <TrendingUp
                          className={`h-4 w-4 ${
                            trade.type === "win"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{trade.pair}</div>
                        <div className="text-xs text-muted-foreground">
                          {trade.time}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        trade.type === "win"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {trade.profit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
