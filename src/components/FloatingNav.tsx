import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const items = [
  { to: "/", label: "Home" },
  { to: "/mission", label: "Mission" },
  { to: "/observatory", label: "Observatory" },
  { to: "/analytics", label: "Analytics" },
  { to: "/forecast", label: "Forecast" },
  { to: "/earth-impact", label: "Earth Impact" },
  { to: "/explainability", label: "Explainability" },
  { to: "/dataset", label: "Dataset" },
  { to: "/architecture", label: "Architecture" },
  { to: "/about", label: "About" },
] as const;

export function FloatingNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1180px,calc(100vw-2rem))]"
    >
      <nav className="glass-strong rounded-2xl px-3 py-2.5 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-lg group">
          <div className="relative">
            <div className="size-7 rounded-md bg-gradient-to-br from-[#FF8C1A] to-[#FF5252] flex items-center justify-center shadow-[0_0_20px_-4px_#FF8C1A]">
              <Activity className="size-3.5 text-black" strokeWidth={3} />
            </div>
            <span className="absolute -inset-1 rounded-md bg-[#FF8C1A]/30 blur-md -z-10 group-hover:bg-[#FF8C1A]/50 transition" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-display font-bold tracking-widest text-white/90">SOLAR<span className="text-[#FF8C1A]">SENTINEL</span></div>
            <div className="text-[9px] tracking-[0.25em] text-white/40">AI · ADITYA-L1</div>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-0.5 ml-2 flex-1">
          {items.map((it) => {
            const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className="relative px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-md bg-white/[0.07] border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${active ? "text-white" : ""}`}>{it.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#FF8C1A] to-[#3BA4FF] rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2 pr-1">
          <span className="hidden md:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-[#3BFF9A] animate-ping" />
              <span className="relative rounded-full bg-[#3BFF9A] size-1.5" />
            </span>
            Link OK · L1
          </span>
        </div>
      </nav>
    </motion.header>
  );
}
