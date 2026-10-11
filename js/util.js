/* Gemeinsame Helfer: Mathe, Farben, Zufall, Kamera */
const W = 1920, H = 1080;
const Cam = { x: 0, y: 0 };

const U = {
  clamp: (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  smooth(a, b, x) { const t = U.clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); },
  easeOutCubic: t => 1 - Math.pow(1 - U.clamp(t), 3),
  /* deterministischer Pseudo-Zufall aus Ganzzahl/Float (0..1) */
  h(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); },
  mod: (a, b) => ((a % b) + b) % b,
  noise(x) { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return U.lerp(U.h(i), U.h(i + 1), s); },
  mixc: (a, b, t) => [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)],
  css: (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`,
  smax(a, b, k) { return k * Math.log(Math.exp(a / k) + Math.exp(b / k)); },
};

/* Weltkoordinaten -> Bildschirm (p = Parallaxe-Faktor der Ebene) */
const sx = (X, p = 1) => W / 2 + (X - Cam.x) * p;
const sy = (Y, p = 1) => H / 2 + (Y - Cam.y) * p;

/* weiches Leucht-Sprite fuer additive Partikel */
const GLOW = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c;
})();

/* Leucht-Sprite in der aktuellen fillStyle-Farbe (gecacht); ohne Farbstring: weiss */
const GLOW_CACHE = {};
function glow(ctx, x, y, r, alpha) {
  const key = typeof ctx.fillStyle === 'string' ? ctx.fillStyle : '#fff';
  let spr = GLOW_CACHE[key];
  if (!spr) {
    spr = GLOW_CACHE[key] = document.createElement('canvas'); spr.width = spr.height = 64;
    const g = spr.getContext('2d'); g.drawImage(GLOW, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = key; g.fillRect(0, 0, 64, 64);
  }
  ctx.globalAlpha = U.clamp(alpha, 0, 1); ctx.drawImage(spr, x - r, y - r, r * 2, r * 2);
}
