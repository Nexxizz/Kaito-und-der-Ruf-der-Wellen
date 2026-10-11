/* Buckelwal - prozedural gezeichnet (Seitenansicht, Kopf zeigt nach +x) */
const Whale = (() => {
  const LEN = 420, HT = 64, N = 40;
  const COL = {
    back: [34, 62, 98], mid: [56, 94, 132], belly: [176, 205, 220], fin: [58, 96, 132], dark: [14, 30, 52],
  };

  function bodyW(s) {
    if (s < 0.27) { const k = 1 - s / 0.27; return HT * Math.sqrt(Math.max(0, 1 - k * k)); }
    return HT * Math.pow(1 - (s - 0.27) / 0.73, 1.3) + 3.2;
  }

  function spine(phase, power) {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const amp = power * LEN * 0.13 * Math.pow(s, 2.1);
      pts.push({ s, x: LEN * 0.5 - s * LEN, y: amp * Math.sin(phase - s * 4.4) + power * 6 * Math.sin(phase * 0.5) * s });
    }
    for (let i = 0; i <= N; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      pts[i].tx = dx / l; pts[i].ty = dy / l; pts[i].ux = -dy / l; pts[i].uy = dx / l; // up-Normale
      pts[i].w = bodyW(pts[i].s);
    }
    return pts;
  }

  const off = (p, k) => ({ x: p.x + p.ux * p.w * k, y: p.y + p.uy * p.w * k });
  function trace(ctx, pts, k, from = 0, to = N, move = true) {
    for (let i = from; i <= to; i++) { const q = off(pts[i], k); (move && i === from) ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
  }

  function fluke(ctx, pts, ph, pw, cols) {
    const t = pts[N], ang = Math.atan2(t.ty, t.tx), F = LEN * 0.15;
    const sq = 0.35 + 0.65 * Math.abs(Math.sin(ph - 4.4 + 1.1));
    ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(ang); ctx.scale(1, sq);
    ctx.beginPath(); ctx.moveTo(-8, 0);
    ctx.bezierCurveTo(6, -F * 0.3, 18, -F * 0.85, 46, -F);
    ctx.bezierCurveTo(36, -F * 0.5, 30, -F * 0.2, 20, 0);
    ctx.bezierCurveTo(30, F * 0.2, 36, F * 0.5, 46, F);
    ctx.bezierCurveTo(18, F * 0.85, 6, F * 0.3, -8, 0);
    const g = ctx.createLinearGradient(-8, 0, 46, 0);
    g.addColorStop(0, U.css(cols.back)); g.addColorStop(1, U.css(cols.fin));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = U.css(cols.belly, 0.25); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  function pectoral(ctx, pts, ph, cols, back) {
    const p = pts[Math.round(N * 0.33)], b = off(p, -0.55), fl = LEN * 0.27 * (back ? 0.9 : 1);
    const sw = 0.85 + 0.3 * Math.sin(ph * 0.5 + (back ? 1.5 : 0)), dx = -Math.cos(sw * 0.7) * fl, dy = Math.sin(sw * 0.7 + 0.5) * fl;
    ctx.beginPath(); ctx.moveTo(b.x - 4, b.y);
    ctx.bezierCurveTo(b.x - fl * 0.2, b.y + fl * 0.35, b.x + dx * 0.6, b.y + dy * 0.85, b.x + dx, b.y + dy);
    ctx.bezierCurveTo(b.x + dx * 0.55, b.y + dy * 0.45, b.x - fl * 0.25, b.y + fl * 0.02, b.x + 20, b.y - 4);
    ctx.closePath();
    ctx.fillStyle = U.css(back ? cols.dark : cols.fin); ctx.fill();
    if (!back) { ctx.strokeStyle = U.css(cols.belly, 0.3); ctx.lineWidth = 2; ctx.stroke(); }
  }

  /* o: {x,y,angle,scale,phase,power,fog,fogCol,warm,alpha} */
  function draw(ctx, o) {
    const fog = o.fog || 0, fc = o.fogCol || [4, 20, 52];
    const cols = {}; for (const k in COL) cols[k] = U.mixc(COL[k], fc, fog);
    const pts = spine(o.phase, o.power);
    ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.translate(o.x, o.y); ctx.rotate(o.angle); ctx.scale(o.scale, o.scale);

    pectoral(ctx, pts, o.phase + 1.2, cols, true);
    fluke(ctx, pts, o.phase, o.power, cols);

    // Koerper
    ctx.beginPath(); trace(ctx, pts, 0.9); trace(ctx, pts.slice().reverse().map(p => p), -1.0, 0, N, false);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -HT, 0, HT * 1.05);
    g.addColorStop(0, U.css(cols.back)); g.addColorStop(0.45, U.css(cols.mid)); g.addColorStop(0.62, U.css(U.mixc(cols.mid, cols.belly, 0.45)));
    g.addColorStop(1, U.css(cols.belly));
    ctx.fillStyle = g; ctx.fill();

    ctx.save(); ctx.clip();
    // Bauchfalten
    ctx.strokeStyle = U.css(cols.dark, 0.16); ctx.lineWidth = 2.2;
    for (let j = 0; j < 7; j++) { ctx.beginPath(); trace(ctx, pts, -(0.3 + j * 0.095), 2, Math.round(N * 0.56)); ctx.stroke(); }
    // Rueckenlicht (Sonne von oben)
    const rim = o.warm ? U.mixc([210, 240, 255], [255, 170, 110], o.warm) : [200, 235, 255];
    ctx.strokeStyle = U.css(rim, 0.28 * (1 - fog * 0.7) + (o.warm || 0) * 0.35); ctx.lineWidth = 9;
    ctx.beginPath(); trace(ctx, pts, 0.97, 1, Math.round(N * 0.85)); ctx.stroke();
    // Wuelste am Kopf
    ctx.fillStyle = U.css(cols.dark, 0.35);
    for (let i = 0; i < 6; i++) { const q = off(pts[3 + i], 0.62 + (i % 2) * 0.1); ctx.beginPath(); ctx.arc(q.x, q.y, 3.4, 0, 7); ctx.fill(); }
    ctx.restore();

    // Rueckenfinne
    const d = pts[Math.round(N * 0.7)], dt = off(d, 0.9);
    ctx.beginPath(); ctx.moveTo(dt.x + 20, dt.y + 2);
    ctx.quadraticCurveTo(dt.x + 4, dt.y - 22, dt.x - 8, dt.y - 26); ctx.quadraticCurveTo(dt.x - 12, dt.y - 8, dt.x - 30, dt.y + 2);
    ctx.fillStyle = U.css(cols.back); ctx.fill();

    // Maul + Auge
    ctx.strokeStyle = U.css(cols.dark, 0.55); ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); const m0 = off(pts[1], -0.3); ctx.moveTo(m0.x, m0.y);
    for (let i = 2; i <= 11; i++) { const q = off(pts[i], -0.3 + 0.2 * Math.pow((i - 2) / 9, 2) * -1 + 0.25 * Math.pow((i - 2) / 9, 3)); ctx.lineTo(q.x, q.y); }
    ctx.stroke();
    const e = off(pts[8], -0.12);
    ctx.fillStyle = 'rgba(8,14,26,0.95)'; ctx.beginPath(); ctx.arc(e.x, e.y, 7.4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(e.x + 2.4, e.y - 2.6, 2.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(e.x - 2, e.y + 2.4, 1.1, 0, 7); ctx.fill();

    pectoral(ctx, pts, o.phase, cols, false);
    ctx.restore();
  }

  /* Blasloch-Position (Welt) fuer die Fontaene */
  function blowhole(w) {
    const lx = (LEN * 0.5 - LEN * 0.3) * w.scale, ly = -HT * 0.88 * w.scale, c = Math.cos(w.angle), s = Math.sin(w.angle);
    return { x: w.x + c * lx - s * ly, y: w.y + s * lx + c * ly };
  }
  const tail = w => ({ x: w.x - Math.cos(w.angle) * LEN * 0.45 * w.scale, y: w.y - Math.sin(w.angle) * LEN * 0.45 * w.scale });

  return { draw, blowhole, tail, LEN };
})();
