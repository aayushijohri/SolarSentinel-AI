import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Sun3D } from "@/components/Sun3D";
import { Pause, Play, ZoomIn, ZoomOut, Layers, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveformData, fetchMissionStatus } from "@/lib/api";

export const Route = createFileRoute("/observatory")({
  head: () => ({
    meta: [
      { title: "Observatory · SolarSentinel AI" },
      { name: "description", content: "Scientific observatory: heatmaps, magnetic field overlays, spectroscopy and waveform monitoring of the Sun." },
    ],
  }),
  component: Observatory,
});

function Waveform({ data }: { data?: any[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);

    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const loop = () => {
      t += 0.025;
      ctx.clearRect(0, 0, c.width, c.height);
      const w = c.width, h = c.height;

      const drawLine = (key: string, color: string, yScale: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6 * dpr;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        data.forEach((point, i) => {
          const x = (i / (data.length - 1)) * w;
          const rawVal = typeof point[key] === 'number' ? point[key] : 0;
          const normalised = Math.min(rawVal / 20.0, 1.0); // Normalise to [0,1]
          const y = h * 0.85 - normalised * h * 0.7 * yScale + Math.sin(t + i * 0.2) * 1.5;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      drawLine("solexs_flux", "#FF8C1A", 1.0);
      drawLine("hel1os_hard_flux", "#3BA4FF", 1.2);
      drawLine("hel1os_soft_flux", "#3BFF9A", 0.8);

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [data]);

  return <canvas ref={ref} className="w-full h-32" />;
}

function Observatory() {
  const [playing, setPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState<"magnetic" | "spectro" | "heat">("magnetic");

  const { data: waveformData } = useQuery({
    queryKey: ['waveform', 'SoLEXS'],
    queryFn: () => fetchWaveformData('SoLEXS', 72),
    refetchInterval: playing ? 5000 : false,
  });

  const { data: status } = useQuery({
    queryKey: ['mission-status-obs'],
    queryFn: fetchMissionStatus,
    refetchInterval: 5000,
  });

  const wavePoints = waveformData?.data ?? [];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="VELC · SUIT · SoLEXS"
        title={<>Solar <span className="text-gradient-solar">Observatory</span></>}
        description="Multi-wavelength imaging of the Sun's photosphere, chromosphere and corona. Toggle scientific overlays to inspect magnetic topology, doppler shifts and X-ray emission."
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,26,0.06),transparent_60%)]" />
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#FF8C1A] animate-pulse" />
              <span className="font-mono text-[11px] tracking-widest text-white/55 uppercase">
                Live · {status?.current_flare_class || "M2.4"} · {new Date().toISOString().substring(11, 16)} UTC
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(["magnetic", "spectro", "heat"] as const).map((l) => (
                <button key={l} onClick={() => setLayer(l)} className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border transition ${layer === l ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-white/40 hover:text-white"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[520px]" style={{ transform: `scale(${zoom})`, transition: "transform .5s" }}>
            <Sun3D size={520} />
            {layer === "magnetic" && (
              <svg className="absolute inset-0 m-auto pointer-events-none" viewBox="0 0 520 520" width="520" height="520">
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i / 24) * Math.PI * 2;
                  const r1 = 150, r2 = 230;
                  return (
                    <path key={i} d={`M ${260 + Math.cos(a) * r1} ${260 + Math.sin(a) * r1} Q ${260 + Math.cos(a + 0.2) * (r2 + 20)} ${260 + Math.sin(a + 0.2) * (r2 + 20)} ${260 + Math.cos(a + 0.5) * r1} ${260 + Math.sin(a + 0.5) * r1}`} stroke="rgba(59,164,255,0.45)" strokeWidth="0.8" fill="none" />
                  );
                })}
              </svg>
            )}
            {layer === "heat" && (
              <div className="absolute rounded-full mix-blend-screen opacity-50" style={{ width: 360, height: 360, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "conic-gradient(from 0deg, #FF5252, #FF8C1A, #FFD18A, #FF5252)" }} />
            )}
            {layer === "spectro" && (
              <svg className="absolute inset-0 m-auto pointer-events-none" viewBox="0 0 520 520">
                {Array.from({ length: 60 }).map((_, i) => (
                  <line key={i} x1={i * 8.6} y1="0" x2={i * 8.6} y2="520" stroke={`hsla(${i * 6}, 90%, 60%, 0.15)`} strokeWidth="1" />
                ))}
              </svg>
            )}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
              <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 border border-[#3BA4FF]/40 rounded" />
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-between glass-strong rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button onClick={() => setPlaying(p => !p)} className="size-8 rounded-md bg-[#FF8C1A] text-black flex items-center justify-center hover:brightness-110">
                {playing ? <Pause className="size-3.5 fill-black" /> : <Play className="size-3.5 fill-black" />}
              </button>
              <button onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center"><ZoomOut className="size-3.5" /></button>
              <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="size-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center"><ZoomIn className="size-3.5" /></button>
              <Layers className="size-3.5 text-white/40 ml-2" />
              <span className="font-mono text-[10px] text-white/40">LAYER · {layer.toUpperCase()}</span>
            </div>
            <div className="flex-1 mx-5 hidden md:block">
              <div className="h-1 rounded-full bg-white/10 relative">
                <div className="absolute h-full bg-gradient-to-r from-[#FF8C1A] to-[#3BA4FF] rounded-full" style={{ width: "62%" }} />
                <div className="absolute size-3 rounded-full bg-white -top-1 shadow-lg" style={{ left: "62%" }} />
              </div>
              <div className="flex justify-between mt-1.5 font-mono text-[9px] text-white/35">
                <span>T-24h</span><span>NOW</span><span>T+24h</span>
              </div>
            </div>
            <div className="font-mono text-[10px] text-white/50">
              {waveformData?.source === 'REAL_TELEMETRY' ? '● REAL DATA' : '● PHYSICS SIM'}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="size-4 text-[#3BA4FF]" />
              <h3 className="font-display text-base">Waveform Monitor</h3>
              <span className="ml-auto font-mono text-[9px] text-white/30">{wavePoints.length} pts</span>
            </div>
            {wavePoints.length > 0 ? (
              <Waveform data={wavePoints} />
            ) : (
              <div className="w-full h-32 flex items-center justify-center text-white/30 text-xs font-mono animate-pulse">
                AWAITING STREAM...
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 font-mono text-[10px]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#FF8C1A]" /> SXR Flux</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#3BA4FF]" /> HXR Hard</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#3BFF9A]" /> HXR Soft</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-base mb-3">Instrument Status</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Source", "Aditya-L1 / Lagrange 1"],
                ["Satellite Health", `${status?.satellite_health ?? 0}%`],
                ["Data Throughput", `${status?.telemetry_throughput_gbs ?? 0} Gb/s`],
                ["SoLEXS Status", status?.subsystems.find(s => s.name.includes("SoLEXS"))?.status ?? "NOMINAL"],
                ["HEL1OS Status", status?.subsystems.find(s => s.name.includes("HEL1OS"))?.status ?? "NOMINAL"],
                ["Pipeline Sync", status?.system_health.instrument_sync ?? "LOCKED"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/45">{k}</span>
                  <span className="font-mono text-xs text-white/85">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-base mb-3">Mission Activity</h3>
            <div className="space-y-2.5">
              {[
                { t: `Flare ${status?.current_flare_class || "M2.4"}`, d: "Active Region", c: "bg-[#FF8C1A]" },
                { t: "Telemetry Ingest", d: `${waveformData?.source ?? 'STREAM'} active`, c: "bg-[#3BA4FF]" },
                { t: "ML Inference", d: "Window: 60m", c: "bg-[#3BFF9A]" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                  <span className={`size-2 rounded-full ${e.c} shadow-[0_0_8px_currentColor]`} />
                  <span className="text-sm text-white/85">{e.t}</span>
                  <span className="text-xs text-white/45 ml-auto">{e.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
