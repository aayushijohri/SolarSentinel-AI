import { useEffect, useRef, useState } from "react";

export function Earth3D({ size = 520 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: size, height: size }} className="rounded-full bg-[#0B3A6B] opacity-40" />;
  return <EarthCanvas size={size} />;
}

function EarthCanvas({ size }: { size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr; c.height = size * dpr;
    c.style.width = size + "px"; c.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const R = size * 0.34;

    // Generate continents as random blobs on a sphere (lat/long points)
    type Cont = { lat: number; lon: number; r: number; pts: { dlat: number; dlon: number }[] };
    const conts: Cont[] = [];
    const rng = (() => { let s = 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
    for (let i = 0; i < 14; i++) {
      const lat = (rng() - 0.5) * Math.PI * 0.9;
      const lon = rng() * Math.PI * 2;
      const r = 0.15 + rng() * 0.35;
      const pts = Array.from({ length: 14 }, () => ({
        dlat: (rng() - 0.5) * r,
        dlon: (rng() - 0.5) * r * 1.6,
      }));
      conts.push({ lat, lon, r, pts });
    }
    // city lights
    const cities = Array.from({ length: 90 }, () => ({
      lat: (rng() - 0.5) * Math.PI * 0.85,
      lon: rng() * Math.PI * 2,
      b: 0.4 + rng() * 0.6,
    }));

    let raf = 0; let t = 0;
    const project = (lat: number, lon: number, rot: number) => {
      const x = Math.cos(lat) * Math.sin(lon + rot);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon + rot);
      return { x: cx + x * R, y: cy - y * R, z };
    };

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, size, size);

      // atmosphere outer glow
      const ag = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.35);
      ag.addColorStop(0, "rgba(80,170,255,0.55)");
      ag.addColorStop(0.5, "rgba(60,120,255,0.18)");
      ag.addColorStop(1, "rgba(60,120,255,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, size, size);

      // ocean
      const og = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, R * 0.1, cx, cy, R);
      og.addColorStop(0, "#1E5A9E");
      og.addColorStop(0.6, "#0E3A6E");
      og.addColorStop(1, "#06203E");
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // continents
      for (const con of conts) {
        ctx.beginPath();
        let started = false;
        for (const p of con.pts) {
          const pr = project(con.lat + p.dlat, con.lon + p.dlon, t);
          if (pr.z < 0) continue;
          if (!started) { ctx.moveTo(pr.x, pr.y); started = true; }
          else ctx.lineTo(pr.x, pr.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(50,120,70,0.85)";
        ctx.fill();
      }

      // night side overlay
      ctx.globalCompositeOperation = "multiply";
      const night = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
      night.addColorStop(0, "rgba(0,5,20,0.85)");
      night.addColorStop(0.45, "rgba(0,5,20,0.85)");
      night.addColorStop(0.55, "rgba(255,255,255,1)");
      night.addColorStop(1, "rgba(255,255,255,1)");
      ctx.fillStyle = night;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.globalCompositeOperation = "source-over";

      // city lights on night side
      ctx.globalCompositeOperation = "screen";
      for (const ci of cities) {
        const pr = project(ci.lat, ci.lon, t);
        if (pr.z < 0) continue;
        // night side = left
        const nightFactor = Math.max(0, -((pr.x - cx) / R));
        if (nightFactor < 0.1) continue;
        ctx.fillStyle = `rgba(255,200,120,${ci.b * nightFactor})`;
        ctx.beginPath(); ctx.arc(pr.x, pr.y, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      // aurora at poles
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        const r = R * 0.95;
        const yOff = Math.sin(t * 3 + i) * 4;
        ctx.fillStyle = `rgba(80,255,180,${0.15 + Math.sin(t * 4 + i) * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.3, cy - R * 0.85 + yOff, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.3, cy + R * 0.85 - yOff, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // clouds (simple swirl bands)
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 10; i++) {
        const lat = -0.8 + i * 0.18;
        for (let j = 0; j < 18; j++) {
          const lon = (j / 18) * Math.PI * 2 + t * 1.5 + Math.sin(lat * 3) * 0.3;
          const pr = project(lat, lon, 0);
          if (pr.z < 0) continue;
          ctx.beginPath(); ctx.arc(pr.x, pr.y, 5 + Math.sin(j + i) * 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // limb atmosphere
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const limb = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.04);
      limb.addColorStop(0, "rgba(120,200,255,0)");
      limb.addColorStop(1, "rgba(120,200,255,0.6)");
      ctx.fillStyle = limb;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // satellite orbits
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.5, R * 0.5, 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(59,164,255,0.2)";
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.8, R * 0.7, -0.2, 0, Math.PI * 2); ctx.stroke();

      // moving sats
      for (let i = 0; i < 2; i++) {
        const a = t * (1.4 + i * 0.5) + i * 2.1;
        const rx = R * (1.5 + i * 0.3);
        const ry = R * (0.5 + i * 0.2);
        const rot = i === 0 ? 0.3 : -0.2;
        const sx = cx + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot);
        const sy = cy + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot);
        ctx.fillStyle = "#FF8C1A";
        ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,140,26,0.4)";
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();
      }

      // CME trajectory (incoming from left)
      ctx.save();
      const cmeT = (t * 0.3) % 1;
      for (let i = 0; i < 12; i++) {
        const off = (i / 12 + cmeT) % 1;
        const x = -40 + off * (cx - R + 40);
        const y = cy + Math.sin(off * Math.PI * 2 + t) * 8;
        ctx.fillStyle = `rgba(255,82,82,${1 - off})`;
        ctx.beginPath(); ctx.arc(x, y, 2 + (1 - off) * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={ref} className="drop-shadow-[0_0_60px_rgba(59,164,255,0.4)]" />;
}
