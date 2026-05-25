"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TranslationProvider } from "@/contexts/TranslationContext";
import SplashScreen from "@/components/SplashScreen";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <TranslationProvider>
        {isClient && !showSplash && <Header />}
        <main className={`flex-1 pb-14 ${isClient && showSplash ? 'hidden' : ''}`}>
          {children}
        </main>
        {isClient && !showSplash && <Footer />}
      </TranslationProvider>
    </>
  );
}
