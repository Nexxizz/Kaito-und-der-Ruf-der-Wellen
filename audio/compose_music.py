"""
Kaito und der Ruf der Wellen - Originalsoundtrack
Komponiert (60 s) per additiver Synthese (nur numpy + wave):
  * weiche Pads (verstimmte Sinus-Schichten)  * Klavier-artige Anschlaege
  * Glockenspiel-Motiv fuer Kaito             * gefilterte Meeresrauschen-Wellen
  * Wasser-Splash zu den Durchbruch-Momenten  * synthetischer Hall (FFT-Faltung)
Ausfuehren:  py audio/compose_music.py
"""
import os
import wave
import numpy as np

SR = 44100
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)

T_EMERGE, T_ENTER = 15.73, 20.14   # muss zu js/path.js passen


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, start, pan=0.5, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    n = min(len(sig), N - i)
    L[i:i + n] += sig[:n] * gain * np.cos(pan * np.pi / 2)
    R[i:i + n] += sig[:n] * gain * np.sin(pan * np.pi / 2)


def pad_note(f, dur, amp):
    t = np.arange(int((dur + 3.0) * SR)) / SR
    env = np.minimum(1, t / 1.8) ** 2
    rel = np.clip((dur + 3.0 - t) / 3.0, 0, 1)
    env = env * np.where(t < dur, 1.0, rel ** 2)
    sig = np.zeros_like(t)
    for d, ph in ((-0.0035, 0.0), (0.0, 1.3), (0.0035, 2.4)):
        sig += np.sin(2 * np.pi * f * (1 + d) * t + ph)
        sig += 0.28 * np.sin(2 * np.pi * 2 * f * (1 + d) * t + ph * 2)
        sig += 0.08 * np.sin(2 * np.pi * 3 * f * (1 + d) * t)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 0.23 * t + f)
    return sig * env * trem * amp / 3.0


def piano_note(f, amp, dur=4.0):
    t = np.arange(int(dur * SR)) / SR
    sig = np.zeros_like(t)
    for h in range(1, 8):
        fh = f * h * np.sqrt(1 + 0.00018 * h * h)
        decay = 1.1 + 0.9 * h
        a = 1.0 / h ** 1.25
        sig += a * np.exp(-t * decay) * (np.sin(2 * np.pi * fh * t) + 0.6 * np.sin(2 * np.pi * fh * 1.0012 * t + 0.7))
    sig *= np.minimum(1, t / 0.006)
    hammer = rng.normal(size=len(t)) * np.exp(-t * 90) * 0.015
    return (sig * 0.55 + hammer) * amp


def bell_note(f, amp, dur=5.0):
    t = np.arange(int(dur * SR)) / SR
    mod = np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t * 3) * 1.4
    sig = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 0.9)
    sig += 0.3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 1.6)
    return sig * np.minimum(1, t / 0.004) * amp


def fft_filter(x, fn):
    spec = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(spec * fn(fr), len(x))


def noise_burst(start, dur, amp, lo, hi, pan=0.5):
    n = int(dur * SR)
    x = rng.normal(size=n)
    x = fft_filter(x, lambda f: (f > lo) * (1 / (1 + (f / hi) ** 2)))
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.06) * np.exp(-t * 2.4)
    add(x * env * amp, start, pan)


# ---------------------------------------------------------------- Komposition
# (Bass, Pad-Noten)  -  8 Akkorde a 3.75 s
CHORDS = [
    (35, [59, 62, 66, 69, 73]),   # Bm9      Tiefe
    (43, [55, 59, 62, 66, 69]),   # Gmaj7
    (40, [55, 59, 62, 66, 71]),   # Em9      Aufstieg
    (45, [57, 61, 64, 67, 71]),   # A9sus
    (38, [57, 62, 66, 69, 73]),   # Dmaj9    Himmel
    (43, [55, 59, 62, 66, 73]),   # Gmaj7#11
    (35, [59, 62, 66, 69, 74]),   # Bm7      Heimkehr
    (38, [57, 62, 66, 69, 73]),   # Dmaj9
    # --- Teil 2 (30-60 s): Wunder der Tiefe, Walgesang, Sternennacht
    (43, [59, 62, 66, 69, 74]),   # Gmaj9    Wunder
    (40, [55, 59, 62, 66, 71]),   # Em9
    (38, [57, 62, 66, 69, 73]),   # Dmaj9    Gesang
    (35, [59, 62, 66, 69, 73]),   # Bm9
    (43, [55, 59, 62, 66, 69]),   # Gmaj7
    (45, [57, 61, 64, 67, 71]),   # A9sus    Aufstieg
    (38, [57, 62, 66, 69, 73]),   # Dmaj9    Sterne
    (38, [57, 62, 66, 69, 74]),   # Dadd9    Ausklang
]
CH = 3.75

for i, (bass, pad) in enumerate(CHORDS):
    t0 = i * CH
    add(pad_note(hz(bass), CH + 0.6, 0.20), t0, 0.5)
    for k, m in enumerate(pad):
        add(pad_note(hz(m), CH + 0.8, 0.075), t0, 0.2 + 0.15 * k)
    # Arpeggio je nach Szene
    t = t0
    notes = [m + 12 for m in pad] + [pad[2] + 24]
    step = (1.25 if t0 < 7 else (0.4167 if t0 < 15 else (0.5 if t0 < 23 else (0.8333 if t0 < 41 else (0.4167 if t0 < 52 else 1.0)))))
    j = 0
    while t < t0 + CH - 0.01:
        m = notes[[0, 2, 1, 3, 2, 4, 3, 5][j % 8] % len(notes)]
        base = 0.05 if t < 7 else (0.05 + 0.07 * min(1, (t - 7) / 8) if t < 15 else 0.11)
        add(piano_note(hz(m), base * (0.85 + 0.3 * rng.random())), t, 0.25 + 0.5 * rng.random())
        t += step
        j += 1

