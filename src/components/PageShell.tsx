import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 pt-28 pb-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.main>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.3em] text-[#FF8C1A] uppercase mb-3">
        <span className="size-1 rounded-full bg-[#FF8C1A] shadow-[0_0_10px_#FF8C1A]" />
        {eyebrow}
      </div>
      <h1 className="text-4xl md:text-6xl font-display font-semibold leading-[1.05] tracking-tight text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-base text-white/55 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
