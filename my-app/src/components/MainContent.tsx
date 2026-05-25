"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TranslationProvider } from "@/contexts/TranslationContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Hide loading screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isClient && showLoading && <LoadingScreen />}
      <TranslationProvider>
        {isClient && !showLoading && <Header />}
        <main className={`flex-1 pb-14 ${isClient && showLoading ? 'hidden' : ''}`}>
          {children}
        </main>
        {isClient && !showLoading && <Footer />}
      </TranslationProvider>
    </>
  );
}
