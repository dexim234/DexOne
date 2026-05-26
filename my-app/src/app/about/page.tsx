"use client";

import { Hexagon } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal text-white mb-6">
        <Hexagon className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        One<span className="text-teal">Dex</span>
      </h1>
      <p className="text-muted-foreground text-center max-w-lg mb-8">
        Advanced DEX trading terminal for Solana. Built for traders who demand speed, 
        precision, and deep market analytics.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="text-2xl font-bold text-teal">Solana</div>
          <div className="text-xs text-muted-foreground mt-1">Native Chain</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="text-2xl font-bold text-teal">Real-time</div>
          <div className="text-xs text-muted-foreground mt-1">Data Streaming</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="text-2xl font-bold text-teal">Multi-DEX</div>
          <div className="text-xs text-muted-foreground mt-1">Aggregation</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="https://github.com"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </Link>
        <Link
          href="https://x.com"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X / Twitter
        </Link>
      </div>
    </div>
  );
}
