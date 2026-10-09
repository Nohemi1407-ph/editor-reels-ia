#!/usr/bin/env python3
"""Find audio mistakes in the assembled cut and suggest tighter cuts -> <project>/errors.txt + edl_tight.json

Usage:  PY find_errors.py <project_dir> [--lang es] [--max-pause 0.35] [--keep 0.12]

What it flags (times are in the cut, with the source clip time next to them):
  PAUSA      dead air between words longer than --max-pause (room tone counts as silence: the threshold is relative
             to this recording's own noise floor, so it works with an air conditioner or music in the room)
  MULETILLA  filler words: eh, em, mm, este, o sea, bueno, pues, digamos, um, uh...
  REPETIDA   the same word twice in a row ("la la"), or a restarted phrase ("vamos a, vamos a diseñar")
  DUDOSA     words Whisper was unsure about (low probability): often a mispronounced or swallowed word
  CORTADA    a segment that starts or ends in the middle of speech (clipped first/last syllable)

edl_tight.json = edl.json with every PAUSA trimmed to --keep seconds and every MULETILLA / REPETIDA cut out, by
splitting segments. Review errors.txt first; then copy edl_tight.json over edl.json and re-run assemble.py,
transcribe_cut.py and cutout.py. Do this BEFORE building captions: every later word time moves.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import skillenv  # noqa: E402

FILLERS_ES = {'eh', 'ehh', 'em', 'emm', 'mm', 'mmm', 'este', 'esteee', 'pues', 'bueno', 'digamos', 'osea', 'o sea', 'ah', 'uh', 'um',
              'uhm', 'ajá'}
FILLERS_EN = {'uh', 'um', 'uhm', 'er', 'erm', 'ah', 'like', 'so', 'basically', 'actually'}
HOP = 0.02


def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


def norm(w):
    return re.sub(r"[^\wáéíóúüñ]", '', w.lower())


def envelope(media):
    """20ms RMS in dB of the mono 16k audio, and a speech threshold relative to this file's noise floor"""
    raw = subprocess.run([skillenv.tool('ffmpeg'), '-loglevel', 'error', '-i', media, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    n = int(16000 * HOP)
    x = x[:len(x) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((x ** 2).mean(1)) + 1e-9)
    floor, loud = np.percentile(db, 10), np.percentile(db, 90)
    return db, floor + max(6.0, (loud - floor) * 0.35), floor, loud


def quiet_runs(db, thr, a, b, min_len):
    """quiet stretches (start, end) inside [a, b] seconds, at least min_len long"""
    out, start = [], None
    i0, i1 = int(a / HOP), min(int(b / HOP), len(db))
    for i in range(i0, i1):
        q = db[i] < thr
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) * HOP >= min_len:
                out.append((start * HOP, i * HOP))
            start = None
    if start is not None and (i1 - start) * HOP >= min_len:
        out.append((start * HOP, i1 * HOP))
    return out


def main():
    skillenv.utf8_stdio()
    proj = skillenv.path_arg(sys.argv[1])
    lang, max_pause, keep = arg('--lang', 'es'), arg('--max-pause', 0.35), arg('--keep', 0.12)
    fillers = FILLERS_ES if lang == 'es' else FILLERS_EN
    with open(os.path.join(proj, 'segments.json'), encoding='utf-8') as fh:
        segs = json.load(fh)
    aroll = os.path.join(proj, 'assets', 'aroll.mp4')
    wav = os.path.join(proj, 'work', 'aroll.wav')
    if not os.path.exists(wav):
        subprocess.run([skillenv.tool('ffmpeg'), '-loglevel', 'error', '-y', '-i', aroll, '-vn', '-ac', '1', '-ar', '16000', wav], check=True)

    cache = os.path.join(proj, 'work', 'words_prob.json')
    if os.path.exists(cache) and os.path.getmtime(cache) > os.path.getmtime(aroll):
        with open(cache, encoding='utf-8') as fh:
            words = json.load(fh)
    else:
        from faster_whisper import WhisperModel
        m = WhisperModel('medium' if lang != 'en' else 'medium.en', compute_type='int8')
        # no initial prompt and no VAD on purpose: we WANT the fillers and restarts transcribed, not cleaned up
        s, _ = m.transcribe(wav, word_timestamps=True, vad_filter=False, language=lang,
                            initial_prompt='Eh, este, mm, o sea... bueno, eh, pues.' if lang == 'es' else 'Um, uh, like, so...')
        words = [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability, 3)}
                 for x in s for w in x.words]
        with open(cache, 'w', encoding='utf-8') as fh:
            json.dump(words, fh, indent=1, ensure_ascii=False)

    db, thr, floor, loud = envelope(aroll)
    bounds = [(s['frame'] / 30, (s['frame'] + s['frames']) / 30, s) for s in segs]

    def seg_at(t):
        return next((b for b in bounds if b[0] <= t < b[1]), bounds[-1])

    def src(t):
        a, _, s = seg_at(t)
        return f"{s['clip']} {s['src_in'] + (t - a):.2f}s"

    issues = []   # (cut_start, cut_end, kind, detail, remove?)
    # PAUSA: quiet stretches inside a segment (the edges belong to the cut, handled by CORTADA / in-out points)
    for a, b, s in bounds:
        for qa, qb in quiet_runs(db, thr, a + .08, b - .08, max_pause):
            issues.append((qa, qb, 'PAUSA', f'{qb - qa:.2f}s de silencio', True))
    # MULETILLA / REPETIDA / DUDOSA from the words
    toks = [norm(w['text']) for w in words]
    for i, w in enumerate(words):
        t = toks[i]
        # words that are also normal Spanish ("con ESTE taller", "BUENO para", "PUES claro") count as filler only when
        # a pause or a comma follows them
        ambiguous = {'este', 'bueno', 'pues', 'digamos', 'like', 'so', 'basically', 'actually'}
        pause_after = i + 1 >= len(words) or words[i + 1]['start'] - w['end'] > .25 or w['text'].rstrip()[-1:] in ',.…'
        if (t in fillers and (t not in ambiguous or pause_after)) or (i + 1 < len(words) and f'{t} {toks[i + 1]}' in fillers):
            issues.append((w['start'], w['end'], 'MULETILLA', f'"{w["text"]}"', True))
        if i and t and t == toks[i - 1] and t not in {'no', 'sí', 'si'}:
            issues.append((words[i - 1]['start'], w['start'], 'REPETIDA', f'"{words[i - 1]["text"]} {w["text"]}"', True))
        for n in (2, 3):   # restart: the same 2-3 word phrase said twice in a row
            if i >= 2 * n - 1 and toks[i - n + 1:i + 1] == toks[i - 2 * n + 1:i - n + 1] and all(toks[i - n + 1:i + 1]):
                a = words[i - 2 * n + 1]['start']
                issues.append((a, words[i - n + 1]['start'], 'REPETIDA', 'frase repetida: "' + ' '.join(x['text'] for x in words[i - n + 1:i + 1]) + '"', True))
        if w.get('p', 1) < 0.45 and t not in fillers:
            issues.append((w['start'], w['end'], 'DUDOSA', f'"{w["text"]}" (seguridad {w["p"]:.0%}): escúchala, puede estar mal dicha', False))
    # CORTADA: speech right at a segment edge
    for a, b, s in bounds:
        for edge, name in ((a, 'empieza'), (b - HOP, 'termina')):
            i = int(edge / HOP)
            if 0 <= i < len(db) and db[i] > thr + 6:
                issues.append((edge, edge, 'CORTADA', f'el corte "{s["id"]}" {name} con voz encima: revisa que no se coma una sílaba', False))

    issues.sort()
    lines = [f'Ruido de fondo {floor:.0f} dB, voz ~{loud:.0f} dB, umbral de silencio {thr:.0f} dB', '']
    lines += [f'{a:6.2f}-{b:6.2f}  [{src(a)}]  {kind:9s} {detail}' for a, b, kind, detail, _ in issues] or ['Sin errores encontrados.']
    lines += ['', 'Transcripción con seguridad por palabra (* = dudosa):',
              ' '.join(f"{w['text']}{'*' if w.get('p', 1) < .45 else ''}@{w['start']:.2f}" for w in words)]
    with open(os.path.join(proj, 'errors.txt'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines) + '\n')
    print('\n'.join(lines[:-2]))

    # edl_tight.json: split segments around every removable stretch
    removals = sorted((a + (keep / 2 if kind == 'PAUSA' else 0), b - (keep / 2 if kind == 'PAUSA' else 0))
                      for a, b, kind, _, rm in issues if rm and b - a > (keep if kind == 'PAUSA' else 0))
    out = []
    for a, b, s in bounds:
        cur = a
        cuts = [(max(ra, a), min(rb, b)) for ra, rb in removals if rb > a and ra < b]
        for k, (ra, rb) in enumerate(cuts + [(b, b)]):
            if ra - cur > .15:
                piece = {k2: v for k2, v in s.items() if k2 not in ('frame', 'frames', 'src_in', 'src_out')}
                piece.update({'id': s['id'] if not out or out[-1]['id'].split('_')[0] != s['id'] else f"{s['id']}_{k}",
                              'in': round(s['src_in'] + (cur - a), 3), 'out': round(s['src_in'] + (ra - a), 3)})
                out.append(piece)
            cur = rb
    with open(os.path.join(proj, 'edl_tight.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
    old = sum(s['frames'] for s in segs) / 30
    new = sum(p['out'] - p['in'] for p in out)
    print(f'\nedl_tight.json: {len(out)} segmentos, {old:.2f}s -> {new:.2f}s ({old - new:.2f}s menos)')


if __name__ == '__main__':
    main()
