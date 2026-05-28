"use client";

import { useState, useEffect } from "react";
import { Gift, Crown, Zap, Lock, CheckCircle, Copy, Users, TrendingUp, Wallet, Info, Target, Medal, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/components/ui/toast";
import { getWalletsFromStorage } from "@/lib/solana-wallet-creator";

// Tooltip component
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg text-xs max-w-xs z-50 whitespace-normal">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}

export default function RewardsPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [wallets, setWallets] = useState<any[]>([]);
  
  // Challenge state
  const [currentDay, setCurrentDay] = useState(1);
  const [todayVolume, setTodayVolume] = useState(0);
  const [targetVolume] = useState(1); // 1 SOL target
  const [totalCashback, setTotalCashback] = useState(0.0);
  const [claimAmount, setClaimAmount] = useState(0.0);
  const [cashbackCoins, setCashbackCoins] = useState(0);
  
  // Referral stats
  const [referralStats, setReferralStats] = useState({
    tier1: 0,
    tier2: 0,
    tier3: 0,
    totalEarned: 0.0,
    callRewards: 0.0,
    salesAlerts: 0.0,
  });

  useEffect(() => {
    // Load wallets
    const loadedWallets = getWalletsFromStorage();
    setWallets(loadedWallets);
    
    // Simulate loading volume (in real app, fetch from blockchain)
    const totalVolume = loadedWallets.reduce((acc, wallet) => acc + (Math.random() * 0.5), 0);
    setTodayVolume(Math.min(totalVolume, 1.0));
  }, []);

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/?ref=your_username`;
    navigator.clipboard.writeText(referralLink);
    addToast("success", "Copied!", "Referral link copied to clipboard");
  };

  const handleClaim = () => {
    if (claimAmount > 0) {
      addToast("success", "Claimed!", `${claimAmount} SOL has been claimed`);
      setClaimAmount(0);
    } else {
      addToast("info", "Nothing to claim", "No rewards available yet");
    }
  };

  const challengeDays = [1, 2, 3, 4, 5, 6, 7];
  const isDayCompleted = (day: number) => day < currentDay;
  const isCurrentDay = (day: number) => day === currentDay;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600">
            <Gift className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("nav.rewards")}
            </h1>
            <p className="text-muted-foreground">
              Earn rewards by completing challenges and inviting friends
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Challenge & Stats (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Challenge Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-teal-500" />
                    <h2 className="text-lg font-bold">Weekly Challenge</h2>
                    <Tooltip content="Complete the weekly challenge and get 50% cashback. For completing each day of the challenge - up to 0.05 SOL and/or 25% cashback for 24 hours">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold">
                    {currentDay} of 7
                  </Badge>
                </div>

                {/* Progress Bar with Days */}
                <div className="flex items-center justify-between mb-6">
                  {challengeDays.map((day) => (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDayCompleted(day)
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 border-green-400"
                          : isCurrentDay(day)
                          ? "bg-gradient-to-br from-teal-500 to-cyan-500 border-teal-400 animate-pulse"
                          : "bg-muted border-border"
                      }`}>
                        {isDayCompleted(day) ? (
                          <Gift className="h-5 w-5 text-white" />
                        ) : (
                          <span className="text-sm font-bold">{day}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Day {day}</span>
                    </div>
                  ))}
                </div>

                {/* Today's Progress */}
                <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-teal-500" />
                      <span className="font-semibold">Today's Progress</span>
                    </div>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      {todayVolume.toFixed(3)} / {targetVolume} SOL
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${(todayVolume / targetVolume) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {todayVolume >= targetVolume 
                      ? "🎉 Challenge completed! Reward ready to claim" 
                      : `${(targetVolume - todayVolume).toFixed(3)} SOL remaining for today's gift`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reward Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Cashback Rate */}
              <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur">
                <CardContent className="p-4 text-center">
                  <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Cashback Rate</p>
                  <p className="text-3xl font-bold text-purple-500">7%</p>
                </CardContent>
              </Card>

              {/* Claimable */}
              <Card className="border-border/50 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Medal className="h-6 w-6 text-teal-500" />
                    <Button
                      onClick={handleClaim}
                      disabled={claimAmount === 0}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                    >
                      Claim
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Claimable</p>
                  <p className="text-2xl font-bold text-teal-500">{claimAmount.toFixed(4)} SOL</p>
                </CardContent>
              </Card>

              {/* CashBack Coins */}
              <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-6 w-6 text-orange-500" />
                    <Button
                      onClick={handleClaim}
                      disabled={cashbackCoins === 0}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50"
                    >
                      Claim
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">CashBack Coins</p>
                  <p className="text-2xl font-bold text-orange-500">{cashbackCoins}</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Program */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-500" />
                    <h2 className="text-lg font-bold">Referral Program</h2>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                  >
                    Invite Friends
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Referral Tiers */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Tier 1</p>
                    <p className="text-xl font-bold text-yellow-500">40%</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Tier 2</p>
                    <p className="text-xl font-bold text-purple-500">5%</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Tier 3</p>
                    <p className="text-xl font-bold text-blue-500">2%</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Call Ref</p>
                    <p className="text-xl font-bold text-green-500">40%</p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/30">
                  <code className="flex-1 text-sm font-mono text-muted-foreground">
                    https://onedex.io/?ref=your_username
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Button */}
            <Button
              className="w-full h-14 text-lg bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 font-bold shadow-lg shadow-teal-500/20"
            >
              <Medal className="h-5 w-5 mr-2" />
              View All Tasks
            </Button>
          </div>

          {/* Right Column - Reward Stats (1/3) */}
          <div className="space-y-4">
            {/* Stats Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-500" />
                  Reward Statistics
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Total Cashback</span>
                    </div>
                    <span className="font-bold text-purple-500">{totalCashback.toFixed(4)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg border border-teal-500/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span className="text-sm font-medium">Referrals</span>
                    </div>
                    <span className="font-bold text-teal-500">{referralStats.totalEarned.toFixed(4)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Call Rewards</span>
                    </div>
                    <span className="font-bold text-green-500">{referralStats.callRewards.toFixed(4)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Sales Alerts</span>
                    </div>
                    <span className="font-bold text-orange-500">{referralStats.salesAlerts.toFixed(4)} SOL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Users by Tier */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-500" />
                  Referral Users
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <span className="text-sm font-medium">Tier 1</span>
                    </div>
                    <span className="font-bold">{referralStats.tier1}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">2</span>
                      </div>
                      <span className="text-sm font-medium">Tier 2</span>
                    </div>
                    <span className="font-bold">{referralStats.tier2}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                      <span className="text-sm font-medium">Tier 3</span>
                    </div>
                    <span className="font-bold">{referralStats.tier3}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Wallets */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-teal-500" />
                  Connected Wallets
                </h2>
                
                <div className="space-y-2">
                  {wallets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No wallets connected
                    </p>
                  ) : (
                    wallets.map((wallet) => (
                      <div key={wallet.id} className="p-2 bg-muted/50 rounded-lg border border-border/30">
                        <code className="text-xs font-mono text-muted-foreground">
                          {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-8)}
                        </code>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
