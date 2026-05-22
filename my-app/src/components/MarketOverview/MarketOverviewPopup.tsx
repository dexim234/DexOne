"use client";

import { useState } from "react";
import { TrendingUp, BarChart3, Activity, DollarSign, Users, X } from "lucide-react";

// Mock data for demonstration
const MOCK_BUCKETS = Array.from({ length: 24 }, (_, i) => ({
  ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  launched: Math.floor(Math.random() * 50) + 10,
  migrated: Math.floor(Math.random() * 30) + 5,
  vol_pre: Math.floor(Math.random() * 1000) + 200,
  vol_post: Math.floor(Math.random() * 1500) + 300,
  traders_pre: Math.floor(Math.random() * 200) + 50,
  traders_post: Math.floor(Math.random() * 250) + 75,
  fee_pre: Math.floor(Math.random() * 100) + 20,
  fee_post: Math.floor(Math.random() * 120) + 25,
}));

const INTERVALS = ["1h", "6h", "24h", "7d", "30d"] as const;
type MarketOverviewInterval = (typeof INTERVALS)[number];

const COLOR_PRE = "#f5a623";
const COLOR_POST = "#00ffa3";

interface MarketOverviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketOverviewPopup = ({ isOpen, onClose }: MarketOverviewPopupProps) => {
  const [interval, setInterval] = useState<MarketOverviewInterval>("24h");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[1180px] max-h-[90vh] bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10">
              <BarChart3 className="h-5 w-5 text-teal" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Market Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <MarketOverviewContent interval={interval} onIntervalChange={setInterval} />
        </div>
      </div>
    </div>
  );
};

interface MarketOverviewContentProps {
  interval: MarketOverviewInterval;
  onIntervalChange: (interval: MarketOverviewInterval) => void;
}

export const MarketOverviewContent = ({ interval, onIntervalChange }: MarketOverviewContentProps) => {
  const data = MOCK_BUCKETS;

  const totals = {
    launched: data.reduce((sum, b) => sum + b.launched, 0),
    migrated: data.reduce((sum, b) => sum + b.migrated, 0),
    vol_pre: data.reduce((sum, b) => sum + b.vol_pre, 0),
    vol_post: data.reduce((sum, b) => sum + b.vol_post, 0),
    traders_pre: data.reduce((sum, b) => sum + b.traders_pre, 0),
    traders_post: data.reduce((sum, b) => sum + b.traders_post, 0),
    fee_pre: data.reduce((sum, b) => sum + b.fee_pre, 0),
    fee_post: data.reduce((sum, b) => sum + b.fee_post, 0),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Interval tabs */}
      <IntervalTabs value={interval} onChange={onIntervalChange} />

      {/* KPI Row */}
      <KpiRow totals={totals} />

      {/* Charts Grid - simplified bars */}
      <ChartsGrid data={data} />
    </div>
  );
};

// Interval tabs
interface IntervalTabsProps {
  value: MarketOverviewInterval;
  onChange: (value: MarketOverviewInterval) => void;
}

