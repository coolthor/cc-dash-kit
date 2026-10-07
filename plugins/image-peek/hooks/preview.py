"""Turn a pasted image into a PNG the terminal can draw.

argv[1] is a file path, or '-' to read base64 image bytes from stdin.
Prints {"png": <path>, "width": w, "height": h} as JSON.
"""
import base64
import hashlib
import json
import os
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is not installed: python3 -m pip install Pillow')

MAX_SIDE = 1024


def main():
    arg = sys.argv[1]
    data = base64.b64decode(sys.stdin.read()) if arg == '-' else open(arg, 'rb').read()
    digest = hashlib.sha256(data).hexdigest()[:16]
    out = os.path.join(tempfile.gettempdir(), f'image-peek-{digest}.png')
    if arg == '-':
        src = os.path.join(tempfile.gettempdir(), f'image-peek-{digest}.bin')
        with open(src, 'wb') as f:
            f.write(data)
    else:
        src = arg
    with Image.open(src) as image:
        width, height = image.size
        if not os.path.exists(out):
            thumb = image.convert('RGBA') if image.mode not in ('RGB', 'RGBA') else image.copy()
            thumb.thumbnail((MAX_SIDE, MAX_SIDE))
            thumb.save(out, 'PNG')
    if arg == '-':
        os.remove(src)
    print(json.dumps({'png': out, 'width': width, 'height': height}))


if __name__ == '__main__':
    main()
