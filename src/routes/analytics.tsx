import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis, Scatter, ScatterChart, ZAxis, Line, LineChart,
  Bar, BarChart
} from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Zap, Sigma } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · SolarSentinel AI" },
      { name: "description", content: "Data science workbench: forecast performance, confidence timelines, distributions and correlation matrices for solar telemetry." },
    ],
  }),
  component: Analytics,
});

function tooltipStyle() {
  return {
    contentStyle: {
      background: "rgba(10,14,28,0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      fontSize: 11,
      fontFamily: "JetBrains Mono, monospace",
    },
    labelStyle: { color: "#fff", fontWeight: 600 },
    itemStyle: { color: "#fff" },
  };
}

function Analytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) return <PageShell><div className="animate-pulse text-white/40 font-mono text-sm p-8">Loading Heliophysics Analytics...</div></PageShell>;

  // Provide empty fallbacks to avoid any undefined errors while loading
  const trainingHistory = metrics?.training_history ?? [];
  const scatterPoints = metrics?.scatter_points ?? [];
  const corrMatrix = metrics?.correlation_matrix ?? [];
  const corrLabels = metrics?.labels ?? [];
  const probCurve = metrics?.probability_curve ?? [];

  // Flare distribution from backend
  const dist = metrics?.flare_distribution ?? [];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Forecast Workbench"
        title={<>Heliophysics <span className="text-gradient-cool">Analytics</span></>}
        description="Model performance, posterior distributions and feature interactions across mission telemetry."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { l: "AUROC", v: metrics?.auroc ?? 0, d: 3, Icon: TrendingUp, c: "text-[#3BFF9A]" },
          { l: "F1 Score", v: metrics?.f1_score ?? 0, d: 3, Icon: Sigma, c: "text-[#3BA4FF]" },
          { l: "Latency ms", v: metrics?.inference_ms ?? 0, d: 0, Icon: Zap, c: "text-[#FF8C1A]" },
          { l: "Dataset Size", v: metrics?.dataset_size ?? 0, d: 0, Icon: Activity, c: "text-white" },
        ].map((k) => (
          <motion.div whileHover={{ y: -2 }} key={k.l} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/45">{k.l}</span>
              <k.Icon className={`size-3.5 ${k.c}`} />
            </div>
            <div className={`mt-1 font-display text-2xl ${k.c}`}><AnimatedNumber value={k.v} decimals={k.d} /></div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 24" className="mt-2 w-full h-5 opacity-50">
              <polyline
                points={trainingHistory.slice(-8).map((p, i) =>
                  `${i * 14},${24 - (p.loss ?? 0) * 20}`
                ).join(" ")}
                fill="none"
                stroke={k.c.includes("3BFF") ? "#3BFF9A" : k.c.includes("3BA4") ? "#3BA4FF" : k.c.includes("FF8C") ? "#FF8C1A" : "#fff"}
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Training Loss Curve */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display text-base mb-1">Training & Validation Loss · {trainingHistory.length} Epochs</h3>
          <p className="text-xs text-white/45 mb-3">LightGBM convergence on SoLEXS + HEL1OS feature set</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trainingHistory} margin={{ left: -20, right: 8, top: 6 }}>
              <defs>
                <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8C1A" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#FF8C1A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3BA4FF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3BA4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="epoch" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle()} />
              <Area type="monotone" dataKey="loss" name="Train Loss" stroke="#FF8C1A" strokeWidth={2} fill="url(#gLoss)" />
              <Area type="monotone" dataKey="val_loss" name="Val Loss" stroke="#3BA4FF" strokeWidth={2} fill="url(#gVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Flare Distribution */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base mb-1">Flare Class Distribution</h3>
          <p className="text-xs text-white/45 mb-3">90-day catalog</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dist} margin={{ left: -24, right: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="c" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle()} />
              <defs>
                {dist.map((_, i) => (
                  <linearGradient key={i} id={`gBar${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8C1A" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3BA4FF" stopOpacity={0.4} />
                  </linearGradient>
                ))}
              </defs>
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="url(#gBar0)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Plot */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base mb-3">Magnetic Field × Velocity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ left: -24 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="x" type="number" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="y" type="number" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ZAxis dataKey="z" range={[20, 200]} />
              <Tooltip {...tooltipStyle()} />
              <Scatter data={scatterPoints} fill="#FF8C1A" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Correlation Matrix */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base mb-3">Correlation Matrix</h3>
          {corrMatrix.length > 0 && (
            <div className="grid gap-[2px] text-[10px] font-mono" style={{ gridTemplateColumns: `auto repeat(${corrLabels.length}, 1fr)` }}>
              <div />
              {corrLabels.map(l => <div key={l} className="text-center text-white/40 py-1">{l}</div>)}
              {corrMatrix.map((row, i) => (
                <Fragment key={`row${i}`}>
                  <div className="text-right pr-1 text-white/40 py-1.5 self-center">{corrLabels[i]}</div>
                  {row.map((v, j) => {
                    const intensity = Math.abs(v);
                    const color = v >= 0 ? `rgba(255,140,26,${intensity})` : `rgba(59,164,255,${intensity})`;
                    return <div key={`c${i}-${j}`} className="aspect-square rounded flex items-center justify-center text-[9px]" style={{ background: color, color: intensity > 0.4 ? "#000" : "#fff" }}>{v.toFixed(1)}</div>;
                  })}
                </Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Probability Curve */}
        <div className="glass rounded-2xl p-5 lg:col-span-3">
          <h3 className="font-display text-base mb-1">Probability Curve · Next 24h X-class</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={probCurve} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="gBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8C1A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF8C1A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle()} />
              <Area dataKey="hi" stroke="none" fill="url(#gBand)" />
              <Area dataKey="low" stroke="none" fill="#05070D" />
              <Line dataKey="mid" stroke="#FF8C1A" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageShell>
  );
}
