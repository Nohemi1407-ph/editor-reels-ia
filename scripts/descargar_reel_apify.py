#!/usr/bin/env python3
"""Descarga un reel PÚBLICO de Instagram para estudiar su estilo (solo como referencia, nunca para republicarlo).

Usa el actor de Apify "apify/instagram-scraper" (cuenta gratis en apify.com). Tu token va en una variable de
entorno, NUNCA dentro de un archivo del repo:
    export APIFY_TOKEN="tu_token"          (Windows PowerShell:  $env:APIFY_TOKEN="tu_token")
Uso:
    python3 scripts/descargar_reel_apify.py https://www.instagram.com/reel/XXXXXXXX/ [--salida referencias]
Guarda <codigo>.mp4 y <codigo>.json (datos del post). Si Claude Code tiene conectado Apify como conector, también
puede hacerlo él directamente con la misma entrada: {"directUrls": [url], "resultsType": "posts", "resultsLimit": 1}.
"""
import argparse
import json
import os
import re
import sys
import urllib.request

ACTOR = 'apify~instagram-scraper'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('url')
    ap.add_argument('--salida', default='referencias')
    a = ap.parse_args()
    token = os.environ.get('APIFY_TOKEN')
    if not token:
        sys.exit('Falta APIFY_TOKEN (mira la ayuda: python3 scripts/descargar_reel_apify.py -h)')
    body = json.dumps({'directUrls': [a.url], 'resultsType': 'posts', 'resultsLimit': 1}).encode()
    req = urllib.request.Request(f'https://api.apify.com/v2/acts/{ACTOR}/run-sync-get-dataset-items',
                                 data=body, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req, timeout=300) as r:
        items = json.load(r)
    if not items or not items[0].get('videoUrl'):
        sys.exit('No encontré video en ese link (¿es público? ¿es un reel?).')
    it = items[0]
    code = it.get('shortCode') or re.sub(r'\W+', '_', a.url.rstrip('/').split('/')[-1])
    os.makedirs(a.salida, exist_ok=True)
    mp4 = os.path.join(a.salida, f'{code}.mp4')
    urllib.request.urlretrieve(it['videoUrl'], mp4)
    with open(os.path.join(a.salida, f'{code}.json'), 'w', encoding='utf-8') as fh:
        json.dump(it, fh, ensure_ascii=False, indent=1)
    print('listo:', mp4)


if __name__ == '__main__':
    main()
