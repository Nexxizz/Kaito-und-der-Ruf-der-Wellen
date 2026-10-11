/* Komposition aller Ebenen + Player + Video-Aufnahme */
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const DURATION = 60, FPS = 60;

function renderFrame(t) {
  t = U.clamp(t, 0, DURATION);
  const ws = Path.whale(t); Path.camera(t, ws);
  const mo = Path.mother(t, ws);
  BG.setEvents(FX.events); BG.night = U.smooth(42, 52, t);
  const warm = 0.65 * U.smooth(14.5, 17.5, t) * (1 - U.smooth(38, 48, t)), wonder = U.smooth(22, 27, t);
  const fog = ws.y < 0 ? 0 : U.clamp(ws.y / 3000) * 0.65;
  const rayI = (0.5 + 0.95 * U.smooth(2, 5.5, t)) * (1 + 0.6 * wonder) * (1 - 0.7 * BG.night);

  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, H);

  // --- Hintergrund
  BG.sky(ctx, t);
  BG.water(ctx, t, warm);
  Life.seabed(ctx, t, 'far');
  Life.dust(ctx, t, 0.35, 70, 5, 0.35, 11);
  Life.seabed(ctx, t, 'mid');
  BG.rays(ctx, t, rayI, warm);
  Life.streams(ctx, t, wonder * 0.8 + 0.2 * U.smooth(16, 22, t));
  Creatures.far(ctx, t, ws);
  if (mo) Whale.draw(ctx, { ...mo, x: sx(mo.x), y: sy(mo.y), fog: 0.6 - 0.3 * U.smooth(50, 55, t), fogCol: [6, 40, 78], warm: 0 });
  Life.dust(ctx, t, 0.7, 60, 6, 0.5, 31);

  // --- Mittelgrund
  Life.fish(ctx, t, ws, 0);
  Creatures.jellies(ctx, t);
  Creatures.mid(ctx, t, ws);
  FX.puffs(ctx, t);
  Whale.draw(ctx, { ...ws, x: sx(ws.x), y: sy(ws.y), fog, warm: ws.y < 120 ? warm : warm * 0.3 });
  Life.fish(ctx, t, ws, 1);
  FX.bubbles(ctx, t);
  Creatures.song(ctx, t, ws, mo);

  // --- Vordergrund
  BG.surfaceFront(ctx, t, warm);
  FX.foam(ctx, t);
  FX.spray(ctx, t);
  Life.sparkles(ctx, t, wonder);
  Life.dust(ctx, t, 1.0, 50, 7, 0.6, 51);
  Life.seabed(ctx, t, 'front');
  Life.dust(ctx, t, 1.6, 9, 42, 0.07, 71);

  // --- Look: Vignette, Abblenden, Text
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(0,8,24,0)'); vg.addColorStop(1, 'rgba(0,8,24,0.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  Captions.draw(ctx, t);
  const black = Math.max(1 - U.smooth(0, 1.1, t), U.smooth(58.6, 59.95, t));
  if (black > 0.001) { ctx.fillStyle = `rgba(0,0,0,${black})`; ctx.fillRect(0, 0, W, H); }
}

/* ------------------------------------------------------------ Player */
let clockStart = 0, playing = false, actx = null, audioBuf = null, srcNode = null, recDest = null, recorder = null;
const ui = { start: document.getElementById('start'), rec: document.getElementById('record'), overlay: document.getElementById('overlay'), msg: document.getElementById('msg') };

async function loadAudio() {
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await (await fetch('audio/ocean_theme.wav')).arrayBuffer();
    audioBuf = await actx.decodeAudioData(buf);
  } catch (e) { console.warn('Audio nicht verfügbar (bitte über serve.js starten):', e); actx = null; }
}

async function play(record) {
  if (!audioBuf && !actx) await loadAudio();
  ui.overlay.classList.add('hidden'); playing = true;
  if (actx) {
    await actx.resume();
    srcNode = actx.createBufferSource(); srcNode.buffer = audioBuf;
    srcNode.connect(actx.destination);
    if (record) { recDest = actx.createMediaStreamDestination(); srcNode.connect(recDest); }
    srcNode.start(); clockStart = actx.currentTime;
  } else clockStart = performance.now() / 1000;
  if (record) startRecording();
  requestAnimationFrame(tick);
}

function tick() {
  if (!playing) return;
  const t = (actx ? actx.currentTime : performance.now() / 1000) - clockStart;
  renderFrame(t);
  if (t >= DURATION) return finish();
  requestAnimationFrame(tick);
}

function finish() {
  playing = false; if (recorder) recorder.stop();
  ui.overlay.classList.remove('hidden'); ui.start.textContent = '↻ Nochmal ansehen';
  ui.msg.textContent = recorder ? 'Video wird gespeichert …' : '';
}

function startRecording() {
  const stream = canvas.captureStream(FPS);
  if (recDest) recDest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
  const chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 16e6, audioBitsPerSecond: 192e3 });
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    a.download = 'kaito_tanz_des_himmelslichts.webm'; a.click(); recorder = null; ui.msg.textContent = 'Video gespeichert.';
  };
  recorder.start(250);
}

ui.start.onclick = () => play(false);
ui.rec.onclick = () => play(true);
addEventListener('keydown', e => { if (e.code === 'Space' && !playing) play(false); });
window.renderFrame = renderFrame;               // fuer render.js (Frame-genauer Export)
renderFrame(17.9);                              // Vorschaubild hinter dem Startschirm
if (location.search.includes('render')) ui.overlay.classList.add('hidden');