# Kaito-Motiv (zaghaft, Glockenspiel)
for tm, m in [(2.0, 66), (3.4, 69), (5.0, 73), (6.2, 74)]:
    add(bell_note(hz(m + 12), 0.05), tm, 0.35)

# Melodie der Entdeckung / Heimkehr
MELODY = [
    (15.2, 78), (16.0, 81), (16.9, 85), (17.6, 83), (18.2, 81),
    (18.9, 83), (19.6, 81), (20.3, 78), (21.1, 74), (21.7, 78),
    (23.0, 74), (23.9, 73), (24.6, 71), (25.4, 74),
    (26.6, 78), (27.6, 74), (28.4, 74),
    # Szene 5 - Wunder der Tiefe
    (31.0, 78), (32.6, 81), (34.2, 83), (35.9, 81), (37.5, 78), (39.2, 74),
    # Szene 7 - Sternennacht
    (52.0, 74), (53.5, 78), (55.0, 81), (56.6, 85), (58.0, 81),
]
for tm, m in MELODY:
    add(piano_note(hz(m), 0.16, 5.0), tm, 0.55)
    add(bell_note(hz(m + 12), 0.03), tm + 0.01, 0.7)

# Walgesang (Szene 6): gleitende Toene mit Vibrato, Mutter tief - Kaito hoch
def whale_song(f0, f1, dur, amp):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * np.clip(t / dur, 0, 1) ** 1.5
    f = f * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 1.2, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    env = np.minimum(1, t / 0.9) ** 2 * np.clip((dur + 1.5 - t) / 1.4, 0, 1) ** 2
    return sig * env * amp

for tm, a, b, d in [(41.5, 196.0, 246.9, 3.0), (44.3, 246.9, 220.0, 2.6), (47.0, 220.0, 329.6, 3.0), (50.3, 293.7, 293.7, 2.4)]:
    add(whale_song(a, b, d, 0.11), tm, 0.4)
for tm, a, b, d in [(45.8, 440.0, 523.3, 1.6), (48.4, 523.3, 587.3, 1.8), (50.9, 587.3, 440.0, 2.0)]:
    add(whale_song(a, b, d, 0.07), tm, 0.7)
# Aufstiegs-Schimmer (14.4 - 15.7)
tt = np.arange(int(1.4 * SR)) / SR
sweep = np.sin(2 * np.pi * (500 * tt + 900 * tt ** 2)) * (tt / 1.4) ** 2 * np.exp(-((tt - 1.4) ** 2) * 0)
add(sweep * 0.025, 14.35, 0.5)

# ------------------------------------------------------------------ Hall
n_ir = int(3.4 * SR)
ti = np.arange(n_ir) / SR
irs = []
for _ in range(2):
    ir = rng.normal(size=n_ir) * np.exp(-ti * 1.75)
    ir = fft_filter(ir, lambda f: 1 / (1 + (f / 3500) ** 2))
    ir[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    irs.append(ir / np.sqrt(np.sum(ir ** 2)))
size = 1 << int(np.ceil(np.log2(N + n_ir)))


def reverb(x, ir):
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:N]


L, R = 0.62 * L + 0.55 * reverb(L, irs[0]) * 0.55, 0.62 * R + 0.55 * reverb(R, irs[1]) * 0.55

# ------------------------------------------------------------------ Meer
tN = np.arange(N) / SR
for ch, arr in enumerate((L, R)):
    w = fft_filter(rng.normal(size=N), lambda f: 1 / (1 + (f / 420) ** 2) ** 1.2)
    swell = (0.5 + 0.5 * np.sin(2 * np.pi * 0.085 * tN + ch * 1.7)) ** 2
    w *= (0.35 + 0.65 * swell) * 0.9
    w /= np.max(np.abs(w))
    arr += w * (0.075 + 0.04 * np.clip((tN - 14) / 4, 0, 1))
noise_burst(T_EMERGE - 0.05, 2.4, 0.16, 400, 5000, 0.45)
noise_burst(T_ENTER - 0.05, 3.2, 0.22, 150, 3500, 0.6)
add(bell_note(hz(93), 0.05), T_EMERGE + 0.1, 0.4)
add(bell_note(hz(86), 0.05), T_ENTER + 0.4, 0.6)
noise_burst(53.1, 2.6, 0.07, 300, 3500, 0.5)   # sanftes Auftauchen
noise_burst(55.25, 1.2, 0.05, 1500, 6000, 0.45)  # Fontaene Kaito
noise_burst(55.8, 1.6, 0.07, 800, 5000, 0.6)    # Fontaene Mutter

# ------------------------------------------------------------------ Master
fade = np.minimum(1, tN / 1.5) * np.clip((DUR - tN) / 2.6, 0, 1) ** 1.5
L *= fade
R *= fade
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
L, R = L / peak * 0.88, R / peak * 0.88
out = np.empty(N * 2, dtype=np.int16)
out[0::2] = (L * 32767).astype(np.int16)
out[1::2] = (R * 32767).astype(np.int16)
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ocean_theme.wav")
with wave.open(path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(out.tobytes())
print("Geschrieben:", path, f"({DUR:.1f}s)")
