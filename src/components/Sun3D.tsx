import { useEffect, useRef, useState } from "react";

export function Sun3D({ size = 520 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div style={{ width: size, height: size }} className="rounded-full bg-gradient-to-br from-[#FFD18A] to-[#FF5252] blur-2xl opacity-40" />;
  }
  return <SunCanvas size={size} />;
}

function SunCanvas({ size }: { size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr; c.height = size * dpr;
    c.style.width = size + "px"; c.style.height = size + "px";
    ctx.scale(dpr, dpr);

    let raf = 0; let t = 0;
    const cx = size / 2, cy = size / 2;
    const sunR = size * 0.28;

    // pre-bake noise blobs (plasma cells)
    const blobs = Array.from({ length: 60 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * sunR * 0.95,
      s: 6 + Math.random() * 18,
      ph: Math.random() * Math.PI * 2,
      hue: 18 + Math.random() * 26,
    }));

    // flares
    const flares = Array.from({ length: 6 }, (_, i) => ({
      a: (i / 6) * Math.PI * 2,
      len: sunR * (0.4 + Math.random() * 0.6),
      ph: Math.random() * Math.PI * 2,
    }));

    // particles (solar wind)
    type P = { a: number; r: number; v: number; life: number; size: number };
    const particles: P[] = [];

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, size, size);

      // outer corona glow
      const cg = ctx.createRadialGradient(cx, cy, sunR * 0.8, cx, cy, size * 0.55);
      cg.addColorStop(0, "rgba(255,170,80,0.55)");
      cg.addColorStop(0.4, "rgba(255,120,40,0.18)");
      cg.addColorStop(1, "rgba(255,80,40,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, size, size);

      // corona streamers
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.05);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const len = sunR * (1.4 + Math.sin(t * 1.2 + i) * 0.25);
        const grad = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
        grad.addColorStop(0, "rgba(255,180,80,0.35)");
        grad.addColorStop(1, "rgba(255,80,40,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * sunR, Math.sin(a) * sunR);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();

      // sun body
      const sg = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, sunR * 0.1, cx, cy, sunR);
      sg.addColorStop(0, "#FFF0C8");
      sg.addColorStop(0.4, "#FFC964");
      sg.addColorStop(0.75, "#FF8C1A");
      sg.addColorStop(1, "#C24018");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();

      // plasma blobs (rotating)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.clip();
      ctx.globalCompositeOperation = "screen";
      for (const b of blobs) {
        const a = b.a + t * 0.18;
        const x = cx + Math.cos(a) * b.r;
        const y = cy + Math.sin(a) * b.r * 0.96;
        const pulse = 0.5 + Math.sin(t * 2 + b.ph) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.s);
        g.addColorStop(0, `hsla(${b.hue}, 95%, ${55 + pulse * 15}%, ${0.55 + pulse * 0.3})`);
        g.addColorStop(1, "rgba(255,80,20,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, b.s, 0, Math.PI * 2); ctx.fill();
      }
      // dark sunspots
      ctx.globalCompositeOperation = "multiply";
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7 + t * 0.05;
        const r = sunR * 0.55;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.9;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0, "rgba(60,20,0,0.85)");
        g.addColorStop(1, "rgba(60,20,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // limb darkening rim highlight
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const rim = ctx.createRadialGradient(cx, cy, sunR * 0.9, cx, cy, sunR);
      rim.addColorStop(0, "rgba(255,200,120,0)");
      rim.addColorStop(1, "rgba(255,220,150,0.6)");
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // solar flares (arcs)
      for (const f of flares) {
        const a = f.a + t * 0.1;
        const intensity = 0.5 + Math.sin(t * 1.4 + f.ph) * 0.5;
        const x0 = cx + Math.cos(a) * sunR;
        const y0 = cy + Math.sin(a) * sunR;
        const x1 = cx + Math.cos(a) * (sunR + f.len * intensity);
        const y1 = cy + Math.sin(a) * (sunR + f.len * intensity);
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `rgba(255,230,150,${0.8 * intensity})`);
        grad.addColorStop(1, "rgba(255,80,40,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 + intensity * 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        const mx = (x0 + x1) / 2 + Math.cos(a + 1.2) * 12 * intensity;
        const my = (y0 + y1) / 2 + Math.sin(a + 1.2) * 12 * intensity;
        ctx.quadraticCurveTo(mx, my, x1, y1);
        ctx.stroke();
      }

      // emit particles
      if (Math.random() < 0.6) {
        particles.push({
          a: Math.random() * Math.PI * 2,
          r: sunR + 2,
          v: 0.3 + Math.random() * 0.6,
          life: 1,
          size: Math.random() * 1.2 + 0.4,
        });
      }
      ctx.globalCompositeOperation = "screen";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.r += p.v; p.life -= 0.006;
        if (p.life <= 0 || p.r > size * 0.5) { particles.splice(i, 1); continue; }
        const x = cx + Math.cos(p.a) * p.r;
        const y = cy + Math.sin(p.a) * p.r;
        ctx.fillStyle = `rgba(255,180,90,${p.life})`;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // lens flare
      const lf = ctx.createRadialGradient(cx - sunR * 0.4, cy - sunR * 0.5, 0, cx - sunR * 0.4, cy - sunR * 0.5, 60);
      lf.addColorStop(0, "rgba(255,255,255,0.6)");
      lf.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = lf;
      ctx.beginPath(); ctx.arc(cx - sunR * 0.4, cy - sunR * 0.5, 60, 0, Math.PI * 2); ctx.fill();

      // satellite orbit
      const orbitR = sunR * 1.8;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, orbitR, orbitR * 0.32, -0.4, 0, Math.PI * 2); ctx.stroke();

      // Aditya-L1 spacecraft
      const sa = t * 0.4;
      const sx = cx + Math.cos(sa) * orbitR * Math.cos(-0.4) - Math.sin(sa) * orbitR * 0.32 * Math.sin(-0.4);
      const sy = cy + Math.cos(sa) * orbitR * Math.sin(-0.4) + Math.sin(sa) * orbitR * 0.32 * Math.cos(-0.4);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(sa + Math.PI / 2);
      // body
      ctx.fillStyle = "#E8ECF5";
      ctx.fillRect(-3, -5, 6, 10);
      // solar panels
      ctx.fillStyle = "#2A4B8C";
      ctx.fillRect(-14, -2, 10, 4);
      ctx.fillRect(4, -2, 10, 4);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-14, -2, 10, 4);
      ctx.strokeRect(4, -2, 10, 4);
      // antenna
      ctx.strokeStyle = "#E8ECF5";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, -10); ctx.stroke();
      ctx.restore();
      // glow
      ctx.fillStyle = "rgba(59,164,255,0.6)";
      ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);
  return <canvas ref={ref} className="drop-shadow-[0_0_80px_rgba(255,140,26,0.4)]" />;
}
