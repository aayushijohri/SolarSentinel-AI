import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Radio, Satellite, Sun, Zap, Shield, Clock } from "lucide-react";
import { Sun3D } from "@/components/Sun3D";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useQuery } from "@tanstack/react-query";
import { fetchMissionStatus } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SolarSentinel AI · Mission Home" },
      { name: "description", content: "AI-powered solar flare forecasting platform using ISRO Aditya-L1 telemetry." },
    ],
  }),
  component: Home,
});

type MissionCard = { 
  label: string; 
  value: number; 
  decimals?: number; 
  suffix?: string; 
  detail: string; 
  Icon: any; 
  color: string; 
  glow: string; 
  dot: string; 
  status: string; 
  bar: number; 
  barColor: string; 
};

function Home() {
  const { data: status } = useQuery({
    queryKey: ['mission-status-home'],
    queryFn: fetchMissionStatus,
    refetchInterval: 10000,
  });

  const missionCards: MissionCard[] = [
    { 
      label: "Solar Activity Index", 
      value: status?.solar_activity_index || 0, 
      decimals: 1, 
      suffix: "", 
      detail: status?.current_flare_class ? `Flare state: ${status.current_flare_class}` : "Syncing mission data...", 
      Icon: Sun, 
      color: "text-[#FF8C1A]", 
      glow: "bg-[#FF8C1A]", 
      dot: "bg-[#FF8C1A]", 
      status: status ? "LIVE" : "SYNCING", 
      bar: (status?.solar_activity_index || 0) * 10, 
      barColor: "bg-gradient-to-r from-[#FF8C1A] to-[#FF5252]" 
    },
    { 
      label: "Current Flare Class", 
      value: parseFloat((status?.current_flare_class || "0.0").replace(/[^0-9.]/g, '')), 
      decimals: 1, 
      suffix: ` ${status?.current_flare_class?.[0] || ""}`, 
      detail: `Telemetry flux: ${status?.solar_activity_index || "0.0"}`, 
      Icon: Zap, 
      color: "text-[#FFD18A]", 
      glow: "bg-[#FFD18A]", 
      dot: "bg-[#FFD18A]", 
      status: "MONITORING", 
      bar: 48, 
      barColor: "bg-gradient-to-r from-[#FFD18A] to-[#FF8C1A]" 
    },
    { 
      label: "Forecast Confidence", 
      value: status?.forecast_confidence || 0, 
      decimals: 1, 
      suffix: "%", 
      detail: "Bayesian posterior · 5k samples", 
      Icon: Shield, 
      color: "text-[#3BFF9A]", 
      glow: "bg-[#3BFF9A]", 
      dot: "bg-[#3BFF9A]", 
      status: "NOMINAL", 
      bar: status?.forecast_confidence || 0, 
      barColor: "bg-gradient-to-r from-[#3BFF9A] to-[#3BA4FF]" 
    },
    { 
      label: "Forecast Lead Time", 
      value: status?.forecast_lead_time_h || 0, 
      suffix: " h", 
      detail: "Median advance warning", 
      Icon: Clock, 
      color: "text-[#3BA4FF]", 
      glow: "bg-[#3BA4FF]", 
      dot: "bg-[#3BA4FF]", 
      status: "ON-TIME", 
      bar: 68, 
      barColor: "bg-gradient-to-r from-[#3BA4FF] to-[#7B6BFF]" 
    },
    { 
      label: "Satellite Health", 
      value: status?.satellite_health || 0, 
      decimals: 1, 
      suffix: "%", 
      detail: "Instrument payload health", 
      Icon: Satellite, 
      color: "text-white", 
      glow: "bg-white/40", 
      dot: "bg-[#3BFF9A]", 
      status: "ALL OK", 
      bar: status?.satellite_health || 0, 
      barColor: "bg-gradient-to-r from-white to-[#3BA4FF]" 
    },
    { 
      label: "Telemetry Throughput", 
      value: status?.telemetry_throughput_gbs || 0, 
      decimals: 2, 
      suffix: " Gb/s", 
      detail: "Deep Space Network status", 
      Icon: Radio, 
      color: "text-[#3BA4FF]", 
      glow: "bg-[#3BA4FF]", 
      dot: "bg-[#3BFF9A]", 
      status: "LIVE", 
      bar: 84, 
      barColor: "bg-gradient-to-r from-[#3BA4FF] to-[#3BFF9A]" 
    },
  ];

  return (
    <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mx-auto max-w-7xl">
        <section className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center min-h-[78vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full pl-1 pr-4 py-1 mb-6">
              <span className="bg-[#FF8C1A]/15 text-[#FF8C1A] text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-full border border-[#FF8C1A]/30">MISSION 0042</span>
              <span className="text-xs text-white/70">Aditya-L1 · Lagrangian Halo Orbit</span>
              <span className="size-1 rounded-full bg-[#3BFF9A] shadow-[0_0_8px_#3BFF9A]" />
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[0.95] tracking-tight text-white">
              AI Powered
              <br />
              <span className="text-gradient-solar">Solar Flare</span>
              <br />
              <span className="text-white/85">Forecasting.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg text-white/60 leading-relaxed">
              SolarSentinel ingests spectroscopic and magnetometer telemetry from ISRO's Aditya-L1 spacecraft and predicts the Sun's next major eruption.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/forecast" className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#FFB055] to-[#FF8C1A] text-black font-semibold px-6 py-3.5 text-sm transition">
                Launch Dashboard
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
                <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
              </Link>
            </div>
          </motion.div>

          {/* SUN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 -m-20 rounded-full bg-[#FF8C1A]/10 blur-3xl" />
              <Sun3D size={560} />
            </div>
          </motion.div>
        </section>

        {/* MISSION CARDS */}
        <section className="mt-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[11px] font-mono tracking-[0.3em] text-[#FF8C1A] uppercase mb-2">Live Mission Status</div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold">Realtime Heliophysics</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {missionCards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="glass rounded-2xl p-6 group relative overflow-hidden"
              >
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="size-9 rounded-lg glass flex items-center justify-center">
                      <c.Icon className={`size-4 ${c.color}`} />
                    </div>
                    <div className="text-[10px] font-mono text-white/40">{c.status}</div>
                  </div>
                  <div className="mt-5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">{c.label}</div>
                    <div className={`mt-1 text-3xl font-display font-semibold ${c.color}`}>
                      <AnimatedNumber value={c.value} decimals={c.decimals ?? 0} suffix={c.suffix ?? ""} />
                    </div>
                    <div className="mt-2 text-xs text-white/55">{c.detail}</div>
                  </div>
                  <div className="mt-5 h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.bar}%` }}
                      className={`h-full ${c.barColor}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="mt-12 glass rounded-2xl p-6 border border-white/5">
          <div className="grid md:grid-cols-4 gap-6 items-center">
             <div className="flex flex-col">
               <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Database · MongoDB</span>
               <span className="text-sm text-gradient-solar font-semibold">SYNCHRONIZED</span>
             </div>
             <div className="flex flex-col text-center border-l border-white/5">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Inference Nodes</span>
                <span className="text-sm text-white">{status?.active_nodes ?? 0} Active</span>
             </div>
             <div className="flex flex-col text-center border-l border-white/5">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Pipeline Health</span>
                <span className="text-sm text-[#3BFF9A]">{status?.pipeline_status ?? "OFFLINE"}</span>
             </div>
             <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">System Latency</span>
                <span className="text-sm text-white">{status?.telemetry.latency_ms ?? 0}ms</span>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}
