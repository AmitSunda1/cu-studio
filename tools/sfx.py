"""Original sound effects, synthesised in code (no samples), placed from a cue sheet.
Usage: .venv/bin/python tools/sfx.py <cues.json> <out.wav>
cues.json: {"duration": s, "cues": [{"t": s, "type": "whoosh|pop|tick|click|scratch|riser|chime|send|thud|flip|hit|resolve", "dur"?: s, "n"?: k}]}"""
import json, sys, wave
import numpy as np

SR = 44100
spec = json.load(open(sys.argv[1])); out = sys.argv[2]
N = int(spec['duration'] * SR) + SR
mix = np.zeros(N)
rng = np.random.default_rng(3)

def place(sig, t, gain):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * gain
def onepole(x, cut):  # cut may be an array (time-varying)
    cut = np.broadcast_to(cut, x.shape); y = np.zeros_like(x); p = 0.0
    a = np.exp(-2 * np.pi * cut / SR)
    for k in range(len(x)): p = (1 - a[k]) * x[k] + a[k] * p; y[k] = p
    return y
def ts(d): return np.arange(int(d * SR)) / SR

def whoosh(d=0.45):
    t = ts(d); n = rng.standard_normal(len(t))
    sweep = 300 + 5000 * np.sin(np.pi * t / d) ** 2
    x = onepole(n, sweep) - onepole(n, sweep * 0.25)
    return x * np.sin(np.pi * t / d) ** 1.5 * 2.2
def pop(f=740):
    t = ts(0.09); fr = f * (1 + 0.6 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 45)
def tick():
    t = ts(0.025); return (rng.standard_normal(len(t)) * 0.4 + np.sin(2 * np.pi * 3200 * t)) * np.exp(-t * 300)
def click():
    t = ts(0.03); n = rng.standard_normal(len(t)); return (n - onepole(n, 2500)) * np.exp(-t * 220) * 1.4
def scratch(d=0.35):
    t = ts(d); n = rng.standard_normal(len(t)); x = onepole(n, 1800) - onepole(n, 500)
    return x * np.minimum(1, t * 40) * np.exp(-t * 6) * 3
def riser(d=2.0):
    t = ts(d); f = 220 * 2 ** (t / d * 1.6)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + np.sin(4 * np.pi * np.cumsum(f) / SR) * 0.2) * (t / d) ** 1.5 * np.exp(-np.maximum(0, t - d * 0.9) * 30)
def chime():
    t = ts(1.6); s = np.zeros(len(t))
    for f, dl in ((1046.5, 0), (1568, 0.12)):
        k = int(dl * SR); tt = t[: len(t) - k]
        s[k:] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3)
    return s

def send():  # message sent: quick upward blip
    t = ts(0.12); f = 500 + 1400 * (t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * np.minimum(1, t * 400)
def thud():  # low soft knock
    t = ts(0.35); f = 120 * np.exp(-t * 6) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * 1.6
def flip(n=6, d=0.4):  # paper/page flutter: a few short filtered noise bursts
    out = np.zeros(int(d * SR) + SR // 10)
    for k in range(n):
        t = ts(0.05); b = rng.standard_normal(len(t)); b = (b - onepole(b, 1200)) * np.exp(-t * 90)
        i = int(k * d / n * SR); out[i:i + len(b)] += b * (0.6 + 0.4 * (k % 2))
    return out
def hit():  # one cinematic accent: sub drop + noise crack
    t = ts(0.8); f = 90 * np.exp(-t * 3) + 38
    n = rng.standard_normal(len(t)); crack = (n - onepole(n, 3000)) * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * 1.4 + crack * 0.5
def resolve():  # single soft bell, no stack
    t = ts(2.2); f = 784.0
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4)) * np.exp(-t * 2.2) * np.minimum(1, t * 200)

PITCH = [660, 740, 830, 880, 990]
for k, c in enumerate(spec['cues']):
    ty, t = c['type'], c['t']
    if ty == 'whoosh': place(whoosh(), t - 0.12, 0.16)
    elif ty == 'pop': place(pop(PITCH[k % len(PITCH)]), t, 0.10)
    elif ty == 'tick':
        for j in range(c.get('n', 12)): place(tick(), t + j * c.get('dur', 2.0) / c.get('n', 12), 0.09)
    elif ty == 'click':
        for j in range(c.get('n', 12)): place(click(), t + j * c.get('dur', 1.0) / c.get('n', 12) + rng.uniform(0, 0.02), 0.10)
    elif ty == 'scratch': place(scratch(), t, 0.12)
    elif ty == 'riser': place(riser(c.get('dur', 2.0)), t, 0.07)
    elif ty == 'chime': place(chime(), t, 0.16)
    elif ty == 'send': place(send(), t, 0.11)
    elif ty == 'thud': place(thud(), t, 0.22)
    elif ty == 'flip': place(flip(c.get('n', 6), c.get('dur', 0.4)), t, 0.10)
    elif ty == 'hit': place(hit(), t, 0.20)
    elif ty == 'resolve': place(resolve(), t, 0.12)

mix = mix[: int(spec['duration'] * SR)]
mix = np.tanh(mix * 1.2) / 1.2
st = np.stack([mix, mix], 1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
print(f"sfx: {len(spec['cues'])} cues -> {out}")
