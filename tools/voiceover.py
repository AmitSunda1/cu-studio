"""Usage: .venv/bin/python tools/voiceover.py content/<reel>.json
Writes output/<reel>/voiceover.mp3 and output/<reel>/timeline.json (beat + word timings, seconds).
Hindi: give each beat "vo" in Devanagari (spoken) and "cap" in Hinglish with the same number of words (shown on screen);
each timed word then carries "c" = its Hinglish caption word.
Per beat: "voice" overrides the reel voice (dialogue), "who" names the speaker (kept in the timeline),
and "~" joins spoken words shown as one caption word (ई~ओ~डी = EOD)."""
import asyncio, json, os, subprocess, sys
import edge_tts

spec_path = sys.argv[1]
spec = json.load(open(spec_path))
slug = os.path.splitext(os.path.basename(spec_path))[0]
out = os.path.join('output', slug); os.makedirs(os.path.join(out, 'beats'), exist_ok=True)

def dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())

async def main():
    t, beats, parts = 0.25, [], []
    for b in spec['beats']:
        f = os.path.join(out, 'beats', b['id'] + '.mp3')
        for attempt in range(4):  # the free service occasionally returns no audio; retry
            words = []
            try:
                com = edge_tts.Communicate(b['vo'].replace('~', ' '), b.get('voice', spec['voice']), rate=spec.get('rate', '+0%'), boundary='WordBoundary')
                with open(f, 'wb') as fh:
                    async for c in com.stream():
                        if c['type'] == 'audio': fh.write(c['data'])
                        elif c['type'] == 'WordBoundary':
                            words.append({'w': c['text'], 's': round(t + c['offset'] / 1e7, 3), 'e': round(t + (c['offset'] + c['duration']) / 1e7, 3)})
                break
            except edge_tts.exceptions.NoAudioReceived:
                if attempt == 3: raise
                await asyncio.sleep(2 * (attempt + 1))
        # "~" joins spoken words that show as ONE caption word (e.g. ई~ओ~डी -> "EOD"): merge their timings
        if '~' in b['vo']:
            sizes = [len(t.split('~')) for t in b['vo'].split()]
            if sum(sizes) == len(words):
                merged, k = [], 0
                for n in sizes: g = words[k:k + n]; merged.append({'w': ' '.join(x['w'] for x in g), 's': g[0]['s'], 'e': g[-1]['e']}); k += n
                words = merged
        # Hindi reels: "vo" is spoken (Devanagari), "cap" is the on-screen Hinglish, word for word
        if 'cap' in b:
            toks = b['cap'].split()
            if len(toks) != len(words):
                sys.exit(f'beat "{b["id"]}": the voice spoke {len(words)} words but "cap" has {len(toks)}: ' + ' '.join(w['w'] for w in words))
            for w, c in zip(words, toks): w['c'] = c
        # end the beat 0.15s after its last word (edge-tts pads ~0.85s of silence)
        end = (words[-1]['e'] + 0.15) if words else t + dur(f)
        beats.append({'id': b['id'], 'start': round(t, 3), 'end': round(end, 3), 'words': words, **({'who': b['who']} if 'who' in b else {})})
        parts.append((f, t)); t = end + b.get('pauseAfter', spec.get('gap', 0.3))
    total = round(t + spec.get('endCard', 2.0), 3)
    # mix all beats at their offsets into one track
    args = ['ffmpeg', '-loglevel', 'error', '-y']
    for f, _ in parts: args += ['-i', f]
    filt = ''.join(f'[{i}]adelay={int(s*1000)}|{int(s*1000)}[a{i}];' for i, (_, s) in enumerate(parts))
    filt += ''.join(f'[a{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[m]'
    subprocess.check_call(args + ['-filter_complex', filt, '-map', '[m]', '-ar', '48000', '-b:a', '192k', os.path.join(out, 'voiceover.mp3')])
    json.dump({'duration': total, 'beats': beats}, open(os.path.join(out, 'timeline.json'), 'w'), indent=1)
    print(f'voiceover {total:.1f}s, {len(beats)} beats -> {out}/voiceover.mp3')
asyncio.run(main())
