import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'
pl_file = 'portfolio-next/public/locales/pl/translation.json'

updates = {
    "transientica_audiolab": {
        "full_description": "Real-time ML beatbox detection system. Control rhythm games with your voice.\n\nOptimized audio buffer sizes and ML inference pipeline to stay well below the 60ms threshold for rhythm games. Decoupled Python analysis and Unity gameplay communicating via UDP/OSC ensures zero frame drops.\n\nSpectral Analysis: Kick drums are deep, snares have noise. I trained the system to recognize these spectral fingerprints along with temporal envelopes.",
        "media": {
            "thumbnail": "assets/images/projects/maxresdefault.jpg",
            "video": "assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4",
            "images": [
                "assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4" # Second video in gallery
            ]
        },
        "code_snippets": [
            {
                "title": "Real-time Inference Loop (Python)",
                "language": "python",
                "description": "Audio buffer processing and SVM classification.",
                "code": "def audio_callback(indata, frames, time, status):\n    if status:\n        print(status)\n    \n    # Add new data to ring buffer\n    ring_buffer.extend(indata[:, 0])\n    \n    # Extract features\n    features = extract_features(list(ring_buffer)[-BUFFER_SIZE:])\n    \n    # Predict\n    prediction = model.predict([features])[0]\n    \n    # Send OSC if confidence high\n    if prediction != 'silence':\n        client.send_message(\"/beatbox/trigger\", prediction)"
            }
        ]
    },
    "audioq": {
        "full_description": "JUCE-based audio sampler with granular synthesis, tremolo effects, and professional DSP processing.\n\nFeatures:\n- Granular Synthesis: Adjustable grain size and random playback.\n- Custom Tremolo: Per-sample LFO amplitude modulation.\n- Filter System: TPT (Topology-Preserving Transform) filters for zero-delay.\n- APVTS: Full parameter automation support.",
        "media": {
            "thumbnail": "assets/images/projects-audioq/AudioQPicture.png",
            "video": "assets/images/projects-audioq/AudioQ-Showcase.mp4",
            "images": [
                "assets/images/projects-audioq/AudioQLogo.jpeg",
                "assets/images/projects-audioq/plugin source code/PluginProcessor.cpp",
                "assets/images/projects-audioq/plugin source code/AudioFilePlayer.cpp"
            ]
        },
        "code_snippets": [
            {
                "title": "Tremolo DSP (C++)",
                "language": "cpp",
                "description": "Per-sample amplitude modulation using sine wave LFO.",
                "code": "for (int sample = 0; sample < numSamples; ++sample)\n{\n    float lfoVal = 0.5f + 0.5f * std::sin(tremoloPhase);\n    float amplitude = (1.0f - tremDepth) + (tremDepth * lfoVal);\n\n    for (int ch = 0; ch < numChannels; ++ch)\n    {\n        float* writePtr = buffer.getWritePointer(ch);\n        writePtr[sample] *= amplitude;\n    }\n\n    tremoloPhase += phaseInc;\n    if (tremoloPhase > juce::MathConstants<float>::twoPi)\n        tremoloPhase -= juce::MathConstants<float>::twoPi;\n}"
            }
        ]
    },
    "pause_and_deserve": {
        "links": {
            "video": "https://www.youtube.com/watch?v=bBuhTHrN81k"
        },
        "media": {
            "thumbnail": "assets/images/projects/deserve.webp",
            "video": "https://www.youtube.com/embed/bBuhTHrN81k", # YouTube
            "images": [
                "assets/images/projects-pausedeserve/redcorridor.png",
                "assets/images/projects-pausedeserve/caughtbydeath.png",
                "assets/images/projects-pausedeserve/deathapproaches.png"
            ]
        }
    },
    "amorak": {
        "full_description": "Atmospheric soundscapes and creature audio for horror animation.\n\nCreature Design: Layered roars from lions, elephants, tigers, and hippos. Low rumbles (40-120Hz) for presence, mid-range snarls for aggression.\n\nEnvironment: Dripping water, creaking wood, distant echoes. 3-layer ambience system adapts to camera distance.",
        "code_snippets": [
            {
                "title": "Spatial Logic (Concept)",
                "language": "text",
                "description": "Ambience layering logic based on camera distance.",
                "code": "Layer 1: Close (0-5m)\n- Dry footsteps\n- Water drips (Point Source)\n- Breathing\n\nLayer 2: Mid (5-20m)\n- Room Tone (Quad)\n- Distant pipes\n- Wood creaks (Random Container)\n\nLayer 3: Far (>20m)\n- Thunder rumble\n- Low frequency drone\n- Wind howl"
            }
        ],
        "links": {
            "video": "https://www.youtube.com/watch?v=VZgEK1CjlNM"
        }
    }
}

# --- EXECUTION ---

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_projects(list_key):
    for p in data.get(list_key, []):
        pid = p['id']
        if pid in updates:
            p.update(updates[pid])
            print(f"Enriched: {pid}")

update_projects('featured_projects')
update_projects('additional_projects')

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# --- PL Translation Update ---
pl_new = {
    "project_transientica_audiolab_full_desc": "System detekcji beatboxu w czasie rzeczywistym oparty na ML. Steruj grami rytmicznymi głosem.\n\nZoptymalizowane bufory (poniżej 60ms latencji). Osobna analiza Python (SVM) i rozgrywka Unity (UDP/OSC).\n\nAnaliza Spektralna: Kicki są niskie, werble szumią. Wytrenowałem system do rozpoznawania tych spektralnych odcisków palców.",
    "project_audioq_full_desc": "Sampler audio oparty na JUCE z syntezą granularną, efektami tremolo i profesjonalnym DSP.\n\nFunkcje:\n- Synteza Granularna: Regulowany rozmiar ziarna i losowe odtwarzanie.\n- Custom Tremolo: Modulacja amplitudy LFO na poziomie próbki.\n- System Filtrów: Filtry TPT (Topology-Preserving Transform) dla zerowego opóźnienia.\n- APVTS: Pełne wsparcie dla automatyzacji.",
    "project_amorak_full_desc": "Atmosferyczne pejzaże dźwiękowe i audio bestii do animacji horroru.\n\nDesign Bestii: Warstwowe ryki lwa, słonia, tygrysa i hipopotama. Niskie pomruki (40-120Hz) dla obecności, średnie warknięcia dla agresji.\n\nŚrodowisko: Kapiąca woda, skrzypiące drewno. 3-warstwowy system ambiencji adaptujący się do odległości kamery."
}

if os.path.exists(pl_file):
    with open(pl_file, 'r', encoding='utf-8') as f:
        pl_data = json.load(f)
    
    pl_data.update(pl_new)
    
    with open(pl_file, 'w', encoding='utf-8') as f:
        json.dump(pl_data, f, indent=2, ensure_ascii=False)
    print("Updated PL translations.")
