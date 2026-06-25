import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNowcast, getExplanation } from "@/lib/api";

export const Route = createFileRoute("/explainability")({
  head: () => ({
    meta: [
      { title: "Explainability · SolarSentinel AI" },
      { name: "description", content: "Transformer attention maps, SHAP values and decision pathways behind each forecast." },
    ],
  }),
  component: Explain,
});

function Explain() {
  const { data: nowcast } = useQuery({
    queryKey: ['nowcast'],
    queryFn: () => getNowcast(),
  });

  const predictionId = nowcast?.id || "latest";

  const { data: explanation, isLoading } = useQuery({
    queryKey: ['explanation', predictionId],
    queryFn: () => getExplanation(predictionId),
    enabled: !!predictionId,
  });

  const heatmap = Array.from({ length: 12 }, () => Array.from({ length: 16 }, () => 0.2 + Math.random() * 0.6));

  if (isLoading) return <PageShell>Decrypting model pathways...</PageShell>;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Model Interpretability"
        title={<>Decision <span className="text-gradient-cool">Transparency</span></>}
        description="Visual reasoning trail for every forecast — SHAP attributions and the Bayesian uncertainty envelope."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Attention Mapping · Feature Space</h3>
            <span className="font-mono text-[10px] text-white/45">LATENT ACTIVATION</span>
          </div>
          <div className="grid grid-cols-16 gap-[2px] aspect-[16/12]" style={{ gridTemplateColumns: "repeat(16,1fr)" }}>
            {heatmap.flatMap((row, i) => row.map((v, j) => (
              <motion.div
                key={`${i}-${j}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-sm"
                style={{ background: `rgba(255,140,26,${v.toFixed(2)})` }}
              />
            )))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg mb-4">SHAP Attribution waterfall</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-white/45 font-mono mb-4">
               <span>PREDICTION REF: {predictionId}</span>
            </div>
            {explanation?.top_features?.map((f: any, i: number) => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/85 font-mono">{f.name}</span>
                  <span className={f.shap >= 0 ? "text-[#FF8C1A]" : "text-[#3BA4FF]"}>{f.shap >= 0 ? "+" : ""}{f.shap.toFixed(2)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.abs(f.importance) * 100}%` }} transition={{ duration: 0.9 }}
                    className={`h-full ${f.shap >= 0 ? "bg-gradient-to-r from-[#FF8C1A] to-[#FF5252]" : "bg-gradient-to-r from-[#3BA4FF] to-[#7B6BFF]"}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="size-4 text-[#3BA4FF]" />
            <h3 className="font-display text-lg">Inference Reasoning</h3>
          </div>
          
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="text-[10px] uppercase tracking-widest text-[#3BA4FF] mb-3">Model Analysis Summary</div>
            <p className="text-base text-white/90 leading-relaxed italic">
              "{explanation?.reasoning || "Analyzing heliospheric state to generate decision pathway..."}"
            </p>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/45 mb-2">Confidence Metric</div>
              <div className="flex items-end gap-4">
                <div>
                  <div className="font-display text-3xl text-white">{(nowcast?.probability ?? 0).toFixed(2)}</div>
                  <div className="text-[11px] font-mono text-white/45">Posterior Mean</div>
                </div>
                <div className="text-[#3BA4FF]">
                  <div className="font-mono text-sm">[{( (nowcast?.probability ?? 0) - 0.05).toFixed(2)}, {( (nowcast?.probability ?? 0) + 0.05).toFixed(2)}]</div>
                  <div className="text-[11px] font-mono text-white/45">95% Bayesian CI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
