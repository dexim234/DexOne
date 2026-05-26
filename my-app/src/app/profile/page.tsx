"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Settings,
  Award,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";

export default function ProfilePage() {
  const { t } = useTranslation();

  const quickActions = [
    {
      icon: Wallet,
      label: "connect.connectWallet",
      href: "#",
      color: "from-teal to-teal-light",
      textColor: "text-teal",
    },
    {
      icon: TrendingUp,
      label: "nav.marketHub",
      href: "/market-hub",
      color: "from-purple to-purple-light",
      textColor: "text-purple",
    },
    {
      icon: Shield,
      label: "nav.alerts",
      href: "/alerts",
      color: "from-pink to-pink-light",
      textColor: "text-pink",
    },
    {
      icon: Zap,
      label: "nav.smart",
      href: "/smart",
      color: "from-yellow to-yellow-light",
      textColor: "text-yellow-500",
    },
  ];

  const statsItems = [
    {
      icon: Award,
      label: "profile.level",
      value: "--",
      description: "profile.connectToSee",
      textColor: "text-teal",
    },
    {
      icon: LinkIcon,
      label: "profile.referrals",
      value: "--",
      description: "profile.connectToSee",
      textColor: "text-purple",
    },
    {
      icon: Settings,
      label: "profile.settings",
      value: "--",
      description: "profile.connectToSee",
      textColor: "text-pink",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Wallet Connection Card */}
        <Card className="mb-8 bg-gradient-to-br from-muted/80 via-muted/50 to-muted/30 backdrop-blur-sm border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-purple/5" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Wallet Icon */}
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-teal via-teal-light to-teal-dark flex items-center justify-center shadow-xl">
                <Wallet className="h-10 w-10 text-white" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {t("profile.connectWallet")}
                </h1>
                <p className="text-muted-foreground max-w-md">
                  {t("profile.connectWalletDesc")}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="h-14 px-8 gap-3 bg-gradient-to-r from-teal to-teal-light hover:from-teal-dark hover:to-teal text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Wallet className="h-5 w-5" />
                {t("connect.connectWallet")}
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Supported Wallets */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M11.25 2h1.5a8.99 8.99 0 0 1 6.36 2.64 9 9 0 0 1 0 12.72 9 9 0 0 1-12.72 0 8.99 8.99 0 0 1-2.64-6.36v-1.5a2 2 0 0 1 2-2h5.5Z"/>
                  </svg>
                  <span className="text-sm font-medium text-muted-foreground">Phantom</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M13.8 2h-3.6l-6 18h3.6l1.4-4.2h4.8l1.4 4.2h3.6l-6-18zm-1.8 9l-2.1-6.3 2.1 6.3zm1.8 5.4h-3.6l1.8-5.4 1.8 5.4z"/>
                  </svg>
                  <span className="text-sm font-medium text-muted-foreground">Solflare</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("profile.quickActions")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="group hover:border-border/80 transition-all hover:shadow-lg cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {t(action.label)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Placeholder */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("profile.statistics")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsItems.map((stat, index) => (
              <Card key={index} className="bg-muted/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {t(stat.label)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(stat.description)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
