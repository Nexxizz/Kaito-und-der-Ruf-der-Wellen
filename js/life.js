/* Lebendige Umgebung: Meeresboden, Schwebeteilchen, Fischschwarm, Stroemung, Funkeln */
const Life = (() => {
  const LAYERS = {
    far:   { p: 0.5,  base: 2850, amp: 110, col: [6, 30, 66],  kelp: 0,  seed: 1 },
    mid:   { p: 0.8,  base: 2990, amp: 80,  col: [3, 17, 42],  kelp: 1,  seed: 2 },
    front: { p: 1.35, base: 3040, amp: 60,  col: [1, 7, 20],   kelp: 2,  seed: 3 },
  };

  function seabed(ctx, t, name) {
    const L = LAYERS[name];
    if (sy(L.base - L.amp - 600, L.p) > H + 20) return;
    ctx.fillStyle = U.css(L.col);
    ctx.beginPath(); ctx.moveTo(0, H + 40);
    for (let x = 0; x <= W + 40; x += 40) {
      const Xw = Cam.x + (x - W / 2) / L.p;
      ctx.lineTo(x, sy(L.base - L.amp * (0.25 + 0.75 * U.noise(Xw * 0.0028 + L.seed * 9)) , L.p));
    }
    ctx.lineTo(W, H + 40); ctx.fill();
    if (!L.kelp) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tile = L.kelp === 2 ? 260 : 150;
    for (let k = 0; k < 40; k++) {
      const Xw = Math.floor(Cam.x / tile) * tile + (k - 20) * tile + U.h(k + L.seed * 7) * tile * 0.8;
      const x0 = sx(Xw, L.p); if (x0 < -80 || x0 > W + 80) continue;
      if (L.kelp === 2 && x0 > 360 && x0 < W - 360) continue;
      const hgt = (L.kelp === 2 ? 520 : 300) * (0.6 + 0.6 * U.h(k * 3.3 + L.seed)) * L.p;
      const yb = sy(L.base - L.amp * (0.25 + 0.75 * U.noise(Xw * 0.0028 + L.seed * 9)), L.p) + 20;
      for (let b = 0; b < 3; b++) {
        ctx.strokeStyle = U.css(L.col, 0.95); ctx.lineWidth = (14 - b * 3) * L.p;
        ctx.beginPath(); ctx.moveTo(x0 + b * 14, yb);
        for (let s = 1; s <= 9; s++) {
          const f = s / 9; ctx.lineTo(x0 + b * 14 + Math.sin(t * 0.8 + k + b + f * 2.4) * 30 * f * L.p, yb - f * hgt * (1 - b * 0.18));
        }
        ctx.stroke();
      }
    }
    if (L.kelp === 1) { // biolumineszente Korallenpunkte
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 24; k++) {
        const Xw = Math.floor(Cam.x / 170) * 170 + (k - 12) * 170 + U.h(k) * 100, x0 = sx(Xw, L.p);
        const yb = sy(L.base - L.amp * (0.25 + 0.75 * U.noise(Xw * 0.0028 + L.seed * 9)), L.p) - 8;
        ctx.fillStyle = k % 2 ? 'rgb(90,255,230)' : 'rgb(255,120,200)';
        glow(ctx, x0, yb, 28, 0.35 + 0.3 * Math.sin(t * 1.4 + k * 2));
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  }

  /* Meeresschnee: Schichten mit unterschiedlicher Parallaxe */
  function dust(ctx, t, p, n, size, alpha, seed) {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#d8f6ff';
    const dir = Math.sin(t * 0.2) * 12;
    for (let i = 0; i < n; i++) {
      const r1 = U.h(i * 1.3 + seed), r2 = U.h(i * 2.7 + seed + 4), r3 = U.h(i * 0.7 + seed + 9);
      const x = U.mod(r1 * (W + 300) - Cam.x * p + t * (10 + r3 * 14 + dir), W + 300) - 150;
      const y = U.mod(r2 * (H + 300) - Cam.y * p + Math.sin(t * 0.6 + i) * 18 - t * 5 * r3, H + 300) - 150;
      glow(ctx, x, y, size * (0.5 + r3), alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + r3) + i))));
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  /* Leuchtfische (layer 0: hinter Kaito, 1: davor) */
  function fish(ctx, t, ws, layer) {
    if (t < 8.3 || t > 15.4) return;
    const cx0 = Path.raw(12).x - (t - 12) * 400, cy0 = Path.raw(12).y;
    ctx.save();
    for (let i = 0; i < 90; i++) {
      if ((i % 4 === 0 ? 1 : 0) !== layer) continue;
      const a = U.h(i * 1.1) * 6.283, r = Math.sqrt(U.h(i * 2.3));
      let X = cx0 + Math.cos(a) * r * 540 + 70 * Math.sin(t * 1.3 + i), Y = cy0 + Math.sin(a) * r * 230 + 38 * Math.sin(t * 1.7 + i * 2);
      const dx = X - ws.x, dy = Y - ws.y, d = Math.hypot(dx, dy);
      if (d < 230) { const k = (230 - d) / d * 0.7; X += dx * k; Y += dy * k; }
      const x = sx(X), y = sy(Y); if (x < -60 || x > W + 60) continue;
      const sc = 0.8 + U.h(i) * 0.7, gold = i % 3 === 0, wig = Math.sin(t * 15 + i) ;
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gold ? '#ffb040' : '#40ffe0'; glow(ctx, x, y, 26 * sc, 0.5);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.95;
      ctx.translate(x, y); ctx.scale(-sc, sc); ctx.rotate(wig * 0.06);
      ctx.fillStyle = gold ? '#ffe2a0' : '#b8fff0';
      ctx.beginPath(); ctx.ellipse(0, 0, 11, 4.4, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-18, -5 + wig * 3); ctx.lineTo(-18, 5 + wig * 3); ctx.fill();
      ctx.fillStyle = '#0a2a40'; ctx.beginPath(); ctx.arc(6, -0.8, 1.2, 0, 7); ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ruhige Stroemungslinien (Szene 4, wird am Ende zum Abblenden betont) */
  function streams(ctx, t, amt) {
    if (amt <= 0.01) return;
    ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const p = 0.5 + (i % 4) * 0.2, yb = ((i * 83) % 900) + 60 + Math.sin(t * 0.3 + i) * 20, ph = t * (0.5 + p * 0.5) + i;
      ctx.strokeStyle = `rgba(190,245,255,${0.11 * amt * (0.6 + 0.4 * Math.sin(t * 0.8 + i))})`; ctx.beginPath();
      for (let x = -40; x <= W + 40; x += 30) {
        const xx = x - U.mod(Cam.x * p * 0.5 + t * 30 * p, 30), yy = yb + 34 * Math.sin(xx * 0.004 + ph) + 14 * Math.sin(xx * 0.011 - ph * 1.4);
        x === -40 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
  }

  /* bunte Wunder-Lichter (Szene 4) */
  function sparkles(ctx, t, amt) {
    if (amt <= 0.01) return;
    ctx.globalCompositeOperation = 'lighter';
    const pal = ['rgb(100,255,235)', 'rgb(255,140,210)', 'rgb(255,220,130)', 'rgb(150,190,255)'];
    for (let i = 0; i < 70; i++) {
      const p = 0.6 + U.h(i) * 0.7;
      const x = U.mod(U.h(i * 3.7) * 2300 - Cam.x * p + Math.sin(t * 0.5 + i) * 40 + t * 12, 2300) - 190;
      const y = U.mod(U.h(i * 5.1) * 1300 - Cam.y * p - t * (14 + U.h(i + 2) * 22), 1300) - 110;
      const tw = Math.pow(0.5 + 0.5 * Math.sin(t * (1 + U.h(i + 7) * 2) + i * 5), 3);
      ctx.fillStyle = pal[i % 4]; glow(ctx, x, y, 8 + 14 * U.h(i + 1) * p, amt * tw * 0.9);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  return { seabed, dust, fish, streams, sparkles };
})();
