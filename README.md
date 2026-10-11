# Kaito und der Ruf der Wellen 🐋✨

> **"Der Tanz des Himmelslichts"** – Eine 2D-Canvas-Animation mit atmosphärischer Parallaxe, dynamischem Partikelsystem und einem maßgeschneiderten Ambient-Soundtrack.

---

### 🌐 Live-Demo
Erlebe die Animation direkt im Browser (mit Audio):  
👉 **[https://nexxizz.github.io/Kaito-und-der-Ruf-der-Wellen/](https://nexxizz.github.io/Kaito-und-der-Ruf-der-Wellen/)**

*(Einfach auf **▶ Abspielen** klicken, um die Musik und Animation synchron zu starten.)*

---

## 📖 Storyline

1. **Szene 1: Die Schatten der Tiefe (0s – 7s)**  
   *Kaito schwimmt zaghaft im tiefblauen, schattigen Ozean. Tanzende Sonnenstrahlen (God Rays) brechen durch das Wasser.*  
   > *„Kaito war noch klein – und das weite Meer schien endlos tief.“*

2. **Szene 2: Der Sprung nach oben (7s – 15s)**  
   *Vertikaler Parallax-Scroll. Das Wasser wechselt von Tiefblau zu leuchtendem Türkis. Ein Schwarm leuchtender Fische zieht vorbei.*  
   > *„Doch das Licht an der Oberfläche rief ihn.“*

3. **Szene 3: Die Entdeckung des Himmels (15s – 23s)**  
   *Kaito durchbricht die Oberfläche im Sonnenuntergang. Gischt, Wassertropfen und Fontäne steigen auf.*  
   > *„Zum ersten Mal berührte er die Welt über den Wellen.“*

4. **Szene 4: Heimkehr mit Mut (23s – 30s)**  
   *Elegantes Wiedereintauchen mit sanfter Strömungswolke. Im Hintergrund nähert sich die Silhouette seiner Mutter.*  
   > *„Der Ozean war nicht mehr dunkel. Er war voller Wunder.“*

---

## 🛠 Technische Details

- **Rendering:** Reine HTML5 Canvas 2D API (`1920x1080` @ `60 FPS`).
- **Tiefe & Parallaxe:** Mehrschichtiger Aufbau (Hintergrund, Lichtstrahlen, Schwebeteilchen, Leuchtfische, Kaito, Meeresoberfläche, Gischt, Mutterwal-Silhouette).
- **Prozeduraler Wal:** Organische Schwimmbewegungen und Flossenbiegung über Kurvenmathematik und Sinusfunktionen.
- **Audio-Synthese:** Eigenkomponierter, wellenförmiger Ambient-Soundtrack (`audio/compose_music.py`) via Python & `numpy` (Piano-, Pad-, Glockenklänge und Meeresrauschen).
- **Export-Pipeline:** Headless-Videorendering via Puppeteer & FFmpeg (`render.js`) nach Full-HD MP4.

---

## 🚀 Lokale Nutzung

### 1. Lokal im Browser ansehen
```bash
node serve.js
```
Öffne anschließend [http://localhost:8123](http://localhost:8123) im Browser.

### 2. Soundtrack neu generieren
```bash
py audio/compose_music.py
```

### 3. Video exportieren (MP4)
```bash
node render.js
```
Das gerenderte Video wird im Ordner `out/` abgelegt (`kaito_tanz_des_himmelslichts.mp4`).
