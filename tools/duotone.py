"""CU duotone: gradient-map a photo through midnight -> purple -> lavender.
Usage: .venv/bin/python tools/duotone.py <in.jpg> <out.jpg> [max_width]"""
import subprocess, sys, json
import numpy as np
src, out = sys.argv[1], sys.argv[2]; mw = int(sys.argv[3]) if len(sys.argv) > 3 else 1600
w, h = map(int, subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',src]).decode().strip().split(','))
if w > mw: h = round(h * mw / w / 2) * 2; w = mw
raw = subprocess.check_output(['ffmpeg','-v','error','-i',src,'-vf',f'scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'])
img = np.frombuffer(raw, np.uint8).reshape(h, w, 3) / 255.0
lum = img @ np.array([0.2126, 0.7152, 0.0722])
lo, hi = np.percentile(lum, 2), np.percentile(lum, 98); lum = np.clip((lum - lo) / (hi - lo), 0, 1)
stops = [(0.0, '#12124a'), (0.55, '#5822d8'), (1.0, '#e8daff')]
c = lambda s: np.array([int(s[i:i+2], 16) for i in (1, 3, 5)]) / 255
xs = [p for p, _ in stops]; cols = np.array([c(s) for _, s in stops])
outimg = np.stack([np.interp(lum, xs, cols[:, k]) for k in range(3)], -1)
subprocess.run(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-i','-','-q:v','3',out], input=(outimg*255).astype(np.uint8).tobytes(), check=True)
print('duotone', out)
