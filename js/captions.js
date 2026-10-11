/* Untertitel direkt auf dem Canvas: Wort-fuer-Wort Fade/Slide */
const Captions = (() => {
  const LINES = [
    { a: 0.9, b: 6.7, text: 'Kaito war noch klein – und das weite Meer schien endlos tief.' },
    { a: 7.7, b: 14.6, text: 'Doch das Licht an der Oberfläche rief ihn.' },
    { a: 15.9, b: 22.6, text: 'Zum ersten Mal berührte er die Welt über den Wellen.' },
    { a: 23.6, b: 28.6, text: 'Der Ozean war nicht mehr dunkel. Er war voller Wunder.' },
  ];
  const FONT = '300 54px "Segoe UI Light","Segoe UI","Helvetica Neue",Arial,sans-serif';

  function draw(ctx, t) {
    // dezenter Schleier unten fuer Lesbarkeit
    const scrim = Math.max(...LINES.map(l => U.smooth(l.a, l.a + 0.9, t) * (1 - U.smooth(l.b - 0.9, l.b, t))));
    if (scrim > 0.01) {
      const g = ctx.createLinearGradient(0, H - 320, 0, H);
      g.addColorStop(0, 'rgba(0,10,30,0)'); g.addColorStop(1, `rgba(0,10,30,${0.5 * scrim})`);
      ctx.fillStyle = g; ctx.fillRect(0, H - 320, W, 320);
    }
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const l of LINES) {
      if (t < l.a || t > l.b) continue;
      ctx.font = FONT; ctx.letterSpacing = '1.5px';
      const words = l.text.split(' '), sp = ctx.measureText(' ').width + 4;
      const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      const out = U.smooth(l.b - 0.9, l.b, t);
      let x = (W - total) / 2;
      words.forEach((w, i) => {
        const inn = U.smooth(l.a + i * 0.11, l.a + i * 0.11 + 0.8, t), a = inn * (1 - out);
        const y = H - 128 + (1 - inn) * 26 - out * 14;
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,15,40,0.75)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#f4fbff'; ctx.fillText(w, x, y);
        ctx.shadowBlur = 0; ctx.globalAlpha = a * 0.5; ctx.fillStyle = '#ffffff'; ctx.fillText(w, x, y);
        ctx.restore(); x += ws[i] + sp;
      });
      // feine Linie unter dem Text
      ctx.save(); ctx.globalAlpha = (1 - out) * U.smooth(l.a + 0.3, l.a + 1.4, t) * 0.55; ctx.fillStyle = '#cfefff';
      const lw = 90 * U.smooth(l.a + 0.3, l.a + 1.6, t); ctx.fillRect(W / 2 - lw / 2, H - 78, lw, 2); ctx.restore();
    }
    ctx.letterSpacing = '0px';
    // Titel
    const ta = U.smooth(0.4, 1.6, t) * (1 - U.smooth(4.6, 5.8, t));
    if (ta > 0.01) {
      ctx.save(); ctx.globalAlpha = ta * 0.85; ctx.textAlign = 'center'; ctx.font = '300 30px "Segoe UI Light","Segoe UI",Arial,sans-serif';
      ctx.letterSpacing = '9px'; ctx.fillStyle = '#d7f1ff'; ctx.shadowColor = 'rgba(0,10,30,0.8)'; ctx.shadowBlur = 12;
      ctx.fillText('DER TANZ DES HIMMELSLICHTS', W / 2, 110 - (1 - ta) * 12); ctx.restore(); ctx.letterSpacing = '0px';
    }
  }
  return { draw };
})();
