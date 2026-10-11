// Frame-genauer Export:  node render.js            -> out/kaito_tanz_des_himmelslichts.mp4 (1080p, 60 FPS, mit Musik)
//                        node render.js shots 2 9 17 -> out/shot_<t>.png  (Vorschau einzelner Zeitpunkte)
const puppeteer = require('puppeteer-core'), { spawn } = require('child_process'), fs = require('fs'), path = require('path');
const ffmpeg = require('ffmpeg-static'), { start } = require('./serve');
const BROWSER = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const FPS = 60, DUR = 30;

(async () => {
  fs.mkdirSync('out', { recursive: true });
  const srv = await start(8124);
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true, args: ['--use-gl=angle', '--enable-gpu-rasterization'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1920, height: 1080 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('http://localhost:8124/index.html?render=1'); await page.waitForFunction('window.renderFrame');
  const grab = (t, type, q) => page.evaluate((t, type, q) => { renderFrame(t); return document.getElementById('stage').toDataURL(type, q).split(',')[1]; }, t, type, q);

  if (process.argv[2] === 'shots') {
    for (const t of process.argv.slice(3).map(Number)) fs.writeFileSync(`out/shot_${t}.png`, Buffer.from(await grab(t, 'image/png'), 'base64'));
  } else {
    const outFile = path.join('out', 'kaito_tanz_des_himmelslichts.mp4');
    const ff = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'audio/ocean_theme.wav',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < FPS * DUR; f++) {
      const ok = ff.stdin.write(Buffer.from(await grab(f / FPS, 'image/jpeg', 0.95), 'base64'));
      if (!ok) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 120 === 0) console.log(`Frame ${f}/${FPS * DUR}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('Fertig:', outFile);
  }
  await browser.close(); srv.close();
})();
