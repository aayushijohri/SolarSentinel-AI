import { useEffect, useRef } from "react";

export function Starfield({ density = 180 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    type Star = { x: number; y: number; z: number; r: number; tw: number; c: string };
    const colors = ["#ffffff", "#cfe2ff", "#ffd6a8", "#a8c9ff"];
    const stars: Star[] = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1 + 0.2,
      r: Math.random() * 1.4 + 0.2,
      tw: Math.random() * Math.PI * 2,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    type Meteor = { x: number; y: number; vx: number; vy: number; life: number };
    const meteors: Meteor[] = [];

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let t = 0;
    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // nebula glow
      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.5);
      g1.addColorStop(0, "rgba(123, 107, 255, 0.08)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.7, 0, w * 0.85, h * 0.7, w * 0.45);
      g2.addColorStop(0, "rgba(59, 164, 255, 0.07)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.02;
        const px = s.x + mouse.current.x * 14 * s.z * dpr;
        const py = s.y + mouse.current.y * 14 * s.z * dpr;
        const a = 0.5 + Math.sin(s.tw) * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, s.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = s.c;
        ctx.globalAlpha = a * s.z;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // occasional meteor
      if (Math.random() < 0.008 && meteors.length < 3) {
        meteors.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: -(6 + Math.random() * 4) * dpr,
          vy: (3 + Math.random() * 2) * dpr,
          life: 1,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const tailX = m.x - m.vx * 12;
        const tailY = m.y - m.vy * 12;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,220,180,${m.life})`);
        grad.addColorStop(1, "rgba(255,220,180,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        m.x += m.vx; m.y += m.vy; m.life -= 0.012;
        if (m.life <= 0 || m.x < -200 || m.y > h + 200) meteors.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: "transparent" }}
    />
  );
}
