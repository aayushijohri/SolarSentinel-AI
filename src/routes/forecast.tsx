import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AlertTriangle, Bell, Calendar, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNowcast } from "@/lib/api";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast · SolarSentinel AI" },
      { name: "description", content: "Probabilistic forecast of solar flare events with risk classification and alert routing." },
    ],
  }),
  component: Forecast,
});

function Forecast() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['nowcast'],
    queryFn: () => getNowcast(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const probability = (forecast?.probability ?? 0) * 100;
  const risk = probability > 70 ? "HIGH" : probability > 45 ? "MODERATE" : "LOW";
  const riskColor = probability > 70 ? "text-[#FF5252]" : probability > 45 ? "text-[#FF8C1A]" : "text-[#3BFF9A]";

  if (isLoading) return <PageShell>Generating Forecast...</PageShell>;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Prediction Center"
        title={<>Solar <span className="text-gradient-solar">Forecast</span></>}
        description="Posterior probability of significant solar activity in the next 72 hours, conditioned on current heliospheric state."
      />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="glass rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,140,26,0.15),transparent_60%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-[0.3em] text-white/45 uppercase">Model: {forecast?.model_version || "LightGBM-v1"} · Live</span>
              <span className="font-mono text-[10px] text-white/45">LATENCY: {forecast?.processing_duration_ms?.toFixed(1)}ms</span>
            </div>
            <div className="flex items-end justify-center gap-12 mt-8">
              <RadialGauge value={probability} />
              <div className="pb-6">
                <div className="text-[10px] uppercase tracking-widest text-white/45">Risk Assessment</div>
                <div className={`font-display text-5xl ${riskColor} mt-1`}>{risk}</div>
                <div className="text-sm text-white/60 mt-2">P({forecast?.predicted_class}-class | Peak)</div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <Zap className="size-4 text-[#FF8C1A]" />
                  <span className="text-white/85">Forecast Horizon <span className="text-[#FF8C1A] font-semibold"><AnimatedNumber value={forecast?.lead_time_min ?? 60} suffix="m" /></span></span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1.5">
                  <Calendar className="size-4 text-[#3BA4FF]" />
                  <span className="text-white/85">Next Window <span className="text-[#3BA4FF] font-semibold">T+{forecast?.lead_time_min ?? 60}m</span></span>
                </div>
              </div>
            </div>

            <div className="mt-8 glass-strong rounded-xl p-4">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-3">Prediction Confidence Distribution</h4>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div initial={{ width: 0 }} animate={{ width: `${forecast?.confidence ? forecast.confidence * 100 : 0}%` }} className="h-full bg-gradient-to-r from-[#3BA4FF] to-[#3BFF9A]" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1.5">
                <span>BAYESIAN LOWER</span>
                <span>CONFIDENCE: {((forecast?.confidence ?? 0) * 100).toFixed(1)}%</span>
                <span>BAYESIAN UPPER</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-[#FF8C1A]" />
            <h3 className="font-display text-lg">Alert Dispatch Center</h3>
          </div>
          {[
            { ch: "ISRO Mission Ops", st: "Subscribed", c: "bg-[#3BFF9A]" },
            { ch: "Power Grid · CEA", st: probability > 60 ? "ALERTING" : "Subscribed", c: probability > 60 ? "bg-[#FF5252]" : "bg-[#3BFF9A]" },
            { ch: "GPS Augmentation", st: "Subscribed", c: "bg-[#3BFF9A]" },
            { ch: "Polar Aviation", st: probability > 80 ? "REROUTING" : "Standby", c: probability > 80 ? "bg-[#FF5252]" : "bg-[#FF8C1A]" },
            { ch: "Earth Monitoring", st: "Linked", c: "bg-[#3BA4FF]" },
          ].map(a => (
            <div key={a.ch} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <span className={`size-2 rounded-full ${a.c} shadow-[0_0_8px_currentColor]`} />
                <span className="text-sm text-white/85">{a.ch}</span>
              </div>
              <span className="font-mono text-[10px] text-white/45 uppercase tracking-widest">{a.st}</span>
            </div>
          ))}
          <button className="w-full rounded-lg bg-gradient-to-b from-[#FFB055] to-[#FF8C1A] text-black font-semibold py-3 text-sm shadow-[0_10px_30px_-12px_rgba(255,140,26,0.6)] hover:brightness-110 inline-flex items-center justify-center gap-2">
            <AlertTriangle className="size-4" /> Global Dispatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        {[
          { cls: "A", desc: "Quiescent", v: probability < 10 ? 95 : 5 },
          { cls: "B", desc: "Mild", v: probability < 20 ? 80 : 15 },
          { cls: "C", desc: "Moderate", v: probability < 40 ? 60 : 35 },
          { cls: "M", desc: "Strong", v: probability > 40 ? 45 : 10 },
          { cls: "X", desc: "Severe", v: probability > 80 ? 25 : 2 },
        ].map((c, i) => (
          <motion.div key={c.cls} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-[80px] font-display font-bold text-white/[0.04] leading-none">{c.cls}</div>
            <div className="relative">
              <div className="font-display text-2xl text-gradient-solar">{c.cls}-class</div>
              <div className="text-xs text-white/45 mt-0.5">{c.desc}</div>
              <div className="mt-3 font-mono text-2xl text-white"><AnimatedNumber value={c.v} suffix="%" /></div>
              <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.v}%` }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-[#FF8C1A] to-[#FF5252]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

function RadialGauge({ value }: { value: number }) {
  const r = 80; const C = 2 * Math.PI * r;
  return (
    <div className="relative">
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
        <motion.circle
          cx="110" cy="110" r={r}
          stroke="url(#gaugeGrad)" strokeWidth="14" fill="none" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (value / 100) * C }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD18A" />
            <stop offset="60%" stopColor="#FF8C1A" />
            <stop offset="100%" stopColor="#FF5252" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl text-white"><AnimatedNumber value={value} suffix="%" /></div>
        <div className="text-[10px] font-mono tracking-widest text-white/45 mt-1 uppercase">Solar Prob.</div>
      </div>
    </div>
  );
}