const IntervalTabs = ({ value, onChange }: IntervalTabsProps) => (
  <div className="inline-flex self-start rounded-xl border border-border/50 bg-muted/30 p-1">
    {INTERVALS.map((iv) => (
      <button
        key={iv}
        type="button"
        onClick={() => onChange(iv)}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          value === iv
            ? "bg-gradient-to-r from-teal to-teal-light text-white shadow-lg shadow-teal/25"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        }`}
      >
        {iv}
      </button>
    ))}
  </div>
);

// KPI cards
interface KpiRowProps {
  totals: {
    launched: number;
    migrated: number;
    vol_pre: number;
    vol_post: number;
    traders_pre: number;
    traders_post: number;
    fee_pre: number;
    fee_post: number;
  };
}

const KpiRow = ({ totals }: KpiRowProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard
        label="Launched"
        value={fmtInt(totals.launched)}
        accent={COLOR_PRE}
        icon={TrendingUp}
      />
      <KpiCard
        label="Migrated"
        value={fmtInt(totals.migrated)}
        subValue={`${((totals.migrated / totals.launched) * 100).toFixed(1)}% rate`}
        accent={COLOR_POST}
        icon={Activity}
      />
      <KpiCard
        label="Volume"
        value={`${fmtCompact(totals.vol_pre + totals.vol_post)} SOL`}
        subPre={`Pre: ${fmtCompact(totals.vol_pre)}`}
        subPost={`Post: ${fmtCompact(totals.vol_post)}`}
        accent={COLOR_POST}
        icon={DollarSign}
      />
      <KpiCard
        label="Traders"
        value={fmtInt(totals.traders_pre + totals.traders_post)}
        subPre={`Pre: ${fmtInt(totals.traders_pre)}`}
        subPost={`Post: ${fmtInt(totals.traders_post)}`}
        accent={COLOR_POST}
        icon={Users}
      />
      <KpiCard
        label="Fees"
        value={`${fmtCompact(totals.fee_pre + totals.fee_post)} SOL`}
        subPre={`Pre: ${fmtCompact(totals.fee_pre)}`}
        subPost={`Post: ${fmtCompact(totals.fee_post)}`}
        accent={COLOR_POST}
        icon={DollarSign}
      />
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  subPre?: string;
  subPost?: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KpiCard = ({ label, value, subValue, subPre, subPost, accent, icon: Icon }: KpiCardProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-4"
      style={{
        background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 8%, transparent), transparent 60%), rgba(0,0,0,0.2)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4" style={{ color: accent }} />
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          </div>
          <div
            className="text-xl font-bold whitespace-nowrap"
            style={{
              textShadow: `0 0 14px color-mix(in oklab, ${accent} 22%, transparent)`,
            }}
          >
            {value}
          </div>
          {subValue && <div className="mt-1 text-xs text-muted-foreground">{subValue}</div>}
          {(subPre || subPost) && (
            <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
              {subPre && <span>{subPre}</span>}
              {subPost && <span>{subPost}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Charts grid - simplified without recharts
interface ChartsGridProps {
  data: typeof MOCK_BUCKETS;
}

const ChartsGrid = ({ data }: ChartsGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <ChartCard title="Launched" accent={COLOR_PRE}>
        <SimpleBarChart data={data.slice(-12)} dataKey="launched" color={COLOR_PRE} />
      </ChartCard>
      <ChartCard title="Migrated" accent={COLOR_POST}>
        <SimpleBarChart data={data.slice(-12)} dataKey="migrated" color={COLOR_POST} />
      </ChartCard>
      <ChartCard title="Volume" accent={COLOR_POST} fullWidth>
        <SimpleStackedBarChart data={data.slice(-12)} />
      </ChartCard>
    </div>
  );
};

// Simple bar chart without recharts
const SimpleBarChart = ({ data, dataKey, color }: { data: typeof MOCK_BUCKETS; dataKey: keyof typeof MOCK_BUCKETS[0]; color: string }) => {
  const max = Math.max(...data.map(d => Number(d[dataKey])));
  
  return (
    <div className="h-[200px] flex items-end gap-1 px-2">
      {data.map((d, i) => {
        const value = Number(d[dataKey]);
        const height = (value / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, ${color}66, ${color})`,
              minHeight: '4px'
            }}
            title={`${d.ts}: ${value}`}
          />
        );
      })}
    </div>
  );
};

const SimpleStackedBarChart = ({ data }: { data: typeof MOCK_BUCKETS }) => {
  return (
    <div className="h-[200px] flex items-end gap-1 px-2">
      {data.slice(-12).map((d, i) => {
        const total = d.vol_pre + d.vol_post;
        const prePct = (d.vol_pre / total) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col-reverse rounded-t overflow-hidden" style={{ height: '100%' }}>
            <div 
              className="flex-1 transition-all hover:opacity-80"
              style={{
                background: `linear-gradient(to top, ${COLOR_PRE}66, ${COLOR_PRE})`,
                height: `${prePct}%`,
                minHeight: '2px'
              }}
            />
            <div 
              className="flex-1 transition-all hover:opacity-80"
              style={{
                background: `linear-gradient(to top, ${COLOR_POST}66, ${COLOR_POST})`,
                height: `${100 - prePct}%`,
                minHeight: '2px'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

interface ChartCardProps {
  title: string;
  accent: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const ChartCard = ({ title, accent, children, fullWidth }: ChartCardProps) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-border/50 p-3 ${
      fullWidth ? "lg:col-span-2" : ""
    }`}
    style={{
      background: `radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, ${accent} 9%, transparent), transparent 55%), rgba(0,0,0,0.2)`,
    }}
  >
    <div className="mb-3 flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: accent,
          boxShadow: `0 0 8px ${accent}, 0 0 2px ${accent}`,
        }}
      />
      <div className="text-sm font-semibold tracking-wide text-foreground">{title}</div>
    </div>
    <div className="h-[200px]">{children}</div>
  </div>
);

// Formatters
const fmtInt = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("en-US");
};

const fmtCompact = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "k";
  if (n >= 1) return n.toFixed(2);
  return "0";
};
