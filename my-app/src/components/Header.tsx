"use client";

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

const navItems = [
  { label: "Market HUB", href: "/market-hub", icon: TrendingUp },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "Alerts", href: "/alerts", icon: BellRing },
  { label: "Tracker", href: "/tracker", icon: Activity },
  { label: "Smart", href: "/smart", icon: Brain },
  { label: "Predict HUB", href: "/predict-hub", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: User },
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
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-8">
        {/* Logo */}
        <Link href="/market-hub" className="flex items-center gap-2.5 shrink-0 mr-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-lg">
            <Image 
              src="/Логотип.png" 
              alt="OneDex Logo" 
              width={36} 
              height={36}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            One<span className="bg-gradient-to-r from-teal to-teal-light bg-clip-text text-transparent">Dex</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-teal bg-gradient-to-r from-teal-muted/80 to-teal-muted/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute inset-0 rounded-lg ring-2 ring-teal/20" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          <div className="hidden sm:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search CA / Wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9.5 bg-muted/30 border-border/50 focus-visible:ring-teal/50 focus-visible:border-teal/50 transition-all"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Wallet dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/30 border-border/50 cursor-pointer px-3.5 py-2 rounded-lg hover:bg-accent/50 transition-all"
            >
              <Wallet className="h-4 w-4" />
              <span className="max-w-[80px] truncate">Connect</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="gap-3">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg overflow-hidden bg-[#AB9FF2]">
                  <Image 
                    src="/phantom.webp" 
                    alt="Phantom" 
                    width={28} 
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span>Phantom</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg overflow-hidden bg-[#000]">
                  <Image 
                    src="/Solflare.svg" 
                    alt="Solflare" 
                    width={28} 
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span>Solflare</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-9.5 w-9.5 text-muted-foreground hover:text-foreground bg-muted/30 border-border/50 cursor-pointer rounded-lg hover:bg-accent/50 transition-all"
            >
              <Globe className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Русский</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden inline-flex items-center justify-center h-9.5 w-9.5 text-muted-foreground hover:text-foreground bg-muted/30 border-border/50 cursor-pointer rounded-lg hover:bg-accent/50 transition-all"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col gap-6 mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search CA / Wallet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9.5"
                  />
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                          active
                            ? "text-teal bg-teal-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-3">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </Button>
                  <Button variant="outline" className="justify-start gap-3">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
