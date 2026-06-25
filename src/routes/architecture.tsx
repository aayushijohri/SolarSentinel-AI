import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture · SolarSentinel AI" },
      { name: "description", content: "End-to-end ML pipeline from Aditya-L1 telemetry through vision transformer, Bayesian inference to public alerts." },
      { property: "og:title", content: "Architecture · SolarSentinel AI" },
      { property: "og:description", content: "Interactive view of the SolarSentinel data pipeline." },
    ],
  }),
  component: Architecture,
});

type Node = { id: string; t: string; d: string; long: string; c: string };
const nodes: Node[] = [
  { id: "ad", t: "Aditya-L1", d: "ISRO L1 observatory · 7 instruments", long: "Acquires multi-wavelength imaging and in-situ plasma measurements 1.5M km from Earth.", c: "from-[#FF8C1A] to-[#FFD18A]" },
  { id: "sp", t: "Signal Processing", d: "Calibration, dark current, gain", long: "Flat-fielding and dark subtraction on raw 4096² frames at 12s cadence.", c: "from-[#FFD18A] to-[#FF8C1A]" },
  { id: "fe", t: "Feature Extraction", d: "Mg II, X-ray, magnetic gradients", long: "Derives physically grounded scalar features alongside raw image patches.", c: "from-[#FF8C1A] to-[#FF5252]" },
  { id: "vt", t: "Vision Transformer", d: "ViT-L · 12 layers · 8 heads", long: "Spatial reasoning over coronagraph mosaics with patch embeddings.", c: "from-[#FF5252] to-[#7B6BFF]" },
  { id: "ls", t: "Temporal LSTM", d: "Δt 12s · 256 hidden", long: "Captures eruption build-up signatures across rolling 6-hour windows.", c: "from-[#7B6BFF] to-[#3BA4FF]" },
  { id: "by", t: "Bayesian Layer", d: "5128 MC samples", long: "Posterior over weights yields a calibrated uncertainty envelope.", c: "from-[#3BA4FF] to-[#3BFF9A]" },
  { id: "fc", t: "Forecast Engine", d: "Posterior aggregation", long: "Combines per-class probabilities into a 72-hour scenario distribution.", c: "from-[#3BFF9A] to-[#3BA4FF]" },
  { id: "ra", t: "Risk Assessment", d: "Sectoral impact scoring", long: "Maps geomagnetic indices to grid, GNSS, HF and aviation risk classes.", c: "from-[#3BA4FF] to-[#FF8C1A]" },
  { id: "ag", t: "Alert Generator", d: "WebSocket + email + SMS", long: "Dispatches structured alerts to subscribed operators within 200ms.", c: "from-[#FF8C1A] to-[#FF5252]" },
  { id: "ed", t: "Earth Dashboard", d: "Operator console", long: "Public-facing 3D situational awareness display.", c: "from-[#FF5252] to-[#FFD18A]" },
];

function Architecture() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Pipeline · v0.42"
        title={<>System <span className="text-gradient-cool">Architecture</span></>}
        description="Hover any stage to inspect inputs, outputs and operating constraints. Particles indicate live data flow."
      />

      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,140,26,0.06),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(59,164,255,0.08),transparent_60%)]" />
        <div className="relative space-y-3">
          {nodes.map((n, i) => (
            <div key={n.id}>
              <motion.div
                onHoverStart={() => setActive(n.id)}
                onHoverEnd={() => setActive(null)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                <div className="glass-strong rounded-xl p-4 md:p-5 flex items-center gap-5 cursor-pointer hover:bg-white/[0.06] transition">
                  <div className={`size-10 rounded-lg bg-gradient-to-br ${n.c} shadow-[0_0_20px_-4px_currentColor] relative shrink-0`}>
                    <span className="absolute inset-0 rounded-lg bg-white/20 mix-blend-overlay" />
                    <span className="absolute -inset-1 rounded-lg bg-current opacity-20 blur-md -z-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg text-white">{n.t}</div>
                    <div className="text-xs text-white/50 mt-0.5">{n.d}</div>
                  </div>
                  <div className="font-mono text-[10px] text-white/40 hidden md:block">STAGE {String(i + 1).padStart(2, "0")}</div>
                </div>
                {active === n.id && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-lg border border-white/10 bg-[#05070D]/80 backdrop-blur p-4 text-sm text-white/75">
                    {n.long}
                  </motion.div>
                )}
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <FlowConnector />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function FlowConnector() {
  return (
    <div className="relative h-6 w-1.5">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 mx-auto size-1.5 rounded-full bg-[#FF8C1A] shadow-[0_0_8px_#FF8C1A]"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 24, opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay: i * 0.45, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
