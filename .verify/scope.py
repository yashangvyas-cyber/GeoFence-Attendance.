#!/usr/bin/env python3
"""Drop app chrome from a page before scoring.

verify_fidelity.py compares whole documents. A feature prototype never reproduces the
offline splash, the All Apps flyout, the notification modal, the header widgets or
recaptcha — so those drown the signal. This removes them from BOTH sides so the score
reflects the screen actually being built.
"""
import re, sys

SHELL_BLOCKS = [
    r'<div class="fixed top-0 left-0 w-screen z-\[999\][^"]*"[\s\S]*?</div>\s*</div>\s*</div>',
    r'<div class="scale-90 opacity-0 pointer-events-none w-\[400px\][\s\S]*?</div>\s*</div>\s*</div>',
    r'<textarea[^>]*g-recaptcha-response[\s\S]*?</textarea>',
    r'<div[^>]*class="[^"]*recaptcha[^"]*"[\s\S]*?</div>',
]

def scope(src, dst):
    h = open(src, encoding='utf-8', errors='ignore').read()
    b = re.search(r'<body[^>]*>([\s\S]*)</body>', h)
    body = b.group(1) if b else h
    for pat in SHELL_BLOCKS:
        body = re.sub(pat, '', body, flags=re.I)
    open(dst, 'w').write(f'<html><body>{body}</body></html>')
    return len(body)

if __name__ == '__main__':
    print(f'  {sys.argv[1].split("/")[-1]} -> {scope(sys.argv[1], sys.argv[2])//1024} KB')
