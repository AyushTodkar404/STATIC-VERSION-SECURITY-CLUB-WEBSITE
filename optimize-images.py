#!/usr/bin/env python3
"""
High-quality image optimizer for Security Club website gallery.
Preserves crystal-clear photo details while reducing file size to ~80-150 KB.
Usage:
    python optimize-images.py
"""

import os
import subprocess
from PIL import Image, ImageOps

MAX_DIMENSION = 1920
WEBP_QUALITY = 85

def optimize_directory(directory):
    count = 0
    for root, _, files in os.walk(directory):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png']:
                src_path = os.path.join(root, f)
                base = os.path.splitext(src_path)[0]
                webp_path = base + '.webp'
                
                try:
                    with Image.open(src_path) as im:
                        im = ImageOps.exif_transpose(im)
                        im = im.convert('RGB')
                        
                        # Resize only if larger than MAX_DIMENSION
                        if max(im.size) > MAX_DIMENSION:
                            scale = MAX_DIMENSION / max(im.size)
                            new_size = (int(round(im.size[0] * scale)), int(round(im.size[1] * scale)))
                            im = im.resize(new_size, Image.Resampling.LANCZOS)
                        
                        im.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
                        count += 1
                        print(f"Optimized: {f} -> {os.path.basename(webp_path)} ({os.path.getsize(webp_path) // 1024} KB)")
                except Exception as err:
                    print(f"Skipping {f}: {err}")
    return count

if __name__ == '__main__':
    gallery_dir = os.path.join(os.path.dirname(__file__), 'gallery')
    print(f"Optimizing gallery images in {gallery_dir}...")
    n = optimize_directory(gallery_dir)
    print(f"Finished optimizing {n} images.")
    
    # Automatically update manifest
    manifest_script = os.path.join(os.path.dirname(__file__), 'build-gallery-manifest.js')
    if os.path.exists(manifest_script):
        subprocess.run(['node', manifest_script], check=True)

