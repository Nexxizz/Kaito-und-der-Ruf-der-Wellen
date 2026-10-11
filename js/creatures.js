/* Neue Wunder (Szenen 5-7): Quallen, Schildkroeten, Mantarochen, ferne Wale, Walgesang */
const Creatures = (() => {
  const sm = U.smooth;
  const JPAL = [[255, 120, 200], [120, 230, 255], [190, 150, 255], [255, 200, 120]];

  function jelly(ctx, x, y, s, t, i, a) {
    const c = JPAL[i % 4], pulse = Math.sin(t * 2.1 + i * 1.7), bw = 46 * s * (1 + 0.11 * pulse), bh = 40 * s * (1 - 0.14 * pulse);
    y -= pulse * 9 * s;
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = U.css(c); glow(ctx, x, y, bw * 3.4, 0.28 * a);
    ctx.lineCap = 'round';
    for (let k = -3; k <= 3; k++) {
      ctx.strokeStyle = U.css(c, 0.45 * a); ctx.lineWidth = (k % 2 ? 2 : 3.2) * s; ctx.beginPath();
      const L = (95 + 30 * Math.abs(k % 3)) * s * (1 + 0.1 * pulse);
      ctx.moveTo(x + k * bw / 3.3, y + 2);
      for (let q = 1; q <= 8; q++) { const f = q / 8; ctx.lineTo(x + k * bw / 3.3 + Math.sin(t * 2 + i + f * 4.5 + k) * 11 * s * f, y + 2 + f * L); }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(x, y - bh * 0.5, 2, x, y - bh * 0.3, bw * 1.1);
    g.addColorStop(0, U.css([255, 255, 255], 0.75 * a)); g.addColorStop(0.5, U.css(c, 0.5 * a)); g.addColorStop(1, U.css(c, 0.16 * a));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - bw, y);
    ctx.bezierCurveTo(x - bw, y - bh * 1.6, x + bw, y - bh * 1.6, x + bw, y);
    for (let k = 4; k >= -4; k--) ctx.quadraticCurveTo(x + k * bw / 4.4 + bw / 8.8, y + bh * 0.28, x + (k - 1) * bw / 4.4 + bw / 8.8 * 0, y + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = U.css(c, 0.5 * a); ctx.lineWidth = 1.6; ctx.stroke();
  }

  function jellies(ctx, t) {
    const a = sm(30, 33, t) * (1 - sm(47, 50, t)); if (a < 0.01) return;
    for (let i = 0; i < 10; i++) {
      const p = 0.75 + U.h(i * 2.1) * 0.55, base = U.h(i * 1.7 + 3) * 3200;
      const x = U.mod(base - Cam.x * p + t * 7, 3200) - 650, y = sy(150 + U.h(i * 5.3) * 560, p) + 20 * Math.sin(t * 0.4 + i) - t * 3 % 1;
      if (x < -140 || x > W + 140) continue;
      jelly(ctx, x, y, 0.55 + p * 0.75, t, i, a);
    }
    ctx.globalAlpha = 1;
  }

  function turtle(ctx, x, y, s, t, ph, fog) {
    const mix = c => U.css(U.mixc(c, [4, 30, 60], fog));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const fl = (px, py, len, w, ang) => { ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.fillStyle = mix([80, 128, 98]); ctx.beginPath(); ctx.ellipse(len / 2, 0, len / 2, w, 0, 0, 7); ctx.fill(); ctx.restore(); };
    const sw = Math.sin(ph);
    fl(-40, 20, 46, 8, 2.3 + 0.35 * Math.sin(ph + 1));                    // hinterer Flipper
    fl(32, 22, 78, 11, 0.95 + 0.75 * sw);                                     // vorderer Flipper (fern)
    ctx.fillStyle = mix([70, 110, 86]); ctx.beginPath(); ctx.moveTo(-70, 6); ctx.lineTo(-98, 14); ctx.lineTo(-68, 18); ctx.fill(); // Schwanz
    ctx.fillStyle = mix([196, 204, 150]); ctx.beginPath(); ctx.ellipse(0, 14, 66, 22, 0, 0, 7); ctx.fill();         // Bauchpanzer
    const g = ctx.createLinearGradient(0, -42, 0, 18); g.addColorStop(0, mix([118, 160, 84])); g.addColorStop(1, mix([46, 88, 70]));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 72, 40, 0, Math.PI, 0); ctx.bezierCurveTo(72, 14, 40, 20, 0, 20); ctx.bezierCurveTo(-40, 20, -72, 14, -72, 0); ctx.fill();
    ctx.strokeStyle = mix([34, 70, 56]); ctx.lineWidth = 2.4;
    [[-36, -10, -20, -34], [0, -12, 0, -38], [36, -10, 22, -34]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(-60, -6); ctx.quadraticCurveTo(0, -22, 60, -6); ctx.stroke();
    ctx.fillStyle = mix([130, 170, 110]); ctx.beginPath(); ctx.ellipse(80 + 3 * Math.sin(ph), -2, 22, 15, 0.12, 0, 7); ctx.fill();
    ctx.fillStyle = '#10201c'; ctx.beginPath(); ctx.arc(88, -6, 3.6, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(89, -7.2, 1.2, 0, 7); ctx.fill();
    fl(30, 14, 84, 12, 0.7 + 0.75 * Math.sin(ph + 0.6));                      // vorderer Flipper (nah)
    ctx.restore();
  }

  function manta(ctx, x, y, s, t, a) {
    const ph = t * 2.2, tip = 95 * Math.sin(ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(-s, s); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgb(10,36,76)';
    ctx.strokeStyle = 'rgb(10,36,76)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-50, 4); ctx.quadraticCurveTo(-120, 14 + tip * 0.1, -210, 30 + 10 * Math.sin(ph - 1)); ctx.stroke();
    [[1, 0.65], [0, 1]].forEach(([far, k]) => {
      ctx.globalAlpha = a * (far ? 0.7 : 1); ctx.beginPath(); ctx.moveTo(40, -2);
      ctx.quadraticCurveTo(0, tip * k * 0.55 - 14, -80, tip * k); ctx.quadraticCurveTo(-30, tip * k * 0.25 + 18, -52, 8); ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(-4, 4, 62, 17, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(52, 0); ctx.quadraticCurveTo(76, -8, 84, 4); ctx.quadraticCurveTo(72, 12, 54, 10); ctx.fill();
    ctx.fillStyle = 'rgba(120,200,255,0.5)'; ctx.beginPath(); ctx.ellipse(-6, 0, 38, 4, 0, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* Mittelgrund: Schildkroeten + Manta */
  function mid(ctx, t, ws) {
    if (t > 31 && t < 43) turtle(ctx, sx(ws.x - 1100 + (t - 31) * 220), sy(ws.y + 260 + 18 * Math.sin(t * 0.7)), 1.35, t, t * 3.4, 0.2);
    if (t > 33 && t < 45) turtle(ctx, sx(ws.x - 1200 + (t - 33) * 180), sy(ws.y - 410 + 14 * Math.sin(t * 0.6)), 0.65, t, t * 3 + 1, 0.65);
    if (t > 36 && t < 47) manta(ctx, sx(ws.x + 1900 - (t - 36) * 360), sy(ws.y - 450 + 22 * Math.sin(t * 0.5)), 1.15, t, 0.55 * sm(36, 38, t) * (1 - sm(45, 47, t)));
  }

  /* ferne Wale antworten (vor der Mutter gezeichnet) */
  function far(ctx, t, ws) {
    const a = sm(44, 48, t) * (1 - sm(53, 57, t)); if (a < 0.01) return;
    [[900, -270, 1.5], [1400, -170, 1.15]].forEach(([dx, dy, sc], k) => {
      Whale.draw(ctx, { x: sx(ws.x + dx - (t - 44) * 12), y: sy(ws.y + dy + 12 * Math.sin(t * 0.4 + k)), angle: -0.03 + 0.03 * k, scale: sc,
        phase: ws.phase * 0.6 + k * 2, power: 0.3, fog: 0.82, fogCol: [6, 40, 78], alpha: a * 0.9 });
    });
  }

  /* Walgesang: konzentrische Schallbogen */
  function ring(ctx, o, tb, t, col, mx) {
    const age = t - tb; if (age < 0 || age > 3.6) return;
    const hx = o.x + Math.cos(o.angle) * Whale.LEN * 0.5 * o.scale, hy = o.y + Math.sin(o.angle) * Whale.LEN * 0.5 * o.scale;
    const x = sx(hx), y = sy(hy), f = 1 - age / 3.6;
    ctx.fillStyle = U.css(col); glow(ctx, x, y, 60 * o.scale * Math.max(0, 1 - age * 2.2), 0.7);
    ctx.lineCap = 'round';
    for (let j = 0; j < 3; j++) {
      const r = (24 + (age - j * 0.2) * 190 * mx); if (r < 8) continue;
      ctx.strokeStyle = U.css(col, 0.6 * f * (1 - j * 0.25)); ctx.lineWidth = 3.4 - j * 0.8;
      ctx.beginPath(); ctx.arc(x - r * 0.35, y, r, -0.85 + o.angle * 0.5, 0.85 + o.angle * 0.5); ctx.stroke();
      for (let q = 0; q < 2; q++) {
        const an = (U.h(j * 7 + q + tb) - 0.5) * 1.5, tw = 0.5 + 0.5 * Math.sin(t * 6 + q + j);
        ctx.fillStyle = U.css(col); glow(ctx, x - r * 0.35 + Math.cos(an) * r, y + Math.sin(an) * r, 9, f * tw * 0.8);
      }
    }
  }

  function song(ctx, t, ws, mo) {
    if (!mo || t < 41 || t > 55) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let tb = 41.4; tb < 49.3; tb += 0.85) ring(ctx, mo, tb, t, [190, 245, 255], 1);
    for (let tb = 45.6; tb < 50.2; tb += 1.0) ring(ctx, ws, tb, t, [255, 190, 225], 0.7);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  return { jellies, mid, far, song };
})();
