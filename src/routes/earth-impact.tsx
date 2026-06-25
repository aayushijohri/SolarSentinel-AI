import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Earth3D } from "@/components/Earth3D";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Plane, Radio, Satellite, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getNowcast } from "@/lib/api";

export const Route = createFileRoute("/earth-impact")({
  head: () => ({
    meta: [
      { title: "Earth Impact · SolarSentinel AI" },
      { name: "description", content: "Geomagnetic, ionospheric and infrastructure impact analysis of incoming coronal mass ejections." },
    ],
  }),
  component: EarthImpact,
});

function EarthImpact() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ['nowcast'],
    queryFn: () => getNowcast(),
  });

  const prob = (forecast?.probability ?? 0) * 100;
  
  const impactLevel = prob > 80 ? "G4 Extreme" : prob > 60 ? "G3 Strong" : prob > 40 ? "G2 Moderate" : prob > 20 ? "G1 Minor" : "G0 Quiet";
  const impactColor = prob > 60 ? "text-[#FF5252]" : prob > 40 ? "text-[#FF8C1A]" : "text-[#3BFF9A]";

  const risks = [
    { l: "Power Grid", v: Math.min(100, prob * 0.9), Icon: Zap, c: "text-[#FF8C1A]", g: "from-[#FF8C1A] to-[#FF5252]" },
    { l: "GPS / GNSS", v: Math.min(100, prob * 0.7), Icon: Satellite, c: "text-[#FFD18A]", g: "from-[#FFD18A] to-[#FF8C1A]" },
    { l: "Comms / HF", v: Math.min(100, prob * 0.6), Icon: Radio, c: "text-[#3BA4FF]", g: "from-[#3BA4FF] to-[#7B6BFF]" },
    { l: "Polar Aviation", v: Math.min(100, prob * 0.5), Icon: Plane, c: "text-[#3BFF9A]", g: "from-[#3BFF9A] to-[#3BA4FF]" },
  ];

  if (isLoading) return <PageShell>Calculating Impact risks...</PageShell>;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Geospace Impact Center"
        title={<>Earth <span className="text-gradient-cool">Impact</span> Forecast</>}
        description="Three-dimensional CME propagation model and projected infrastructure consequences based on real-time solar observation."
      />

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <div className="glass rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,164,255,0.12),transparent_60%)]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${prob > 60 ? "bg-[#FF5252]" : "bg-[#3BFF9A]"} animate-pulse`} />
                <span className="font-mono text-[11px] tracking-widest text-white/55 uppercase">
                  {impactLevel} Storm · Tracking Active
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/45">ETA: T+{forecast?.lead_time_min ?? 60}m</span>
            </div>
            <div className="flex items-center justify-center min-h-[520px]">
              <Earth3D size={520} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 font-mono text-[10px]">
              {[
                ["Bz nT", forecast?.derived_metrics?.bz_nt ?? -2.1, (forecast?.derived_metrics?.bz_nt ?? 0) < -10 ? "text-[#FF5252]" : "text-[#3BFF9A]"],
                ["Vsw km/s", forecast?.derived_metrics?.vsw_kms ?? 320, (forecast?.derived_metrics?.vsw_kms ?? 0) > 500 ? "text-[#FF8C1A]" : "text-white/60"],
                ["Dst nT", forecast?.derived_metrics?.dst_nt ?? 0, "text-[#3BA4FF]"],
              ].map(([k, v, c]) => (
                <div key={k as string} className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                  <div className="text-white/40 uppercase tracking-widest">{k}</div>
                  <div className={`text-base ${c} mt-0.5`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg mb-5">Predictive Sectoral Risk</h3>
            <div className="space-y-4">
              {risks.map((r, i) => (
                <motion.div key={r.l} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-sm text-white/85">
                      <r.Icon className={`size-4 ${r.c}`} />{r.l}
                    </span>
                    <span className={`font-mono text-sm ${r.c}`}>
                      <AnimatedNumber value={r.v} suffix="%" />
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${r.v}%` }} transition={{ duration: 1.3, ease: "easeOut" }} className={`h-full bg-gradient-to-r ${r.g}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg mb-3">Impact Alert Status</h3>
            <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/10">
               <div className={`text-[11px] font-mono tracking-[0.3em] ${impactColor} uppercase mb-2`}>Official Watch</div>
               <div className="font-display text-xl">{impactLevel} Conditions</div>
               <p className="mt-2 text-sm text-white/55">
                 {prob > 50 ? "Voltage instability possible in power grids. GPS positioning errors likely. Satellite drag increasing." : "Geomagnetic state remains quiet. No immediate infrastructure countermeasures required."}
               </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
