"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Hexagon,
} from "lucide-react";
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
  { label: "Market HUB", href: "/market-hub" },
  { label: "Calls", href: "/calls" },
  { label: "Alerts", href: "/alerts" },
  { label: "Tracker", href: "/tracker" },
  { label: "Smart", href: "/smart" },
];

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/market-hub" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-white">
            <Hexagon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            One<span className="text-teal">Dex</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "text-teal bg-teal-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-teal" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden sm:flex relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search CA / Wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-teal"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal" />
          </Button>

          {/* Wallet dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Wallet className="h-4 w-4" />
              <span className="max-w-[80px] truncate">Connect</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Phantom</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Solflare</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Backpack</span>
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
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent transition-colors"
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
              className="md:hidden inline-flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent transition-colors"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search CA / Wallet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          active
                            ? "text-teal bg-teal-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
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
