/* Hintergrund: Himmel/Sonnenuntergang, Wasserkoerper, Oberflaeche, God Rays */
const BG = (() => {
  const WATER = [[0, [70, 222, 214]], [250, [36, 176, 204]], [700, [16, 120, 180]], [1300, [10, 78, 142]], [2000, [6, 46, 102]], [2700, [3, 20, 56]]];
  const wave = (X, t) => 8 * Math.sin(X * 0.008 + t * 1.3) + 5 * Math.sin(X * 0.019 - t * 1.9) + 3 * Math.sin(X * 0.041 + t * 2.7);
  let events = []; // Aufprall-Ringwellen {x,t0,amp}
  function setEvents(e) { events = e; }

  function surfY(X, t) {
    let y = wave(X, t);
    for (const e of events) {
      const a = t - e.t0; if (a < 0 || a > 6) continue;
      const dx = X - e.x;
      y += e.amp * Math.exp(-a * 0.8) * Math.exp(-Math.abs(dx) / (260 + a * 300)) * Math.cos(Math.abs(dx) * 0.028 - a * 7);
    }
    return y;
  }

  function waterColor(d, warm) {
    let i = 0; while (i < WATER.length - 2 && d > WATER[i + 1][0]) i++;
    const a = WATER[i], b = WATER[i + 1], c = U.mixc(a[1], b[1], U.clamp((d - a[0]) / (b[0] - a[0])));
    return U.mixc(c, [255, 150, 120], warm * 0.5 * Math.exp(-d / 450));
  }

  function sky(ctx, t) {
    const y0 = sy(0); if (y0 < 0) return;
    const g = ctx.createLinearGradient(0, sy(-1600), 0, sy(-80));
    [[0, [27, 23, 69]], [0.4, [91, 58, 142]], [0.72, [200, 82, 127]], [0.9, [255, 143, 95]], [1, [255, 201, 140]]]
      .forEach(([o, c]) => g.addColorStop(o, U.css(c)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.min(H, y0 + 4));

    // Sonne + Glut
    const sunX = 1380 - Cam.x * 0.04, sunY = sy(-150, 0.92);
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(sunX, sunY, 40, sunX, sunY, 780);
    rg.addColorStop(0, 'rgba(255,170,90,0.6)'); rg.addColorStop(0.4, 'rgba(255,110,110,0.18)'); rg.addColorStop(1, 'rgba(255,80,120,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 125);
    sg.addColorStop(0, '#fff6d8'); sg.addColorStop(0.8, '#ffd08a'); sg.addColorStop(1, 'rgba(255,190,120,0.9)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 118, 0, 7); ctx.fill();

    // Wolkenbaender (3 Parallax-Ebenen)
    for (let i = 0; i < 9; i++) {
      const p = 0.12 + (i % 3) * 0.1, Y = -520 + (i % 3) * 120 + U.h(i) * 90;
      const X = U.mod(U.h(i + 5) * 3600 + t * (6 + i * 1.7) - Cam.x * p, 3600) - 800, yy = sy(Y, 0.9 + p * 0.3);
      const w = 340 + U.h(i + 9) * 260;
      for (let k = 0; k < 3; k++) {
        const lit = k === 0 ? [255, 190, 150] : k === 1 ? [226, 112, 140] : [124, 66, 130];
        ctx.fillStyle = U.css(lit, 0.45 + 0.1 * (i % 3));
        ctx.beginPath(); ctx.ellipse(X + k * 20, yy + k * 11, w * (1 - k * 0.12), 20 - k * 3.5 + (i % 3) * 3, 0, 0, 7); ctx.fill();
      }
    }
    // ferne Insel
    ctx.fillStyle = 'rgba(86,42,100,0.85)'; const hy = sy(-62), ix = 380 - Cam.x * 0.08;
    ctx.beginPath(); ctx.moveTo(ix - 200, hy); ctx.quadraticCurveTo(ix - 60, hy - 52, ix + 20, hy - 30); ctx.quadraticCurveTo(ix + 90, hy - 62, ix + 220, hy); ctx.fill();

    // Horizont-Meer + Glitzerpfad
    const hg = ctx.createLinearGradient(0, sy(-70), 0, sy(4));
    hg.addColorStop(0, '#ffb98a'); hg.addColorStop(0.5, '#d86a7c'); hg.addColorStop(1, '#6a3b7c');
    ctx.fillStyle = hg; ctx.fillRect(0, sy(-70), W, sy(4) - sy(-70));
    ctx.fillStyle = 'rgba(255,236,190,0.9)';
    for (let i = 0; i < 70; i++) {
      const yy = sy(-70 + (i / 70) * 68), spread = 12 + (i / 70) * 130;
      const xx = sunX + (U.h(i * 3.1) - 0.5) * spread * 2 * (0.6 + 0.4 * Math.sin(t * 1.2 + i));
      ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 2 + i * 1.7));
      ctx.fillRect(xx, yy, 8 + (i / 70) * 38, 2);
    }
    ctx.globalAlpha = 1;
  }

  function surfacePath(ctx, t, bottomY) {
    ctx.beginPath(); ctx.moveTo(0, bottomY);
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, sy(surfY(Cam.x + x - W / 2, t)));
    ctx.lineTo(W, bottomY);
  }

  function water(ctx, t, warm) {
    const y0 = sy(0), g = ctx.createLinearGradient(0, y0, 0, sy(2800));
    for (let d = 0; d <= 2800; d += 280) g.addColorStop(d / 2800, U.css(waterColor(d, warm)));
    ctx.fillStyle = g; surfacePath(ctx, t, H + 10); ctx.fill();

    // helles Wasserdach (Oberflaeche von unten) + Kaustik-Linien
    if (y0 > -300) {
      ctx.globalCompositeOperation = 'lighter';
      const b = ctx.createLinearGradient(0, y0, 0, y0 + 300);
      b.addColorStop(0, `rgba(${warm > 0.2 ? '255,214,170' : '210,255,250'},0.55)`); b.addColorStop(1, 'rgba(120,230,240,0)');
      ctx.fillStyle = b; surfacePath(ctx, t, y0 + 300); ctx.fill();
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = `rgba(220,255,250,${0.16 - i * 0.012})`; ctx.beginPath();
        for (let x = 0; x <= W; x += 24) {
          const yy = y0 + 18 + i * 22 + 9 * Math.sin(x * 0.011 + t * 1.1 + i * 1.3) + 6 * Math.sin(x * 0.027 - t * 1.6 + i);
          x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /* Lichtstrahlen von der Oberflaeche - intensity steuert Helligkeit */
  function rays(ctx, t, intensity, warm) {
    const y0 = sy(0, 1), len = 3400;
    const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
    const col = warm > 0.2 ? '255,225,190' : '205,255,248';
    [[0, 0.4], [0.24, 0.3], [0.5, 0.22], [0.72, 0.14], [1, 0]].forEach(([o, a]) => g.addColorStop(o, `rgba(${col},${a})`));
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
    for (let i = 0; i < 12; i++) {
      const X = U.mod(i * 330 + 60 * Math.sin(t * 0.35 + i * 1.9) - Cam.x * 0.62, 3960) - 900;
      const w0 = 26 + (i % 4) * 24, lean = 0.3 + 0.05 * Math.sin(t * 0.3 + i), w1 = w0 + 320 + (i % 3) * 90;
      ctx.globalAlpha = U.clamp(intensity * (0.55 + 0.45 * Math.sin(t * 0.7 + i * 1.7)), 0, 1.2);
      ctx.beginPath(); ctx.moveTo(X - w0, y0); ctx.lineTo(X + w0, y0);
      ctx.lineTo(X + lean * len + w1, y0 + len); ctx.lineTo(X + lean * len - w1, y0 + len); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  /* Wasseroberflaeche im Vordergrund: leichter Schleier, Kamm-Highlight, Glitzer */
  function surfaceFront(ctx, t, warm) {
    const y0 = sy(0); if (y0 > H + 40 || y0 < -60) return;
    const g = ctx.createLinearGradient(0, y0, 0, y0 + 420);
    g.addColorStop(0, U.css(U.mixc([60, 210, 210], [255, 160, 130], warm * 0.7), 0.2)); g.addColorStop(1, 'rgba(40,160,190,0)');
    ctx.fillStyle = g; surfacePath(ctx, t, y0 + 420); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = U.css(U.mixc([230, 255, 255], [255, 200, 150], warm), 0.7);
    ctx.beginPath(); for (let x = 0; x <= W; x += 12) { const yy = sy(surfY(Cam.x + x - W / 2, t)); x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath();
    for (let x = 0; x <= W; x += 12) { const yy = sy(surfY(Cam.x + x - W / 2 + 40, t + 0.4)) + 12; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
    // Glitzersterne
    const gc = warm > 0.2 ? [255, 235, 200] : [255, 255, 255];
    for (let i = 0; i < 110; i++) {
      const X = U.mod(U.h(i * 1.7) * 2600 - Cam.x * 0.98, 2600) - 340, tw = Math.pow(Math.max(0, Math.sin(t * (1.5 + U.h(i) * 2.5) + i * 4.1)), 6);
      if (tw < 0.05) continue;
      const yy = sy(surfY(Cam.x + X - W / 2, t)) - 2, r = 4 + 10 * tw * (0.5 + U.h(i + 3));
      ctx.strokeStyle = U.css(gc, tw); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X - r, yy); ctx.lineTo(X + r, yy); ctx.moveTo(X, yy - r * 0.8); ctx.lineTo(X, yy + r * 0.8); ctx.stroke();
      glow(ctx, X, yy, r * 2.2, tw * 0.5);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  return { sky, water, rays, surfaceFront, surfY, setEvents, waterColor };
})();
