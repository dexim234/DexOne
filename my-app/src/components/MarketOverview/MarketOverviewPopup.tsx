"use client";

import { useId, useMemo, useState } from "react";
import { TrendingUp, BarChart3, Activity, DollarSign, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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

  return (
    <div className="flex flex-col gap-4">
      {/* Interval tabs */}
      <IntervalTabs value={interval} onChange={onIntervalChange} />

      {/* KPI Row */}
      <KpiRow buckets={data} />

      {/* Charts Grid */}
      <ChartsGrid buckets={data} />
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
  buckets: typeof MOCK_BUCKETS;
}

const KpiRow = ({ buckets }: KpiRowProps) => {
  const totals = useMemo(() => ({
    launched: buckets.reduce((sum, b) => sum + b.launched, 0),
    migrated: buckets.reduce((sum, b) => sum + b.migrated, 0),
    vol_pre: buckets.reduce((sum, b) => sum + b.vol_pre, 0),
    vol_post: buckets.reduce((sum, b) => sum + b.vol_post, 0),
    traders_pre: buckets.reduce((sum, b) => sum + b.traders_pre, 0),
    traders_post: buckets.reduce((sum, b) => sum + b.traders_post, 0),
    fee_pre: buckets.reduce((sum, b) => sum + b.fee_pre, 0),
    fee_post: buckets.reduce((sum, b) => sum + b.fee_post, 0),
  }), [buckets]);

  const series = useMemo(() => ({
    launched: buckets.map((b) => b.launched),
    migrated: buckets.map((b) => b.migrated),
    volume: buckets.map((b) => b.vol_pre + b.vol_post),
    traders: buckets.map((b) => b.traders_pre + b.traders_post),
    fees: buckets.map((b) => b.fee_pre + b.fee_post),
  }), [buckets]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard
        label="Launched"
        value={fmtInt(totals.launched)}
        sparkline={series.launched}
        accent={COLOR_PRE}
        icon={TrendingUp}
      />
      <KpiCard
        label="Migrated"
        value={fmtInt(totals.migrated)}
        subValue={`${((totals.migrated / totals.launched) * 100).toFixed(1)}% rate`}
        sparkline={series.migrated}
        accent={COLOR_POST}
        icon={Activity}
      />
      <KpiCard
        label="Volume"
        value={`${fmtCompact(totals.vol_pre + totals.vol_post)} SOL`}
        subPre={`Pre: ${fmtCompact(totals.vol_pre)}`}
        subPost={`Post: ${fmtCompact(totals.vol_post)}`}
        sparkline={series.volume}
        accent={COLOR_POST}
        icon={DollarSign}
      />
      <KpiCard
        label="Traders"
        value={fmtInt(totals.traders_pre + totals.traders_post)}
        subPre={`Pre: ${fmtInt(totals.traders_pre)}`}
        subPost={`Post: ${fmtInt(totals.traders_post)}`}
        sparkline={series.traders}
        accent={COLOR_POST}
        icon={Users}
      />
      <KpiCard
        label="Fees"
        value={`${fmtCompact(totals.fee_pre + totals.fee_post)} SOL`}
        subPre={`Pre: ${fmtCompact(totals.fee_pre)}`}
        subPost={`Post: ${fmtCompact(totals.fee_post)}`}
        sparkline={series.fees}
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
  sparkline?: number[];
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KpiCard = ({ label, value, subValue, subPre, subPost, sparkline, accent, icon: Icon }: KpiCardProps) => {
  const hasSpark = sparkline && sparkline.length > 1;

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
        {hasSpark && (
          <div className="h-8 w-12 shrink-0">
            <Sparkline data={sparkline} color={accent} />
          </div>
        )}
      </div>
    </div>
  );
};

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline = ({ data, color }: SparklineProps) => {
  const id = useId().replace(/:/g, "");
  const rows = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Charts grid
interface ChartsGridProps {
  buckets: typeof MOCK_BUCKETS;
}

const ChartsGrid = ({ buckets }: ChartsGridProps) => {
  const series = buckets.map((b, i) => ({
    label: `${i}:00`,
    ...b,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <ChartCard title="Launched" accent={COLOR_PRE}>
        <SingleBarChart data={series} dataKey="launched" color={COLOR_PRE} />
      </ChartCard>
      <ChartCard title="Migrated" accent={COLOR_POST}>
        <SingleBarChart data={series} dataKey="migrated" color={COLOR_POST} />
      </ChartCard>
      <ChartCard title="Volume" accent={COLOR_POST}>
        <StackedBarChart
          data={series}
          keys={[
            { key: "vol_pre", color: COLOR_PRE, label: "Pre" },
            { key: "vol_post", color: COLOR_POST, label: "Post" },
          ]}
        />
      </ChartCard>
      <ChartCard title="Traders" accent={COLOR_POST}>
        <TwoAreaChart
          data={series}
          lines={[
            { key: "traders_pre", color: COLOR_PRE, label: "Pre" },
            { key: "traders_post", color: COLOR_POST, label: "Post" },
          ]}
        />
      </ChartCard>
      <ChartCard title="Fees" accent={COLOR_POST} fullWidth>
        <StackedBarChart
          data={series}
          keys={[
            { key: "fee_pre", color: COLOR_PRE, label: "Pre" },
            { key: "fee_post", color: COLOR_POST, label: "Post" },
          ]}
        />
      </ChartCard>
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

// Chart components
type SeriesRow = typeof MOCK_BUCKETS[0] & { label: string };

const SingleBarChart = ({ data, dataKey, color }: { data: SeriesRow[]; dataKey: keyof SeriesRow; color: string }) => {
  const id = useId().replace(/:/g, "");
  const gradId = `bar-${id}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<FancyTooltip />} />
        <Bar
          dataKey={dataKey as string}
          fill={`url(#${gradId})`}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          animationDuration={650}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface StackedKey {
  key: string;
  color: string;
  label: string;
}

const StackedBarChart = ({ data, keys }: { data: SeriesRow[]; keys: StackedKey[] }) => {
  const id = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k.key} id={`stack-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={k.color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={k.color} stopOpacity={0.2} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<FancyTooltip />} />
        {keys.map((k, i) => {
          const isTop = i === keys.length - 1;
          return (
            <Bar
              key={k.key}
              dataKey={k.key}
              name={k.label}
              stackId="s"
              fill={`url(#stack-${id}-${i})`}
              radius={isTop ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={28}
              animationDuration={650}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

const TwoAreaChart = ({ data, lines }: { data: SeriesRow[]; lines: StackedKey[] }) => {
  const id = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((l, i) => (
            <linearGradient key={l.key} id={`area-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<FancyTooltip />} />
        {lines.map((l, i) => (
          <Area
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            fill={`url(#area-${id}-${i})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: l.color }}
            animationDuration={700}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const FancyTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "rgba(20, 20, 20, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex flex-col gap-1.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-bold tabular-nums">{Math.round(p.value ?? 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
