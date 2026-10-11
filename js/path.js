/* Choreografie: Position/Pose Kaitos, Mutter, Kamera - alles rein zeitabhaengig (deterministisch, seekbar) */
const Path = (() => {
  const Y0 = 2500, Y1 = 80, DY = Y0 - Y1, UP0 = 7, UP1 = 15.5, UPD = UP1 - UP0;
  const G = 152;                                  // "Zeitlupen"-Schwerkraft beim Sprung
  const VY0 = -1.3 * DY / UPD;                    // Ausstiegsgeschwindigkeit (stetig)
  const VX0 = 0.65 * -VY0;
  const XB = -130 + 0.65 * DY;
  const sm = U.smooth;
  const tAir = (-VY0 + Math.sqrt(VY0 * VY0 - 2 * G * Y1)) / G;
  const T_IN = UP1 + tAir;
  const T_EM = UP1 + (-VY0 - Math.sqrt(VY0 * VY0 - 2 * G * Y1)) / G;
  const XIN = XB + VX0 * tAir;
  const DEEP = 380, vIn = VY0 + G * tAir, DIVE = 3 * DEEP / vIn;

  function raw(t) {
    let x, y;
    if (t < UP0) {
      x = -200 + 10 * t;
      y = Y0 + 14 * Math.sin(t * 1.1) * (1 - sm(4.5, UP0, t));
    } else if (t < UP1) {
      const p = (t - UP0) / UPD, s = 0.35 * sm(0, 1, p) + 0.65 * p * p;
      y = Y0 - DY * s; x = -130 + 0.65 * (Y0 - y);
    } else if (t < T_IN) {
      const a = t - UP1; y = Y1 + VY0 * a + 0.5 * G * a * a; x = XB + VX0 * a;
    } else {
      const a = t - T_IN;
      y = DEEP * U.easeOutCubic(a / DIVE) + 10 * Math.sin(Math.max(0, a - DIVE) * 0.9) * sm(0, 1.5, a - DIVE);
      x = XIN + 70 * a + 170 * 1.2 * (1 - Math.exp(-a / 1.2));
    }
    return { x, y };
  }

  /* Schwanzschlag-Phase als kumulierte Tabelle */
  const PH = [0], PS = 1 / 120;
  const omega = t => 2.6 + 4.4 * sm(6, 9, t) - 3.4 * sm(16, 20, t) - 0.6 * sm(22, 24, t);
  for (let i = 1; i <= 30 * 120 + 2; i++) PH.push(PH[i - 1] + omega(i * PS) * PS);
  const phase = t => { const f = t / PS, i = Math.min(PH.length - 2, Math.floor(f)); return U.lerp(PH[i], PH[i + 1], f - i); };
  const power = t => 0.28 + 0.72 * sm(6.5, 9, t) - 0.45 * sm(15.8, 19, t) + 0.1 * sm(19.5, 21, t) - 0.25 * sm(22, 24, t);

  function whale(t) {
    const p = raw(t), a = raw(t - 0.03), b = raw(t + 0.03);
    const vel = Math.atan2(b.y - a.y, Math.max(1e-4, b.x - a.x));
    const manual = -0.08 - 0.5 * sm(3.2, 6.3, t) + 0.03 * Math.sin(t * 1.3);
    return {
      x: p.x, y: p.y, angle: U.lerp(manual, vel, sm(7, 8.8, t)),
      scale: 0.62 + 0.38 * sm(4, 16, t), phase: phase(t), power: power(t),
      vx: (b.x - a.x) / 0.06, vy: (b.y - a.y) / 0.06,
    };
  }

  function camera(t, ws) {
    const yOff = 110 + 30 * sm(21, 24, t);
    Cam.x = ws.x + 220 + 18 * Math.sin(t * 0.45);
    Cam.y = U.smax(ws.y - yOff, -320, 60) + 6 * Math.sin(t * 0.37);
    if (t < 2) Cam.y += 0; // Start ruhig
  }

  function mother(t, ws) {
    if (t < 22) return null;
    const p = U.clamp((t - 22.5) / 6.5), e = p * p * (3 - 2 * p);
    return {
      x: ws.x + U.lerp(-1450, 330, e), y: ws.y - 120 + 14 * Math.sin(t * 0.5),
      angle: 0.02 + 0.03 * Math.sin(t * 0.4), scale: 2.3, phase: phase(t) * 0.7 + 1.3, power: 0.32,
    };
  }

  return { raw, whale, camera, mother, T_EM, T_IN, VX0 };
})();
