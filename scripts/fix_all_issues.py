import json

data_file = 'portfolio-next/src/data/portfolioData.json'

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. REMOVE interactive_music
# We filter it out from both lists
data['featured_projects'] = [p for p in data['featured_projects'] if p['id'] != 'interactive_music']
data['additional_projects'] = [p for p in data['additional_projects'] if p['id'] != 'interactive_music']

# 2. Fix Transientica (AudioLab) - Double Video
# We will use the main video as 'video' (header) and the second video as an item in 'images' array
# ProjectDetails.tsx already supports video in gallery if extension is mp4/webm
for p in data['featured_projects']:
    if p['id'] == 'transientica_audiolab':
        p['media']['video'] = "assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4"
        p['media']['images'] = [
            "assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4"
        ]
        p['media']['thumbnail'] = "assets/videos/AudioLab_preview.webm" # Animated thumb
        
        # Enrich text
        p['full_description'] = "Real-time ML beatbox detection system. Control rhythm games with your voice.\n\nOptimized audio buffer sizes and ML inference pipeline to stay well below the 60ms threshold for rhythm games. Decoupled Python analysis and Unity gameplay communicating via UDP/OSC ensures zero frame drops.\n\nSpectral Analysis: Kick drums are deep, snares have noise. I trained the system to recognize these spectral fingerprints along with temporal envelopes."

# 3. Fix AudioQ
for p in data['featured_projects']:
    if p['id'] == 'audioq':
        p['full_description'] += "\n\nTechnical Details:\n- Circular Buffer Implementation\n- FFT Windowing (Hanning)\n- Lock-free Parameter Updates (APVTS)\n- Custom Look-and-Feel GUI"
        # Ensure video is set
        p['media']['video'] = "assets/images/projects-audioq/AudioQ-Showcase.mp4"

# 4. Fix Pause & Deserve
for p in data['featured_projects']:
    if p['id'] == 'pause_and_deserve':
        p['links']['video'] = "https://www.youtube.com/watch?v=bBuhTHrN81k"
        p['media']['video'] = "https://www.youtube.com/embed/bBuhTHrN81k"

# 5. Fix Amorak
for p in data['featured_projects']:
    if p['id'] == 'amorak':
        p['full_description'] += "\n\nShadow Creatures: The creatures aren't just seen, they are heard. Their movement triggers a specific layer of 'shadow' sounds—reversed reverbs and granular whispers.\n\nVignette Pulse: The audio system is synced to the visual vignette effect. As the screen darkens, the low-pass filter on the environment closes, simulating the character's fear and focus."

# Save
with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("All issues fixed.")
