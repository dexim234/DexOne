"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "ru";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.marketHub": "Market HUB",
    "nav.calls": "Calls",
    "nav.alerts": "Alerts",
    "nav.tracker": "Tracker",
    "nav.smart": "Smart",
    "nav.predictHub": "Predict HUB",
    "nav.assets": "Assets",
    "nav.rewards": "Rewards",
    
    // Connect Menu
    "connect.wallet": "Connect",
    "connect.settings": "Settings",
    "connect.theme": "Theme",
    "connect.language": "Language",
    "connect.connectWallet": "Connect Wallet",
    "connect.profile": "Profile",
    "connect.logout": "Logout",
    "connect.phantom": "Phantom",
    "connect.phantomDesc": "Popular Solana wallet",
    "connect.solflare": "Solflare",
    "connect.solflareDesc": "Native Solana wallet",
    
    // Footer
    "footer.tracker": "Tracker",
    "footer.smart": "Smart",
    "footer.alerts": "Alerts",
    "footer.calls": "Calls",
    "footer.marketView": "MarketView",
    
    // Coming Soon
    "comingSoon.title": "Under Development",
    "comingSoon.description": "This section is currently under development. We are working hard to bring you the best Solana DEX trading experience.",
    
    // Profile Page
    "profile.tradingStats": "Trading Statistics",
    "profile.tradingStatsDesc": "Your overall trading performance",
    "profile.moreDetails": "More Details",
    "profile.winRate": "Win Rate",
    "profile.totalProfit": "Total Profit",
    "profile.netProfit": "Net Profit",
    "profile.referralProgram": "Referral Program",
    "profile.referralProgramDesc": "Invite friends and earn rewards together",
    "profile.yourReferralLink": "Your Referral Link",
    "profile.copy": "Copy",
    "profile.copied": "Copied!",
    "profile.viewBenefits": "View Referral Benefits",
    "profile.accountInfo": "Account Info",
    "profile.quickActions": "Quick Actions",
    "profile.connectWallet": "Connect Wallet",
    "profile.achievements": "Achievements",
    "profile.analytics": "Analytics",
    "profile.securitySettings": "Security Settings",
    "profile.callerProfile": "Caller Profile",
    
    // Profile Modal
    "profileModal.title": "Trading Performance Details",
    "profileModal.description": "Comprehensive analysis of your trading activity",
    "profileModal.performanceChart": "Performance Chart",
    "profileModal.netProfit": "Net Profit",
    
    // Referral Modal
    "referralModal.title": "Referral Program Benefits",
    "referralModal.description": "Discover all the rewards you can earn by inviting friends",
    "referralModal.directReferrals": "Direct Referrals",
    "referralModal.directDesc": "Earn from your direct invites",
    "referralModal.indirectReferrals": "Indirect Referrals",
    "referralModal.indirectDesc": "Earn from your referrals' invites",
    "referralModal.specialBonuses": "Special Bonuses",
    "referralModal.bonusesDesc": "Exclusive rewards for top referrers",
    "referralModal.startReferring": "Start Referring Friends",
    
    // Search
    "search.placeholder": "Search CA / Wallet...",
    
    // Account Level
    "account.vip": "VIP",
    "account.verification": "Verification",
    "account.verified": "Verified",
    "account.twoFa": "2FA Status",
    "account.enabled": "Enabled",
  },
  ru: {
    // Navigation
    "nav.marketHub": "Торговый Хаб",
    "nav.calls": "Коллы",
    "nav.alerts": "Алерты",
    "nav.tracker": "Трекер",
    "nav.smart": "Смарты",
    "nav.predictHub": "Рынок предсказаний",
    "nav.assets": "Активы",
    "nav.rewards": "Награды",
    
    // Connect Menu
    "connect.wallet": "Connect",
    "connect.settings": "Настройки",
    "connect.theme": "Тема",
    "connect.language": "Язык",
    "connect.connectWallet": "Подключить кошелек",
    "connect.profile": "Профиль",
    "connect.logout": "Выйти",
    "connect.phantom": "Phantom",
    "connect.phantomDesc": "Популярный Solana кошелек",
    "connect.solflare": "Solflare",
    "connect.solflareDesc": "Родной Solana кошелек",
    
    // Footer
    "footer.tracker": "Трекер",
    "footer.smart": "Смарты",
    "footer.alerts": "Алерты",
    "footer.calls": "Коллы",
    "footer.marketView": "Обзор рынка",
    
    // Coming Soon
    "comingSoon.title": "В разработке",
    "comingSoon.description": "Этот раздел сейчас разрабатывается. Мы работаем над тем, чтобы предоставить вам лучший опыт торговли на Solana DEX.",
    
    // Profile Page
    "profile.tradingStats": "Статистика торговли",
    "profile.tradingStatsDesc": "Ваша общая торговая производительность",
    "profile.moreDetails": "Подробнее",
    "profile.winRate": "Процент побед",
    "profile.totalProfit": "Общая прибыль",
    "profile.netProfit": "Чистая прибыль",
    "profile.referralProgram": "Реферальная программа",
    "profile.referralProgramDesc": "Приглашайте друзей и зарабатывайте вместе",
    "profile.yourReferralLink": "Ваша реферальная ссылка",
    "profile.copy": "Копировать",
    "profile.copied": "Скопировано!",
    "profile.viewBenefits": "Преимущества реферальной программы",
    "profile.accountInfo": "Информация аккаунта",
    "profile.quickActions": "Быстрые действия",
    "profile.connectWallet": "Подключить кошелек",
    "profile.achievements": "Достижения",
    "profile.analytics": "Аналитика",
    "profile.securitySettings": "Настройки безопасности",
    "profile.callerProfile": "Профиль коллера",
    
    // Profile Modal
    "profileModal.title": "Детали торговой производительности",
    "profileModal.description": "Комплексный анализ вашей торговой активности",
    "profileModal.performanceChart": "График производительности",
    "profileModal.netProfit": "Чистая прибыль",
    
    // Referral Modal
    "referralModal.title": "Преимущества реферальной программы",
    "referralModal.description": "Узнайте все награды, которые вы можете заработать, приглашая друзей",
    "referralModal.directReferrals": "Прямые рефералы",
    "referralModal.directDesc": "Зарабатывайте с ваших прямых приглашений",
    "referralModal.indirectReferrals": "Косвенные рефералы",
    "referralModal.indirectDesc": "Зарабатывайте с приглашений ваших рефералов",
    "referralModal.specialBonuses": "Специальные бонусы",
    "referralModal.bonusesDesc": "Эксклюзивные награды для топ-рефералов",
    "referralModal.startReferring": "Начать приглашать друзей",
    
    // Search
    "search.placeholder": "Поиск CA / Кошелька...",
    
    // Account Level
    "account.vip": "Уровень аккаунта",
    "account.verification": "Верификация",
    "account.verified": "Верифицировано",
    "account.twoFa": "Статус 2FA",
    "account.enabled": "Включено",
    
    // Market Hub
    "marketHub.format": "Формат",
    "marketHub.selectFormat": "Выберите формат",
    "marketHub.tradingUnderDevelopment": "Торговля в разработке",
    "marketHub.tradingDescription": "Этот торговый раздел сейчас разрабатывается. Следите за обновлениями!",
    "marketHub.trenches.new": "New",
    "marketHub.trenches.soon": "Soon",
    "marketHub.trenches.migrated": "Migrated",
    "marketHub.trenches.newContent": "Новые тренчи появятся здесь.",
    "marketHub.trenches.soonContent": "Скоро появятся тренчи будут отображаться здесь.",
    "marketHub.trenches.migratedContent": "История мигрированных тренчей показана здесь.",
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
