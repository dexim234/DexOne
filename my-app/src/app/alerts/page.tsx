"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Shield, BarChart3, Bell, Users, Brain, Play, Share2, TrendingUp, Activity, Clock, Target } from "lucide-react";

const featureCards = [
  {
    icon: Zap,
    title: "Моментальная проверка токена",
    description: "Каждый новый токен мгновенно проверяется по вашим фильтрам, задержка — менее 20-25 мс",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Target,
    title: "30+ фильтров",
    description: "MC, ликвидность, объемы, падения от ATH, холдеры, история дева — выбирайте всё под вашу стратегию",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Play,
    title: "Встроенный бэктест",
    description: "Прогоните фильтры на исторических данных. Проверьте HitRate 50%, 2X, 5X и 10X до запуска",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Activity,
    title: "In-App",
    description: "Лента в реальном времени со всеми нужными параметрами для принятия решения",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Share2,
    title: "Делитесь сетапами",
    description: "Делитесь сетапами с другими участниками — находите лучшие, комбинируйте их и анализируйте опыт других",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Brain,
    title: "ИИ анализ",
    description: "Пользуйтесь встроенным ИИ-помощником для анализа сетапов и монет, а ещё составляйте сетапы исходя из стратегии",
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-500/10",
  },
];

const modes = ["Alerts", "AutoTrading", "Sales"];

export default function AlertsPage() {
  const [activeMode, setActiveMode] = useState<string>("Alerts");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {/* Triple Selector */}
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

        {/* Create Button */}
        <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
          Создать
        </Button>

        {/* Tagline */}
        <div className="text-sm text-muted-foreground font-medium">
          Гемы ищут Вас, а Вы — их
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <div
            key={index}
            className="group relative rounded-2xl border border-border/50 bg-card p-6 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
          >
            {/* Gradient glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${card.bgColor} mb-4`}>
                <card.icon className={`h-6 w-6 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} />
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
              <div className={`absolute top-4 right-4 h-8 w-8 rounded-full bg-gradient-to-br ${card.color} opacity-20 group-hover:opacity-40 transition-opacity blur-xl`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
