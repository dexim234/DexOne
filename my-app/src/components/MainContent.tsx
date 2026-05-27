"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TranslationProvider } from "@/contexts/TranslationContext";
import LoadingScreen from "@/components/LoadingScreen";
import WidgetPanel from "@/components/WidgetPanel";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isClient && showLoading && <LoadingScreen />}
      <TranslationProvider>
        {isClient && !showLoading && <Header />}
        <MainArea showLoading={showLoading} isClient={isClient}>
          {children}
        </MainArea>
        {isClient && !showLoading && <WidgetPanel />}
        {isClient && !showLoading && <Footer />}
      </TranslationProvider>
    </>
  );
}

function MainArea({ 
  children, 
  showLoading, 
  isClient 
}: { 
  children: React.ReactNode; 
  showLoading: boolean;
  isClient: boolean;
}) {
  const { className } = useWidgetLayout();
  
  return (
    <main 
      className={`flex-1 pb-14 transition-all duration-300 ${isClient && showLoading ? 'hidden' : ''} ${className}`}
    >
      {children}
    </main>
  );
}
