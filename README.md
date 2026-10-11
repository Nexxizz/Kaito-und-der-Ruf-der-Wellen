# Kaito und der Ruf der Wellen 🐋✨

> **"Der Tanz des Himmelslichts"** – Eine 60-sekündige 2D-Canvas-Animation über Mut, Entdeckung und die Wunder des Meeres. Mit atmosphärischer Parallaxe, dynamischem Partikelsystem und einem prozedural synthetisierten Original-Soundtrack. Vollständig KI-gestützt konzipiert und implementiert.

---

### 🌐 Live-Demo
Erlebe die Animation direkt im Browser (mit synchronem Audio):  
👉 **[https://nexxizz.github.io/Kaito-und-der-Ruf-der-Wellen/](https://nexxizz.github.io/Kaito-und-der-Ruf-der-Wellen/)**

*(Einfach auf **▶ Abspielen** klicken, um Musik und Animation synchron zu starten.)*

---

## 📖 Vollständige Storyline (60 Sekunden)

1. **Szene 1: Die Schatten der Tiefe (0s – 7s)**  
   *Kaito schwimmt zaghaft im tiefblauen, schattigen Ozean. Tanzende Sonnenstrahlen (God Rays) brechen durch das Wasser.*  
   > *„Kaito war noch klein – und das weite Meer schien endlos tief.“*

2. **Szene 2: Der Sprung nach oben (7s – 15s)**  
   *Vertikaler Parallax-Scroll. Das Wasser wechselt von Tiefblau zu leuchtendem Türkis. Ein Schwarm leuchtender Fische zieht vorbei.*  
   > *„Doch das Licht an der Oberfläche rief ihn.“*

3. **Szene 3: Die Entdeckung des Himmels (15s – 23s)**  
   *Kaito durchbricht die Oberfläche im goldenen Sonnenuntergang. Gischt, Wassertropfen und Fontäne steigen in Zeitlupe auf.*  
   > *„Zum ersten Mal berührte er die Welt über den Wellen.“*

4. **Szene 4: Heimkehr mit Mut (23s – 30s)**  
   *Elegantes Wiedereintauchen mit sanfter Strömungswolke. Im Hintergrund nähert sich ruhig die Silhouette seiner Mutter.*  
   > *„Der Ozean war nicht mehr dunkel. Er war voller Wunder.“*

5. **Szene 5: Die leuchtende Welt (30s – 37s)**  
   *Schwebende biolumineszierende Quallen pulsieren sanft im Licht. Kaito schwimmt Seite an Seite mit seiner Mutter durch schimmernde Partikelströme.*  
   > *„Hier unten wartete eine Welt voller Lichter.“*

6. **Szene 6: Begegnungen & Das Lied der Wellen (37s – 43s)**  
   *Schildkröten und ein majestätischer Mantarochen gleiten vorbei. Die Mutter stimmt den uralten Walgesang an, dargestellt durch konzentrische Klangwellen im Wasser.*  
   > *„Quallen tanzten, Schildkröten zogen ruhig ihre Bahnen.“*  
   > *„Seine Mutter sang das alte Lied der Wellen.“*

7. **Szene 7: Kaito antwortet (43s – 51s)**  
   *Ferne Wale antworten im Echo. Kaito stimmt zaghaft in den Gesang ein – seine eigenen Schallwellen harmonieren mit denen der Mutter.*  
   > *„Und Kaito stimmte zum ersten Mal mit ein.“*

8. **Szene 8: Der Tanz unter den Sternen (51s – 60s)**  
   *Der Sonnenuntergang weicht einer klaren Sternennacht mit Vollmond. Kaito und seine Mutter steigen gemeinsam an die Meeresoberfläche und atmen synchron aus – silberne Fontänen glitzern im Mondlicht.*  
   > *„Gemeinsam trugen sie das Licht hinauf zu den Sternen.“*

---

## 🛠 Technische Details

- **Rendering:** Reine HTML5 Canvas 2D API (`1920x1080` @ `60 FPS`).
- **Tiefe & Parallaxe:** Mehrschichtiger Aufbau (Sternennacht/Mond, Sonnenuntergang, Meeresgrund mit Kelp-Animation, God Rays, Schwebeteilchen, Leuchtfische, Quallen, Schildkröten, Manta, Kaito, Mutterwal, Schaum, Gischt).
- **Prozeduraler Wal & Lebewesen:** Organische Schwimmbewegungen, Flossenbiegung und Quallenpulsieren über mathematische Sinus- und Spline-Funktionen.
- **Audio-Synthese:** Eigenkomponierter 60-Sekunden-Soundtrack (`audio/compose_music.py`) via Python & `numpy`:
  - 16 Akkordfolgen (Warm Pads, Intonation & Arpeggios)
  - Glockenspiel-Motiv für Kaito
  - Ozeanrauschen und Splash-Transienten
  - Realistische Walgesang-Synthese mit Pitch-Slides und Frequenzmodulation
- **Export-Pipeline:** Headless-Videorendering via Puppeteer & FFmpeg (`render.js`) nach Full-HD MP4.

---

## 🚀 Lokale Ausführung

### 1. Im Browser ansehen
```bash
node serve.js
```
Öffne anschließend [http://localhost:8123](http://localhost:8123) im Browser.

### 2. Soundtrack neu generieren
```bash
py audio/compose_music.py
```

### 3. Video als MP4 exportieren
```bash
node render.js
```
Erzeugt die Datei `out/kaito_tanz_des_himmelslichts.mp4`.
