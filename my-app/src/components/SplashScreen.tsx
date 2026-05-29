"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show splash screen for 3.5 seconds
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => {
        onComplete();
      }, 500); // Allow fade-out animation
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-purple/5" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
            {/* Logo with glow effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal via-purple to-pink blur-3xl opacity-30 animate-pulse" />
              <div className="relative h-32 w-32 rounded-3xl bg-gradient-to-br from-teal via-teal-light to-teal-dark flex items-center justify-center shadow-2xl">
                <Image 
                  src="/Логотип.png" 
                  alt="OneDex Logo" 
                  width={96} 
                  height={96}
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="text-center space-y-2"
            >
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
                One<span className="text-teal">Dex</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium tracking-wide">
                Solana DEX Terminal
              </p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              transition={{ 
                duration: 2.5, 
                delay: 0.8,
                ease: "easeInOut"
              }}
              className="w-[300px] h-1.5 bg-muted/50 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 2.5, 
                  delay: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="h-full bg-gradient-to-r from-teal via-teal-light to-purple rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </motion.div>
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 1.5
              }}
              className="text-muted-foreground text-sm font-medium tracking-wide"
            >
              Initializing trading environment...
            </motion.p>

            {/* Floating elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: `${10 + i * 15}%`,
                    y: '110%',
                    opacity: 0
                  }}
                  animate={{ 
                    y: '-10%',
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-teal to-purple"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
