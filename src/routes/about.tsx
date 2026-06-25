import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { motion } from "framer-motion";
import { Github, Rocket } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · SolarSentinel AI" },
      { name: "description", content: "The mission, science and technology behind SolarSentinel — built for ISRO's Aditya-L1 program." },
    ],
  }),
  component: About,
});

const timeline = [
  { d: "Week 1", t: "Problem Identification & Aditya-L1 Dataset Collection" },
  { d: "Week 2", t: "Telemetry Processing Pipeline & Scientific Validation" },
  { d: "Week 3", t: "Feature Engineering & AI Nowcasting Model Training" },
  { d: "Week 4", t: "Bayesian Uncertainty & Explainability Integration" },
  { d: "Week 5", t: "Mission Control UI & Full Stack System Integration" },
  { d: "Final Stage", t: "Bharatiya Antariksh Hackathon 2026 Submission" },
];

const stackSections = [
  {
    label: "Frontend",
    color: "text-[#3BA4FF]",
    border: "border-[#3BA4FF]/30",
    items: ["React", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "TanStack Query", "Axios", "Recharts"],
  },
  {
    label: "Backend",
    color: "text-[#FF8C1A]",
    border: "border-[#FF8C1A]/30",
    items: ["FastAPI", "Python 3.12", "Motor", "MongoDB", "Pydantic v2", "Uvicorn", "APScheduler"],
  },
  {
    label: "AI / ML",
    color: "text-[#3BFF9A]",
    border: "border-[#3BFF9A]/30",
    items: ["Pandas", "NumPy", "SciPy", "Scikit-learn", "LightGBM", "XGBoost", "CatBoost", "PyTorch", "SHAP"],
  },
  {
    label: "Scientific Pipeline",
    color: "text-[#FFD18A]",
    border: "border-[#FFD18A]/30",
    items: ["SoLEXS L1 Data", "HEL1OS L1 Data", "Aditya-L1", "Astropy", "FITS Parser", "Time-series Features", "ISSDC / PRADAN"],
  },
];

function About() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Mission Charter"
        title={<>An AI-powered solar flare forecasting platform inspired by <span className="text-gradient-solar">ISRO's Aditya-L1</span> mission.</>}
        description="SolarSentinel is a production-grade AI platform demonstrating how probabilistic deep learning, calibrated uncertainty and operator-grade UX can transform humanity's relationship with the nearest star."
      />

      {/* Hero Mission */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-7">
          <h2 className="font-display text-2xl mb-3">The Mission</h2>
          <p className="text-white/65 leading-relaxed text-sm">
            Earth lives 1 AU from a violent G-class star. Every decade, an unforecast geomagnetic storm
            costs the global economy billions and threatens critical infrastructure. We believe the
            combination of ISRO's Aditya-L1 telemetry and modern probabilistic AI can push reliable
            X-class flare lead times beyond 48 hours — enough to protect satellites, power grids and
            polar aviation routes.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { k: "Technology", v: "Gradient boosting, Bayesian networks, and real-time ingestion pipelines for Level-1 FITS and CSV data." },
              { k: "Research", v: "Trained on 14+ years of GOES X-ray archive and 47+ days of live Aditya-L1 SoLEXS / HEL1OS telemetry." },
              { k: "Inspiration", v: "ISRO · NASA SDO · ESA Solar Orbiter · NOAA SWPC · Open heliophysics community." },
            ].map(b => (
              <div key={b.k} className="rounded-xl border border-white/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-[#FF8C1A] mb-1.5">{b.k}</div>
                <div className="text-xs text-white/65 leading-relaxed">{b.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,140,26,0.18),transparent_60%)]" />
          <div className="relative">
            <Rocket className="size-5 text-[#FF8C1A] mb-3" />
            <div className="font-display text-xl leading-snug">A hackathon prototype, engineered like flight software.</div>
            <p className="mt-3 text-sm text-white/60">Open source, reproducible and built to evolve into a production-grade public solar alert system.</p>
            <div className="mt-5 flex gap-2">
              <a href="https://github.com/isro-hackathon/solar-sentinel" className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-xs font-semibold hover:bg-white/10 transition">
                <Github className="size-3.5" /> 
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline + Tech Stack */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="glass rounded-2xl p-7">
          <h3 className="font-display text-xl mb-5">Development Timeline</h3>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-[#FF8C1A] via-[#3BA4FF] to-transparent" />
            {timeline.map((e, i) => (
              <motion.div
                key={e.d}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative pl-5 py-3"
              >
                <span className="absolute -left-[3px] top-4 size-2.5 rounded-full bg-[#FF8C1A] shadow-[0_0_10px_#FF8C1A]" />
                <div className="font-mono text-[11px] text-white/40">{e.d}</div>
                <div className="text-sm text-white/85">{e.t}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-7">
          <h3 className="font-display text-xl mb-5">Full Technology Stack</h3>
          <div className="space-y-5">
            {stackSections.map(section => (
              <div key={section.label}>
                <div className={`text-[10px] font-mono uppercase tracking-widest ${section.color} mb-2`}>{section.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map(s => (
                    <span key={s} className={`text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] border ${section.border} text-white/75`}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
