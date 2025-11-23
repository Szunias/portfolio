import json
import os
import sys

# Config
base_dir = 'portfolio-next/public'
data_file = 'portfolio-next/src/data/portfolioData.json'
tracks_file = 'portfolio-next/public/assets/audio/tracks.json'

missing_files = []

def check_file(path, context):
    if not path: return
    # Fix relative paths if they start with / or ./
    clean_path = path.lstrip('/').lstrip('\\')
    full_path = os.path.join(base_dir, clean_path)
    
    if not os.path.exists(full_path):
        # Try checking if it's a youtube link (ignore)
        if "youtube" in path or "http" in path:
            return
        missing_files.append(f"[{context}] Missing: {path}")

print("--- AUDITING ASSETS ---")

# 1. Check Portfolio Data
try:
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    projects = data.get('featured_projects', []) + data.get('additional_projects', [])
    
    for p in projects:
        pid = p.get('id', 'unknown')
        media = p.get('media', {})
        
        check_file(media.get('thumbnail'), f"Project {pid} Thumb")
        check_file(media.get('video'), f"Project {pid} Video")
        
        for img in media.get('images', []):
            check_file(img, f"Project {pid} Gallery")

except Exception as e:
    print(f"Error reading portfolioData: {e}")

# 2. Check Tracks
try:
    with open(tracks_file, 'r', encoding='utf-8') as f:
        tracks = json.load(f)
        
    for t in tracks:
        tid = t.get('title', 'unknown')
        check_file(t.get('cover'), f"Track {tid} Cover")
        for src in t.get('sources', []):
            check_file(src.get('url'), f"Track {tid} Audio")

except Exception as e:
    print(f"Error reading tracks.json: {e}")

print("--- AUDIT RESULTS ---")
if missing_files:
    print(f"FOUND {len(missing_files)} MISSING FILES:")
    for m in missing_files:
        print(m)
else:
    print("ALL ASSETS VERIFIED. PERFECT.")
