/**
 * World Bank Atlas–style ring + overflowing particle dots.
 * https://data360.worldbank.org/en/atlas/
 */

const RING_R = 72;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export function renderAtlasRing({ headline, context, fill = 0.5, accent = "#9D50BB", id, countValue }) {
  const ringId = id || `atlas-ring-${Math.random().toString(36).slice(2, 9)}`;
  const countAttr = countValue != null ? ` data-count="${countValue}"` : "";
  return `
    <div
      class="atlas-ring"
      data-atlas-ring
      data-fill="${fill}"
      data-accent="${accent}"
      id="${ringId}"
      aria-hidden="false"
      role="img"
      aria-label="${headline}. ${context}"
    >
      <canvas class="atlas-ring__canvas" aria-hidden="true"></canvas>
      <svg class="atlas-ring__svg" viewBox="0 0 200 200" aria-hidden="true">
        <circle class="atlas-ring__track" cx="100" cy="100" r="${RING_R}" fill="none" stroke-width="22" />
        <circle
          class="atlas-ring__arc"
          cx="100"
          cy="100"
          r="${RING_R}"
          fill="none"
          stroke="${accent}"
          stroke-width="22"
          stroke-linecap="round"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="${CIRCUMFERENCE}"
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div class="atlas-ring__center">
        <span class="atlas-ring__headline" data-atlas-ring-headline${countAttr}>${headline}</span>
        <p class="atlas-ring__context">${context}</p>
      </div>
    </div>`;
}

function parseAccent(rgb) {
  if (rgb.startsWith("#") && rgb.length >= 7) {
    return {
      r: parseInt(rgb.slice(1, 3), 16),
      g: parseInt(rgb.slice(3, 5), 16),
      b: parseInt(rgb.slice(5, 7), 16),
    };
  }
  return { r: 157, g: 80, b: 187 };
}

function initRingCanvas(canvas, accent, reducedMotion) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = canvas.parentElement?.offsetWidth || 320;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const { r, g, b } = parseAccent(accent);
  const particles = [];
  const count = reducedMotion ? 80 : 160;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 88 + Math.random() * 42;
    const onRight = Math.cos(angle) > 0;
    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      size: 1.2 + Math.random() * 2.2,
      angle,
      drift: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.006,
      color: onRight ? `rgba(${r},${g},${b},${0.35 + Math.random() * 0.5})` : `rgba(180,188,196,${0.25 + Math.random() * 0.45})`,
    });
  }

  let frameId = null;
  const draw = (t = 0) => {
    ctx.clearRect(0, 0, size, size);
    for (const p of particles) {
      if (!reducedMotion) p.drift += p.speed;
      const ox = reducedMotion ? 0 : Math.cos(p.drift) * 2.5;
      const oy = reducedMotion ? 0 : Math.sin(p.drift) * 2.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + ox - p.size / 2, p.y + oy - p.size / 2, p.size, p.size);
    }
    if (!reducedMotion) frameId = requestAnimationFrame(draw);
  };

  draw();
  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}

export function mountAtlasRings(root) {
  if (!root) return () => {};

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];

  root.querySelectorAll("[data-atlas-ring]").forEach((el) => {
    const fill = Math.min(1, Math.max(0, parseFloat(el.dataset.fill) || 0.5));
    const accent = el.dataset.accent || "#9D50BB";
    const arc = el.querySelector(".atlas-ring__arc");
    const canvas = el.querySelector(".atlas-ring__canvas");
    const targetOffset = CIRCUMFERENCE * (1 - fill);

    if (canvas) {
      const stop = initRingCanvas(canvas, accent, reducedMotion);
      if (stop) cleanups.push(stop);
    }

    if (arc && typeof gsap !== "undefined" && !reducedMotion) {
      gsap.set(arc, { strokeDashoffset: CIRCUMFERENCE });
      gsap.to(arc, {
        strokeDashoffset: targetOffset,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
        },
      });
    } else if (arc) {
      arc.style.strokeDashoffset = String(targetOffset);
    }
  });

  return () => cleanups.forEach((fn) => fn());
}

export function destroyAtlasRings() {
  /* per-ring cleanup returned from mountAtlasRings */
}
