"use client";

import * as React from "react";
import Link from "next/link";
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
  Phone,
  BellRing,
  Activity,
  Brain,
  Sparkles,
  FileText,
  Shield,
  MessageCircle,
  BarChart2,
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
  { label: "Calls", href: "/calls", icon: Phone, transKey: "nav.calls" },
  { label: "Alerts", href: "/alerts", icon: BellRing, transKey: "nav.alerts" },
  { label: "Tracker", href: "/tracker", icon: Activity, transKey: "nav.tracker" },
  { label: "Smart", href: "/smart", icon: Brain, transKey: "nav.smart" },
  { label: "Assets", href: "/assets", icon: BarChart2, transKey: "nav.assets" },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-8">
        {/* Logo */}
        <Link href="/market-hub" className="flex items-center gap-2.5 shrink-0 mr-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg">
            <Image 
              src="/Логотип.png" 
              alt="OneDex Logo" 
              width={36} 
              height={36}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            One<span className="text-foreground dark:text-white">Dex</span>
          </span>
        </Link>

        {/* Vertical separator */}
        <div className="w-px h-8 bg-border/50 mx-2" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-3">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 px-3.5 py-2 text-base font-extrabold rounded-lg transition-all duration-300 tracking-tight text-foreground hover:bg-accent/80 hover:scale-102"
              >
                <span className="tracking-wide">{t(item.transKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          <div className="hidden sm:flex relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8.5 bg-muted/30 border-border/50 focus-visible:ring-teal/50 focus-visible:border-teal/50 transition-all"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-accent/50 rounded-lg transition-all h-9 w-9"
          >
            <Bell className="h-4.5 w-4.5" />
          </Button>

          {/* Wallet dropdown with theme and language */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-foreground bg-muted/30 border-border/50 cursor-pointer px-3.5 py-2 rounded-lg hover:bg-accent/50 transition-all"
            >
              <Wallet className="h-3.5 w-3.5 text-foreground" />
              <span className="max-w-[70px] truncate">Connect</span>
              <ChevronDown className="h-3 w-3 text-foreground opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              {/* Header */}
              <div className="mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">{t("connect.settings")}</span>
                </div>
                
                {/* Theme toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">{t("connect.theme")}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                    className="h-7 gap-1.5 px-2.5"
                  >
                    <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </div>

                {/* Language selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">{t("connect.language")}</span>
                  </div>
                  <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                    {(['EN', 'RU'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLanguage(lang === 'EN' ? 'en' : 'ru');
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                          (lang === 'EN' && language === 'en') || (lang === 'RU' && language === 'ru')
                            ? 'bg-teal text-white shadow-sm' 
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
                <span className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 block">
                  {t("connect.connectWallet")}
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
                      <div className="font-semibold text-sm text-foreground">{t("connect.phantom")}</div>
                      <div className="text-xs text-foreground">{t("connect.phantomDesc")}</div>
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
                      <div className="font-semibold text-sm text-foreground">{t("connect.solflare")}</div>
                      <div className="text-xs text-foreground">{t("connect.solflareDesc")}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-foreground rotate-90" />
                  </DropdownMenuItem>
                </div>
              </div>

              {/* Account actions */}
              <DropdownMenuSeparator className="my-3" />
              <div className="space-y-1">
                <Link href="/profile" className="block">
                  <DropdownMenuItem className="gap-2.5 cursor-pointer px-3 py-2 rounded-lg hover:bg-accent/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{t("connect.profile")}</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="gap-2.5 cursor-pointer px-3 py-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium text-sm">{t("connect.logout")}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden inline-flex items-center justify-center h-8.5 w-8.5 text-foreground bg-muted/30 border-border/50 cursor-pointer rounded-lg hover:bg-accent/50 transition-all"
            >
              <Menu className="h-4.5 w-4.5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col gap-5 mt-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground" />
                  <Input
                    type="text"
                    placeholder={t("search.placeholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-8.5"
                  />
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-extrabold rounded-lg transition-all tracking-tight text-foreground hover:bg-accent/50"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-2.5 h-9">
                    <Wallet className="h-3.5 w-3.5" />
                    {t("connect.wallet")}
                  </Button>
                  <Link href="/profile" className="block">
                    <Button variant="outline" className="justify-start gap-2.5 h-9">
                      <User className="h-3.5 w-3.5" />
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
