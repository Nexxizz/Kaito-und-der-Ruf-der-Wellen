/* Himmel: Sonnenuntergang -> Daemmerung -> Sternennacht (BG.night 0..1 steuert den Uebergang) */
BG.sky = function (ctx, t) {
  const y0 = sy(0); if (y0 < 0) return;
  const n = BG.night || 0, sink = U.smooth(38, 50, t);
  const SUN = [[27, 23, 69], [91, 58, 142], [200, 82, 127], [255, 143, 95], [255, 201, 140]];
  const NIGHT = [[3, 6, 24], [8, 14, 46], [20, 30, 84], [48, 58, 118], [104, 98, 150]];
  const g = ctx.createLinearGradient(0, sy(-1600), 0, sy(-80));
  SUN.forEach((c, i) => g.addColorStop([0, 0.4, 0.72, 0.9, 1][i], U.css(U.mixc(c, NIGHT[i], n))));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.min(H, y0 + 4));

  // Sterne + Mond
  if (n > 0.02) {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 190; i++) {
      const x = U.mod(U.h(i * 1.9) * 2300 - Cam.x * 0.03, 2300) - 190, y = sy(-1500 + U.h(i * 4.3) * 1380, 0.35);
      if (y > sy(-70)) continue;
      const tw = 0.45 + 0.55 * Math.sin(t * (0.8 + U.h(i) * 2) + i * 3.1), r = 1.6 + U.h(i + 2) * 3.4;
      glow(ctx, x, y, r * 2.4, n * tw * (0.5 + 0.5 * (y < sy(-600) ? 1 : 0.5)));
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const mx = 1230 - Cam.x * 0.03, my = sy(-470, 0.9) + (1 - n) * 220;
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#9fb8ff'; glow(ctx, mx, my, 330, 0.32 * n);
    ctx.globalCompositeOperation = 'source-over';
    const mg = ctx.createRadialGradient(mx - 14, my - 14, 4, mx, my, 62);
    mg.addColorStop(0, '#fffdf2'); mg.addColorStop(1, '#d8e0f4');
    ctx.globalAlpha = n; ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 60, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(150,165,200,0.35)';
    [[-18, -10, 11], [14, 16, 8], [18, -22, 6], [-6, 24, 7]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
  }

  // Sonne + Glut (sinkt hinter den Horizont)
  const sunX = 1380 - Cam.x * 0.04, sunY = sy(-150, 0.92) + sink * 330, sa = 1 - n;
  if (sa > 0.01) {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = sa;
    const rg = ctx.createRadialGradient(sunX, sunY, 40, sunX, sunY, 780);
    rg.addColorStop(0, 'rgba(255,170,90,0.6)'); rg.addColorStop(0.4, 'rgba(255,110,110,0.18)'); rg.addColorStop(1, 'rgba(255,80,120,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 125);
    sg.addColorStop(0, '#fff6d8'); sg.addColorStop(0.8, '#ffd08a'); sg.addColorStop(1, 'rgba(255,190,120,0.9)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 118, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }

  // Wolkenbaender (3 Parallax-Ebenen)
  for (let i = 0; i < 9; i++) {
    const p = 0.12 + (i % 3) * 0.1, Y = -520 + (i % 3) * 120 + U.h(i) * 90;
    const X = U.mod(U.h(i + 5) * 3600 + t * (6 + i * 1.7) - Cam.x * p, 3600) - 800, yy = sy(Y, 0.9 + p * 0.3);
    const w = 340 + U.h(i + 9) * 260;
    for (let k = 0; k < 3; k++) {
      const lit = U.mixc(k === 0 ? [255, 190, 150] : k === 1 ? [226, 112, 140] : [124, 66, 130], k === 0 ? [96, 110, 170] : k === 1 ? [48, 56, 112] : [26, 30, 70], n);
      ctx.fillStyle = U.css(lit, (0.45 + 0.1 * (i % 3)) * (1 - 0.35 * n));
      ctx.beginPath(); ctx.ellipse(X + k * 20, yy + k * 11, w * (1 - k * 0.12), 20 - k * 3.5 + (i % 3) * 3, 0, 0, 7); ctx.fill();
    }
  }
  // ferne Insel
  ctx.fillStyle = U.css(U.mixc([86, 42, 100], [10, 16, 40], n), 0.9); const hy = sy(-62), ix = 380 - Cam.x * 0.08;
  ctx.beginPath(); ctx.moveTo(ix - 200, hy); ctx.quadraticCurveTo(ix - 60, hy - 52, ix + 20, hy - 30); ctx.quadraticCurveTo(ix + 90, hy - 62, ix + 220, hy); ctx.fill();

  // Horizont-Meer + Glitzerpfad
  const hg = ctx.createLinearGradient(0, sy(-70), 0, sy(4));
  hg.addColorStop(0, U.css(U.mixc([255, 185, 138], [60, 74, 134], n))); hg.addColorStop(0.5, U.css(U.mixc([216, 106, 124], [22, 34, 82], n)));
  hg.addColorStop(1, U.css(U.mixc([106, 59, 124], [8, 14, 44], n)));
  ctx.fillStyle = hg; ctx.fillRect(0, sy(-70), W, sy(4) - sy(-70));
  const gx = U.lerp(sunX, 1230 - Cam.x * 0.03, n), ga = 1 - sink * (1 - n) * 0.9;
  ctx.fillStyle = n > 0.5 ? 'rgba(200,215,255,0.9)' : 'rgba(255,236,190,0.9)';
  for (let i = 0; i < 70; i++) {
    const yy = sy(-70 + (i / 70) * 68), spread = 12 + (i / 70) * 130;
    const xx = gx + (U.h(i * 3.1) - 0.5) * spread * 2 * (0.6 + 0.4 * Math.sin(t * 1.2 + i));
    ctx.globalAlpha = (0.25 + 0.5 * Math.abs(Math.sin(t * 2 + i * 1.7))) * (n > 0.5 ? n * 0.7 : ga * (1 - n));
    ctx.fillRect(xx, yy, 8 + (i / 70) * 38, 2);
  }
  ctx.globalAlpha = 1;
};
