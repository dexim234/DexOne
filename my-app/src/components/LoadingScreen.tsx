"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Logo with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 p-1">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
              <Image 
                src="/Логотип.png" 
                alt="OneDex Logo" 
                width={80} 
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            One<span className="bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">Dex</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Solana DEX Terminal
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-64">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Loading...</span>
            <span className="font-semibold">{Math.min(Math.round(progress), 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
