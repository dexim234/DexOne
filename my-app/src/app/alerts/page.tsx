"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Shield, BarChart3, Bell, Users, Brain, Play, Share2, TrendingUp, Activity, Clock, Target, FileImport } from "lucide-react";

const featureCards = [
  {
    icon: Zap,
    title: "Моментальная проверка токена",
    description: "Каждый новый токен мгновенно проверяется по вашим фильтрам, задержка — менее 20-25 мс",
    color: "yellow",
  },
  {
    icon: Target,
    title: "30+ фильтров",
    description: "MC, ликвидность, объемы, падения от ATH, холдеры, история дева — выбирайте всё под вашу стратегию",
    color: "blue",
  },
  {
    icon: Play,
    title: "Встроенный бэктест",
    description: "Прогоните фильтры на исторических данных. Проверьте HitRate 50%, 2X, 5X и 10X до запуска",
    color: "green",
  },
  {
    icon: Activity,
    title: "In-App",
    description: "Лента в реальном времени со всеми нужными параметрами для принятия решения",
    color: "purple",
  },
  {
    icon: Share2,
    title: "Делитесь сетапами",
    description: "Делитесь сетапами с другими участниками — находите лучшие, комбинируйте их и анализируйте опыт других",
    color: "indigo",
  },
  {
    icon: Brain,
    title: "ИИ анализ",
    description: "Пользуйтесь встроенным ИИ-помощником для анализа сетапов и монет, а ещё составляйте сетапы исходя из стратегии",
    color: "rose",
  },
];

const modes = ["Alerts", "AutoTrading", "Sales"];

const colorConfig = {
  yellow: {
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    glow: "from-yellow-500 to-orange-500",
    icon: "text-yellow-500",
  },
  blue: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    glow: "from-blue-500 to-cyan-500",
    icon: "text-blue-500",
  },
  green: {
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    glow: "from-green-500 to-emerald-500",
    icon: "text-green-500",
  },
  purple: {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    glow: "from-purple-500 to-pink-500",
    icon: "text-purple-500",
  },
  indigo: {
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
    glow: "from-indigo-500 to-violet-500",
    icon: "text-indigo-500",
  },
  rose: {
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    glow: "from-rose-500 to-red-500",
    icon: "text-rose-500",
  },
};

export default function AlertsPage() {
  const [activeMode, setActiveMode] = useState<string>("Alerts");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        {/* Left: Triple Selector */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
          {modes.map((mode) => (
            <Button
              key={mode}
              variant={activeMode === mode ? "default" : "ghost"}
              size="sm"
              className={`h-10 text-sm font-semibold px-5 rounded-lg transition-all ${
                activeMode === mode ? "" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveMode(mode)}
            >
              {mode === "Alerts" && <Bell className="h-4 w-4 mr-2" />}
              {mode === "AutoTrading" && <Zap className="h-4 w-4 mr-2" />}
              {mode === "Sales" && <TrendingUp className="h-4 w-4 mr-2" />}
              {mode}
            </Button>
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Import Button */}
          <Button 
            variant="outline" 
            className="h-10 px-5 font-semibold border-border/50 hover:bg-accent/50"
          >
            <FileImport className="h-4 w-4 mr-2" />
            Импорт
          </Button>

          {/* Create Button */}
          <Button className="h-10 px-6 font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 border-0">
            <Zap className="h-4 w-4 mr-2" />
            Создать
          </Button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((card, index) => {
          const colors = colorConfig[card.color as keyof typeof colorConfig];
          const Icon = card.icon;
          
          return (
            <div
              key={index}
              className={`group relative rounded-2xl border ${colors.border} bg-card p-6 hover:border-opacity-60 hover:shadow-xl transition-all duration-300`}
            >
              {/* Gradient glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.glow} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${colors.bg} mb-4`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* Decorative element */}
                <div className={`absolute top-4 right-4 h-8 w-8 rounded-full bg-gradient-to-br ${colors.glow} opacity-10 group-hover:opacity-30 transition-opacity blur-lg`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
