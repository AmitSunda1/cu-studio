"""Original, royalty-free lo-fi backing track, synthesised from scratch (no samples, no services).
Usage: .venv/bin/python tools/music.py <seconds> <out.wav> [bpm]
Warm Rhodes-style chords, sub bass, soft kick, brushed hats, a gentle pluck motif. Builds after the intro, fades out."""
import sys, wave
import numpy as np

SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]; bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 92
beat = 60 / bpm; bar = beat * 4
N = int(dur * SR) + SR
mix = np.zeros((N, 2))
rng = np.random.default_rng(7)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, r):
    e = np.ones(n); a = max(1, int(a * SR)); r = max(1, min(n, int(r * SR)))
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e
def add(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * gain
    mix[i:j, 0] += s * np.sqrt((1 - pan) / 2)
    mix[i:j, 1] += s * np.sqrt((1 + pan) / 2)
def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a) * x[k] + a * p; y[k] = p
    return y

def rhodes(m, length):
    n = int(length * SR); t = np.arange(n) / SR; f = hz(m)
    tone = np.sin(2*np.pi*f*t + 0.6*np.sin(2*np.pi*f*t) * np.exp(-t*3)) + 0.25*np.sin(2*np.pi*2*f*t)*np.exp(-t*2)
    trem = 1 + 0.12*np.sin(2*np.pi*4.5*t)
    return tone * trem * env(n, 0.01, 0.4) * np.exp(-t*0.35)
def bass(m, length):
    n = int(length * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*hz(m)*t) + 0.15*np.sin(2*np.pi*2*hz(m)*t)) * env(n, 0.01, 0.15)
def kick():
    n = int(0.35*SR); t = np.arange(n)/SR
    f = 45 + 90*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*9)
def hat(open_=False):
    n = int((0.12 if open_ else 0.05)*SR); x = rng.standard_normal(n)
    x = x - lowpass(x, 6000)  # crude highpass
    return x * np.exp(-np.arange(n)/SR * (25 if open_ else 70))
def pluck(m):
    n = int(0.6*SR); t = np.arange(n)/SR
    return (np.sin(2*np.pi*hz(m)*t) + 0.3*np.sin(2*np.pi*3*hz(m)*t)*np.exp(-t*8)) * np.exp(-t*5) * env(n, 0.003, 0.05)

# Cmaj9 - Am9 - Fmaj9 - G6/9 (warm, hopeful)
prog = [([48, 55, 59, 62, 64], 36), ([45, 52, 55, 59, 60], 33), ([41, 48, 52, 55, 57], 29), ([43, 50, 52, 57, 59], 31)]
motif = [76, 74, 72, 74, 79, 76, 74, 72]
K, H, HO, P = kick(), hat(), hat(True), None
bars = int(dur / bar) + 1
for b in range(bars):
    t0 = b * bar
    chord, root = prog[b % 4]
    intro = b < 2
    for k, m in enumerate(chord):
        add(rhodes(m, bar + 0.3), t0 + k * 0.012, pan=(k - 2) * 0.25, gain=0.09)
    if not intro:
        add(bass(root, beat * 1.5), t0, gain=0.32); add(bass(root, beat * 0.9), t0 + beat * 2.5, gain=0.26)
        for q in (0, 2.5): add(K, t0 + q * beat, gain=0.55)
    for e in range(8):
        sw = 0.04 if e % 2 else 0  # swing
        add(H if e % 4 != 3 else HO, t0 + (e * 0.5 + sw) * beat, pan=0.35, gain=0.07 if intro else 0.1)
    if b >= 4 and b % 2 == 0:
        for e, m in enumerate(motif):
            add(pluck(m), t0 + e * beat * 0.5, pan=-0.3, gain=0.07)

mix = mix[: int(dur * SR)]
# soft saturation + fades
mix = np.tanh(mix * 1.4) / 1.4
fi, fo = int(1.0*SR), int(2.5*SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print(f'music {dur:.1f}s @ {bpm:.0f} bpm -> {out}')
