"use client";

import * as React from "react";
import Link from "next/link";
import { validateSolanaAddress } from "@/lib/solana-api";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Wallet,
  User,
  Globe,
  Moon,
  Sun,
  Menu,
  TrendingUp,
  Megaphone,
  BellRing,
  Activity,
  Brain,
  Sparkles,
  FileText,
  Shield,
  MessageCircle,
  BarChart2,
  Gift,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/TranslationContext";

const navItems = [
  { label: "Market HUB", href: "/market-hub", icon: TrendingUp, transKey: "nav.marketHub" },
  { label: "Calls", href: "/calls", icon: Megaphone, transKey: "nav.calls" },
  { label: "Alerts", href: "/alerts", icon: BellRing, transKey: "nav.alerts" },
  { label: "Tracker", href: "/tracker", icon: Activity, transKey: "nav.tracker" },
  { label: "Smart", href: "/smart", icon: Brain, transKey: "nav.smart" },
  { label: "Assets", href: "/assets", icon: BarChart2, transKey: "nav.assets" },
  { label: "Rewards", href: "/rewards", icon: Gift, transKey: "nav.rewards" },
  { label: "Predict HUB", href: "/predict-hub", icon: Sparkles, transKey: "nav.predictHub" },
];

const phantomIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M11.25 2h1.5a8.99 8.99 0 0 1 6.36 2.64 9 9 0 0 1 0 12.72 9 9 0 0 1-12.72 0 8.99 8.99 0 0 1-2.64-6.36v-1.5a2 2 0 0 1 2-2h5.5Z"/>
  </svg>
);

const solflareIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M13.8 2h-3.6l-6 18h3.6l1.4-4.2h4.8l1.4 4.2h3.6l-6-18zm-1.8 9l-2.1-6.3 2.1 6.3zm1.8 5.4h-3.6l1.8-5.4 1.8 5.4z"/>
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [search, setSearch] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSearch = () => {
    if (!search.trim()) return;
    
    // Check if it's a Solana address
    if (validateSolanaAddress(search.trim())) {
      window.open(`/tracker/${search.trim()}`, '_blank');
    } else {
      // Search for token by CA
      window.open(`/market-hub?search=${encodeURIComponent(search.trim())}`, '_blank');
    }
    setSearch("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 font-outfit">
      <div className="flex h-16 items-center px-4 lg:px-8 gap-6">
        {/* Logo */}
        <Link href="/market-hub" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 p-0.5 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-background">
              <Image 
                src="/Логотип.png" 
                alt="OneDex Logo" 
                width={36} 
                height={36}
                className="object-contain"
              />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            One<span className="bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">Dex</span>
          </span>
        </Link>

        {/* Vertical separator */}
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 tracking-tight text-foreground hover:bg-accent/50 hover:scale-105"
              >
                <item.icon className="h-4 w-4 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-foreground" />
                <span className="tracking-wide">{t(item.transKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search */}
          <div className="hidden sm:flex relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors focus-within:text-teal-500" />
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 h-10 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/50 transition-all rounded-xl"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-accent/50 rounded-xl transition-all h-10 w-10 group"
          >
            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </Button>

          {/* Wallet dropdown with theme and language */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden sm:flex items-center gap-2.5 text-sm font-bold text-foreground bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 cursor-pointer px-4 py-2.5 rounded-xl hover:from-teal-500/20 hover:to-purple-600/20 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 group-hover:scale-110 transition-transform">
                <Wallet className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="max-w-[80px] truncate">Connect</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4 rounded-2xl shadow-xl">
              {/* Header */}
              <div className="mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settings</span>
                </div>
                
                {/* Theme toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50">
                      <Moon className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Theme</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                    className="h-8 gap-1.5 px-3 rounded-xl"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </div>

                {/* Language selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50">
                      <Globe className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Language</span>
                  </div>
                  <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                    {(['EN', 'RU'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLanguage(lang === 'EN' ? 'en' : 'ru');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          (lang === 'EN' && language === 'en') || (lang === 'RU' && language === 'ru')
                            ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wallet connections */}
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Connect Wallet
                </span>
                <div className="space-y-2">
                  <DropdownMenuItem 
                    className="gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg overflow-hidden bg-[#AB9FF2]">
                      <Image 
                        src="/phantom.webp" 
                        alt="Phantom" 
                        width={28} 
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">Phantom</div>
                      <div className="text-xs text-muted-foreground">Popular Solana wallet</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-foreground rotate-90" />
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="gap-3 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg overflow-hidden">
                      <Image 
                        src="/Solflare.svg" 
                        alt="Solflare" 
                        width={32} 
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">Solflare</div>
                      <div className="text-xs text-muted-foreground">Native Solana wallet</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-foreground rotate-90" />
                  </DropdownMenuItem>
                </div>
              </div>

              {/* Account actions */}
              <DropdownMenuSeparator className="my-3" />
              <div className="space-y-1">
                <Link href="/profile" className="block">
                  <DropdownMenuItem className="gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-accent/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="gap-2 cursor-pointer px-3 py-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium text-sm">Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 text-foreground bg-muted/30 border-border/50 cursor-pointer rounded-xl hover:bg-accent/50 transition-all"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-2xl">
              <div className="flex flex-col gap-5 mt-5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 h-10 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all tracking-tight text-foreground hover:bg-accent/50"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2.5 h-10 rounded-xl">
                    <Wallet className="h-4 w-4" />
                    {t("connect.wallet")}
                  </Button>
                  <Link href="/profile" className="block">
                    <Button variant="outline" className="justify-start gap-2.5 h-10 rounded-xl">
                      <User className="h-4 w-4" />
                      {t("connect.profile")}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
