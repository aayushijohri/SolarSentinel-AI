import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { CheckCircle2, AlertTriangle, Activity, Database, Radio, Satellite, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchMissionStatus } from "@/lib/api";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Mission Control · SolarSentinel AI" },
      { name: "description", content: "Live mission control: telemetry, command logs, system health and operator console for the Aditya-L1 forecasting pipeline." },
    ],
  }),
  component: Mission,
});

function Mission() {
  const { data: status, isLoading } = useQuery({
    queryKey: ['mission-status-full'],
    queryFn: fetchMissionStatus,
    refetchInterval: 5000,
  });

  if (isLoading) return <PageShell>Connecting to Aditya-L1 Mission Control...</PageShell>;

  const telemetryMetrics = [
    { l: "Bus Voltage", v: status?.system_health.power_bus_v ?? 0, d: 1, c: "text-[#3BFF9A]" },
    { l: "CPU Usage %", v: status?.system_health.cpu_usage ?? 0, d: 1, c: "text-white" },
    { l: "Memory %", v: status?.system_health.mem_usage ?? 0, d: 1, c: "text-white" },
    { l: "Amb. Temp °C", v: status?.system_health.onboard_temp ?? 0, d: 1, c: "text-[#3BA4FF]" },
    { l: "Throughput", v: status?.telemetry.throughput_gbs ?? 0, d: 2, c: "text-[#FF8C1A]" },
    { l: "Packets / s", v: status?.telemetry.packets_received ?? 0, d: 0, c: "text-[#3BA4FF]" },
    { l: "Dropped", v: status?.telemetry.dropped_frames ?? 0, d: 0, c: "text-[#FF5252]" },
    { l: "Sync State", v: status?.system_health.instrument_sync === "LOCKED" ? 1 : 0, suffix: status?.system_health.instrument_sync === "LOCKED" ? " LOCKED" : " SYNCING", c: status?.system_health.instrument_sync === "LOCKED" ? "text-[#3BFF9A]" : "text-[#FF8C1A]" },
  ];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Mission Control · MOX-04"
        title={<>Operator <span className="text-gradient-solar">Console</span></>}
        description="Spacecraft telemetry, instrument health, command queue and live mission timeline for the Aditya-L1 heliophysics platform."
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Telemetry */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Satellite className="size-4 text-[#3BA4FF]" />
              <h3 className="font-display text-lg">Live Telemetry</h3>
            </div>
            <span className="font-mono text-[10px] text-white/40">DSN: {status?.telemetry.active_stream}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {telemetryMetrics.map((m) => (
              <div key={m.l} className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/40">{m.l}</div>
                <div className={`mt-1 font-display text-xl ${m.c}`}>
                   {typeof m.v === 'number' ? (
                     <AnimatedNumber value={m.v} decimals={m.d ?? 0} suffix={m.suffix} />
                   ) : m.v}
                </div>
              </div>
            ))}
          </div>

          {/* timeline */}
          <div className="mt-6">
            <div className="text-[11px] font-mono tracking-[0.3em] text-white/45 uppercase mb-3">Mission Timeline</div>
            <div className="relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#FF8C1A] via-[#3BA4FF] to-transparent" />
              {status?.timeline.map((e, i) => (
                <div key={i} className="relative pl-5 py-2.5">
                  <span className={`absolute left-[-2px] top-3.5 size-[10px] rounded-full ${e.status === 'ACTIVE' ? 'bg-[#FF8C1A]' : 'bg-[#3BFF9A]'} shadow-[0_0_10px_currentColor]`} />
                  <div className="font-mono text-[11px] text-white/40">{e.ts}</div>
                  <div className="text-sm text-white/85">{e.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts + Objectives */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-4 text-[#FF8C1A]" />
              <h3 className="font-display text-lg">Active Alerts</h3>
            </div>
            <div className="space-y-3">
              {status?.alerts.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl border border-white/10 ${a.severity === 'MEDIUM' ? 'bg-[#FF8C1A]/10' : 'bg-white/5'} p-3.5`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 size-2 rounded-full ${a.severity === 'MEDIUM' ? 'bg-[#FF8C1A]' : 'bg-[#3BA4FF]'} animate-pulse`} />
                    <div className="flex-1">
                      <div className="text-sm text-white">{a.message}</div>
                      <div className="text-[11px] text-white/50 mt-0.5">{a.ts}</div>
                    </div>
                    <span className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/5">{a.severity[0]}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="size-4 text-[#3BFF9A]" />
              <h3 className="font-display text-lg">Mission Objectives</h3>
            </div>
            <ul className="space-y-2.5 text-sm">
              {status?.mission_objectives.map((o) => (
                <li key={o.task} className="flex items-center gap-3">
                  <span className={`size-4 rounded-full flex items-center justify-center ${o.progress === 100 ? "bg-[#3BFF9A]/20" : "bg-white/5"}`}>
                    {o.progress === 100 && <span className="size-1.5 rounded-full bg-[#3BFF9A]" />}
                  </span>
                  <span className={o.progress === 100 ? "text-white/85" : "text-white/40"}>{o.task} ({o.progress}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Systems + Logs */}
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 mt-4">
         <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg mb-5">Subsystem Health</h3>
          <div className="space-y-4">
             {status?.subsystems.map((s: { name: string; value: number; status: string }, idx: number) => {
               const Icon = [Activity, Database, Wifi, Radio][idx % 4];
               const color = s.value > 90 ? "text-[#3BFF9A]" : s.value > 70 ? "text-[#3BA4FF]" : "text-[#FF5252]";
               return (
                 <div key={s.name}>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-white/45">{s.name}</span>
                      <span className={color}>{s.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} className={`h-full ${color.replace('text', 'bg')}`} />
                    </div>
                 </div>
               );
             })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg">Command Execution Log</h3>
            <span className="text-[10px] font-mono text-white/40">LATEST UPDATED {status?.last_updated.substring(11, 19)} UTC</span>
          </div>
          <div className="font-mono text-[11px] space-y-2 max-h-[300px] overflow-auto pr-2">
            {status?.command_log.map((l, i) => (
              <div key={i} className="flex gap-4 py-2 border-b border-white/[0.04]">
                <span className="text-white/35 shrink-0">{l.ts.substring(11, 19)}</span>
                <span className="text-[#3BA4FF] shrink-0">[{l.user}]</span>
                <span className="text-white/75 truncate">{l.cmd}</span>
                <span className="ml-auto text-[#3BFF9A]">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
