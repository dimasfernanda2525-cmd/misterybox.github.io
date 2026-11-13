import { useEffect, useRef } from 'react';

interface ExplosionCanvasProps {
  burstKey: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'streamer';
  alpha: number;
  decay: number;
  gravity: number;
}

const FESTIVE_COLORS = [
  '#E11D48', // Crimson Rose
  '#F59E0B', // Marigold Gold
  '#FB7185', // Coral Pink
  '#10B981', // Emerald
  '#0284C7', // Sky Blue
  '#FBBF24', // Bright Gold
  '#FFFFFF', // Crisp Highlight
];

export function ExplosionCanvas({ burstKey }: ExplosionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];

    const spawnBurst = (originX: number, originY: number, count: number, power: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.32 + Math.random() * 0.85) * power;
        const shapeRoll = Math.random();
        const shape: Particle['shape'] =
          shapeRoll < 0.55 ? 'rect' : shapeRoll < 0.82 ? 'streamer' : 'circle';

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - power * 0.28,
          size: 5 + Math.random() * 8,
          color: FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.24,
          shape,
          alpha: 1,
          decay: 0.005 + Math.random() * 0.005,
          gravity: 0.22 + Math.random() * 0.12,
        });
      }
    };

    // Initial triple-wave explosion right on load
    spawnBurst(width * 0.5, height * 0.36, 95, Math.min(width, height) * 0.025 + 10);
    const wave2 = window.setTimeout(() => {
      spawnBurst(width * 0.22, height * 0.28, 55, 13);
      spawnBurst(width * 0.78, height * 0.28, 55, 13);
    }, 240);
    const wave3 = window.setTimeout(() => {
      spawnBurst(width * 0.5, height * 0.22, 60, 14);
    }, 520);

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles.slice(0, 60)) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x + p.vx * 14, p.y + p.vy * 14, p.size, p.size * 0.6);
        ctx.restore();
      }
      return () => {
        window.clearTimeout(wave2);
        window.clearTimeout(wave3);
        window.removeEventListener('resize', resize);
      };
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 60) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'streamer') {
          ctx.fillRect(-p.size * 0.9, -p.size * 0.22, p.size * 1.8, p.size * 0.44);
        } else {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.35, p.size, p.size * 0.7);
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrame = window.requestAnimationFrame(render);
      }
    };

    animFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animFrame);
      window.clearTimeout(wave2);
      window.clearTimeout(wave3);
      window.removeEventListener('resize', resize);
    };
  }, [burstKey]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="explosion-canvas"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
