/* Partikel-Effekte: Blasen-Spur, Gischt, Fontaene, Schaum, Stroemungswolke.
   Alles wird aus der Zeit t rekonstruiert (Geburtszeit + Zufall) -> deterministisch und seekbar. */
const FX = (() => {
  const GRAV = 520;
  const rnd = (k, n) => U.h(k * 12.9898 + n * 78.233);

  /* Emitter fuer Blasen: ab/bis, Intervall, Streuung, Ursprung (tail|body) */
  const BUB = [
    { a: 0.5, b: 7, dt: 0.9, sp: 16, life: 5, tail: 1 },
    { a: 7.5, b: 15.7, dt: 0.055, sp: 26, life: 4.5, tail: 1 },
    { a: Path.T_IN - 0.3, b: Path.T_IN + 1.6, dt: 0.012, sp: 230, life: 6, tail: 0 },
    { a: Path.T_IN + 1.6, b: 22.5, dt: 0.06, sp: 40, life: 4.5, tail: 1 },
    { a: 22.5, b: 59.5, dt: 0.4, sp: 20, life: 5, tail: 1 },
  ];

  function bubbles(ctx, t) {
    ctx.lineWidth = 1.6;
    BUB.forEach((e, ei) => {
      const k0 = Math.max(0, Math.ceil((t - e.life - e.a) / e.dt)), k1 = Math.floor((Math.min(t, e.b) - e.a) / e.dt);
      for (let k = k0; k <= k1; k++) {
        const tb = e.a + k * e.dt, age = t - tb; if (age < 0 || age > e.life) continue;
        const w = Path.whale(tb), o = e.tail ? Whale.tail(w) : { x: w.x, y: w.y };
        const sd = k * 7 + ei * 131, r = 1.8 + rnd(sd, 1) * 6.5 * (e.tail ? 1 : 1.4);
        const X = o.x + (rnd(sd, 2) - 0.5) * 2 * e.sp + Math.sin(age * 2.3 + sd) * 12;
        const Y = o.y + (rnd(sd, 3) - 0.5) * (e.tail ? 20 : 260) - age * (48 + r * 9);
        if (Y < BG.surfY(X, t)) continue;
        const x = sx(X), y = sy(Y); if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
        const a = Math.min(1, age * 3) * (1 - U.smooth(0.7, 1, age / e.life));
        ctx.fillStyle = `rgba(190,245,255,${0.1 * a})`; ctx.strokeStyle = `rgba(225,252,255,${0.65 * a})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, 7); ctx.fill();
      }
    });
  }

  /* Tropfen & Nebel: sources = {a,b,n,mk(k,tb) -> {x,y,vx,vy,size,mist}} */
  function drops(ctx, t, S) {
    for (const s of S) {
      for (let k = 0; k < s.n; k++) {
        const tb = s.a + (k / s.n) * (s.b - s.a), age = t - tb, life = s.life; if (age < 0 || age > life) continue;
        const p = s.mk(k, tb);
        let X, Y;
        if (p.mist) { const d = (1 - Math.exp(-2.2 * age)) / 2.2; X = p.x + p.vx * d; Y = p.y + p.vy * d + 60 * age * age; }
        else { X = p.x + p.vx * age; Y = p.y + p.vy * age + 0.5 * GRAV * age * age; }
        if (Y > BG.surfY(X, t) + 2 && age > 0.2) continue;
        const x = sx(X), y = sy(Y), f = 1 - age / life;
        if (p.mist) {
          ctx.fillStyle = 'rgb(255,236,226)'; glow(ctx, x, y, p.size * (1 + age * 2.4), 0.1 * f * Math.min(1, age * 6));
        } else {
          const vy = p.vy + GRAV * age, vx = p.vx, l = Math.hypot(vx, vy) * 0.016;
          ctx.globalAlpha = Math.min(1, f * 2.2); ctx.strokeStyle = 'rgba(255,248,240,0.95)'; ctx.lineWidth = p.size; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx / Math.hypot(vx, vy) * l, y - vy / Math.hypot(vx, vy) * l); ctx.stroke();
          ctx.fillStyle = 'rgb(255,226,190)'; glow(ctx, x, y, p.size * 3.2, 0.35 * f);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  const wEm = Path.raw(Path.T_EM), wIn = Path.raw(Path.T_IN);
  const SPRAY = [
    { a: Path.T_EM - 0.1, b: Path.T_EM + 0.9, n: 90, life: 2.6, mk: k => ({ x: wEm.x + (rnd(k, 1) - 0.5) * 300, y: -6, vx: (rnd(k, 2) - 0.5) * 360 + 130, vy: -(180 + rnd(k, 3) * 520), size: 1.6 + rnd(k, 4) * 3 }) },
    { a: Path.T_EM - 0.1, b: Path.T_EM + 0.9, n: 22, life: 2.4, mk: k => ({ x: wEm.x + (rnd(k, 5) - 0.5) * 220, y: -20, vx: (rnd(k, 6) - 0.5) * 120, vy: -(60 + rnd(k, 7) * 160), size: 40 + rnd(k, 8) * 40, mist: 1 }) },
    { a: Path.T_IN - 0.3, b: Path.T_IN + 1.0, n: 140, life: 2.8, mk: k => ({ x: wIn.x + (rnd(k, 9) - 0.5) * 460, y: -6, vx: (rnd(k, 10) - 0.5) * 520 + 120, vy: -(150 + rnd(k, 11) * 620), size: 1.8 + rnd(k, 12) * 3.4 }) },
    { a: Path.T_IN - 0.3, b: Path.T_IN + 1.0, n: 30, life: 2.8, mk: k => ({ x: wIn.x + (rnd(k, 13) - 0.5) * 400, y: -20, vx: (rnd(k, 14) - 0.5) * 160, vy: -(80 + rnd(k, 15) * 220), size: 50 + rnd(k, 16) * 50, mist: 1 }) },
  ];
  /* Fontaene: Blasloch folgt Kaitos Pose */
  const SPOUT = [
    { a: 17.45, b: 19.3, n: 130, life: 1.9, mk: (k, tb) => { const b = Whale.blowhole(Path.whale(tb)); return { x: b.x, y: b.y, vx: (rnd(k, 20) - 0.5) * 110 + 40, vy: -(430 + rnd(k, 21) * 210), size: 1.8 + rnd(k, 22) * 2.4 }; } },
    { a: 17.45, b: 19.3, n: 90, life: 2.2, mk: (k, tb) => { const b = Whale.blowhole(Path.whale(tb)); return { x: b.x, y: b.y, vx: (rnd(k, 23) - 0.5) * 120 + 30, vy: -(380 + rnd(k, 24) * 200), size: 22 + rnd(k, 25) * 22, mist: 1 }; } },
  ];

  /* Szene 7: Kaito und seine Mutter blasen gemeinsam unter den Sternen */
  const nightBlow = (who, a, b, sc) => {
    const top = (k, tb) => { const w = Path.whale(tb), s = who ? Path.mother(tb, w) : w; return Whale.blowhole(s); };
    SPOUT.push({ a, b, n: 90, life: 1.9, mk: (k, tb) => { const o = top(k, tb); return { x: o.x, y: o.y, vx: (rnd(k, 50 + who) - 0.5) * 100 * sc + 30, vy: -(380 + rnd(k, 51) * 200) * sc, size: 1.8 + rnd(k, 52) * 2.2 }; } });
    SPOUT.push({ a, b, n: 60, life: 2.2, mk: (k, tb) => { const o = top(k, tb); return { x: o.x, y: o.y, vx: (rnd(k, 53) - 0.5) * 110 * sc + 30, vy: -(340 + rnd(k, 54) * 170) * sc, size: (20 + rnd(k, 55) * 20) * sc, mist: 1 }; } });
  };
  nightBlow(0, 55.2, 56.6, 1); nightBlow(1, 55.7, 57.3, 1.25);

  function spray(ctx, t) { if ((t > Path.T_EM - 0.2 && t < 24) || (t > 54.8 && t < 59.5)) { ctx.globalCompositeOperation = 'lighter'; drops(ctx, t, SPRAY); drops(ctx, t, SPOUT); ctx.globalCompositeOperation = 'source-over'; } }

  /* Schaum + Ringe an der Oberflaeche */
  function foam(ctx, t) {
    for (const e of [{ x: wEm.x, t0: Path.T_EM, s: 0.6 }, { x: wIn.x, t0: Path.T_IN, s: 1 }, { x: Path.raw(53).x, t0: 53, s: 0.5 }]) {
      const age = t - e.t0; if (age < -0.1 || age > 6) continue;
      const f = 1 - U.clamp(age / 6), grow = Math.min(age + 0.1, 3.5);
      for (let i = 0; i < 40; i++) {
        const X = e.x + (rnd(i, 30) - 0.5) * (260 + grow * 300) * e.s, y = sy(BG.surfY(X, t)) + 6 + rnd(i, 31) * 12, r = (6 + rnd(i, 32) * 16) * e.s;
        ctx.fillStyle = `rgba(255,248,240,${0.55 * f * Math.min(1, age * 4 + 0.3)})`;
        ctx.beginPath(); ctx.ellipse(sx(X), y, r * 1.6, r * 0.6, 0, 0, 7); ctx.fill();
      }
      ctx.lineWidth = 2.4;
      for (let k = 0; k < 3; k++) {
        const ag = age - k * 0.35; if (ag < 0) continue;
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * Math.max(0, 1 - ag / 4.5)})`; ctx.beginPath();
        const rr = (70 + ag * 230) * e.s; ctx.ellipse(sx(e.x), sy(0) + 5, rr, rr * 0.06, 0, 0, 7); ctx.stroke();
      }
    }
  }

  /* weiche Stroemungswolke nach dem Eintauchen */
  function puffs(ctx, t) {
    const age = t - Path.T_IN; if (age < -0.1 || age > 8) return;
    for (let i = 0; i < 16; i++) {
      const a = age - i * 0.05; if (a < 0) continue;
      const X = wIn.x + 40 + (rnd(i, 40) - 0.5) * 360 + 60 * a * (0.6 + rnd(i, 41)), Y = 40 + rnd(i, 42) * 330 + a * 14;
      const r = 90 + rnd(i, 43) * 80 + a * 55, al = 0.3 * Math.min(1, a * 1.5) * Math.max(0, 1 - a / 7.5);
      const x = sx(X), y = sy(Y), g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(215,250,250,${al})`); g.addColorStop(0.6, `rgba(150,225,235,${al * 0.5})`); g.addColorStop(1, 'rgba(120,210,230,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
  }

  return { bubbles, spray, foam, puffs, events: [{ x: wEm.x, t0: Path.T_EM, amp: 16 }, { x: wIn.x, t0: Path.T_IN, amp: 34 }, { x: Path.raw(52.8).x, t0: 52.8, amp: 12 }] };
})();
