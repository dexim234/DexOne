"use client";

import React, { useState, useEffect } from "react";
import { Gift, Crown, Zap, Copy, Users, TrendingUp, Info, Target, Medal, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/components/ui/toast";

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
        <div className="absolute top-0 left-full ml-2 px-4 py-3 bg-popover border border-border rounded-lg shadow-lg text-xs max-w-[400px] z-[100] whitespace-normal">
          {content}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-popover" />
        </div>
      )}
    </div>
  );
}

export default function RewardsPage() {
  const { t, language } = useTranslation();
  const { addToast } = useToast();
  
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
    // In real app, fetch trading volume from blockchain
    setTodayVolume(0);
  }, []);

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/?ref=your_username`;
    navigator.clipboard.writeText(referralLink);
    addToast("success", "Copied!", language === 'en' ? "Referral link copied" : "Ссылка скопирована");
  };

  const handleClaim = () => {
    if (claimAmount > 0) {
      addToast("success", "Claimed!", language === 'en' ? `${claimAmount} SOL claimed` : `${claimAmount} SOL получено`);
      setClaimAmount(0);
    } else {
      addToast("info", "Nothing to claim", language === 'en' ? "No rewards available" : "Награды отсутствуют");
    }
  };

  const challengeDays = [1, 2, 3, 4, 5, 6, 7];
  const isDayCompleted = (day: number) => day < currentDay;
  const isCurrentDay = (day: number) => day === currentDay;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-purple-600">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("nav.rewards")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? "Earn rewards by completing challenges" : "Зарабатывайте награды за выполнение задач"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Challenge & Stats (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Weekly Challenge Card */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-500" />
                    <h2 className="text-base font-bold">{t("rewards.weeklyChallenge")}</h2>
                    <Tooltip content={t("rewards.challengeTooltip")}>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentDay}/7
                  </Badge>
                </div>

                {/* Progress Bar with Days */}
                <div className="flex items-center gap-1 mb-4">
                  {challengeDays.map((day, idx) => (
                    <React.Fragment key={day}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          isDayCompleted(day)
                            ? "bg-green-500/20 border-green-500/40"
                            : isCurrentDay(day)
                            ? "bg-teal-500/20 border-teal-500/40"
                            : "bg-muted border-border"
                        }`}>
                          {isDayCompleted(day) ? (
                            <Gift className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-xs font-semibold">{day}</span>
                          )}
                        </div>
                      </div>
                      {idx < challengeDays.length - 1 && (
                        <div className="w-6 h-px bg-border flex items-center justify-end">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Today's Progress */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-teal-500" />
                      <span className="text-sm font-medium">{t("rewards.today")}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {todayVolume.toFixed(2)} / {targetVolume} SOL
                    </span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${(todayVolume / targetVolume) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {todayVolume >= targetVolume 
                      ? (language === 'en' ? "✓ Reward ready to claim" : "✓ Награда готова к получению") 
                      : (language === 'en' 
                          ? `${(targetVolume - todayVolume).toFixed(2)} SOL to gift` 
                          : `${(targetVolume - todayVolume).toFixed(2)} SOL до подарка`
                        )
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reward Cards */}
            <div className="grid md:grid-cols-3 gap-3">
              <Card className="border-border bg-card">
                <CardContent className="p-3 text-center">
                  <Crown className="h-6 w-6 text-teal-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{t("rewards.cashback")}</p>
                  <p className="text-xl font-bold">7%</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Medal className="h-5 w-5 text-teal-500" />
                    <Button
                      onClick={handleClaim}
                      disabled={claimAmount === 0}
                      variant="outline"
                      className="h-6 px-2 text-xs border-teal-500/50 hover:bg-teal-500/10 dark:text-white text-black dark:hover:text-white hover:text-black"
                    >
                      {language === 'en' ? "Claim" : "Забрать"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? "To Claim" : "Клейм"}</p>
                  <p className="text-lg font-bold">{claimAmount.toFixed(2)} SOL</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Award className="h-5 w-5 text-teal-500" />
                    <Button
                      onClick={handleClaim}
                      disabled={cashbackCoins === 0}
                      variant="outline"
                      className="h-6 px-2 text-xs border-teal-500/50 hover:bg-teal-500/10 dark:text-white text-black dark:hover:text-white hover:text-black"
                    >
                      {language === 'en' ? "Claim" : "Забрать"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">CashBack Coins</p>
                  <p className="text-lg font-bold">{cashbackCoins} SOL</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Program */}
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-500" />
                    <h2 className="text-base font-bold">{t("rewards.referrals")}</h2>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="h-7 px-3 text-xs border-teal-500/50 hover:bg-teal-500/10 dark:text-white text-black dark:hover:text-white hover:text-black"
                  >
                    {language === 'en' ? "Invite" : "Пригласить"}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Tier 1</p>
                    <p className="text-lg font-bold">40%</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Tier 2</p>
                    <p className="text-lg font-bold">5%</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Tier 3</p>
                    <p className="text-lg font-bold">2%</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Call Ref</p>
                    <p className="text-lg font-bold">40%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <code className="flex-1 text-xs font-mono text-muted-foreground">
                    onedex.io/?ref=your_username
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats (1/3) */}
          <div className="flex flex-col gap-4">
            <Card className="border-border bg-card flex-1">
              <CardContent className="p-4 h-full">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                  {t("rewards.statistics")}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-teal-500" />
                      <span className="text-xs">{t("rewards.cashback")}</span>
                    </div>
                    <span className="font-semibold text-sm">{totalCashback.toFixed(2)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-teal-500" />
                      <span className="text-xs">{t("rewards.referrals")}</span>
                    </div>
                    <span className="font-semibold text-sm">{referralStats.totalEarned.toFixed(2)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-teal-500" />
                      <span className="text-xs">{t("rewards.calls")}</span>
                    </div>
                    <span className="font-semibold text-sm">{referralStats.callRewards.toFixed(2)} SOL</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-teal-500" />
                      <span className="text-xs">{t("rewards.alerts")}</span>
                    </div>
                    <span className="font-semibold text-sm">{referralStats.salesAlerts.toFixed(2)} SOL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card flex-1">
              <CardContent className="p-4 h-full">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  {t("rewards.byTier")}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold">1</span>
                      </div>
                      <span className="text-sm">Tier 1</span>
                    </div>
                    <span className="font-semibold">{referralStats.tier1}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold">2</span>
                      </div>
                      <span className="text-sm">Tier 2</span>
                    </div>
                    <span className="font-semibold">{referralStats.tier2}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold">3</span>
                      </div>
                      <span className="text-sm">Tier 3</span>
                    </div>
                    <span className="font-semibold">{referralStats.tier3}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
