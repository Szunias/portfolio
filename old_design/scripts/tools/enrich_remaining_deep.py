import json
import os

data_file = 'portfolio-next/src/data/portfolioData.json'
pl_file = 'portfolio-next/public/locales/pl/translation.json'

# --- RICH CONTENT DATA ---
updates = {
    "audioq": {
        "code_snippets": [
            {
                "title": "Audio Processing Block (C++/JUCE)",
                "language": "cpp",
                "description": "Core DSP processing loop handling the parametric EQ filters buffer by buffer.",
                "code": "void AudioQAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)\n{\n    juce::ScopedNoDenormals noDenormals;\n    auto totalNumInputChannels  = getTotalNumInputChannels();\n    auto totalNumOutputChannels = getTotalNumOutputChannels();\n\n    // Clear clear output channels that don't contain input data\n    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)\n        buffer.clear (i, 0, buffer.getNumSamples());\n\n    // Apply EQ Filters chain\n    updateFilters(); \n\n    for (int channel = 0; channel < totalNumInputChannels; ++channel)\n    {\n        auto* channelData = buffer.getWritePointer (channel);\n        \n        // Process through LowCut, Peak, and HighCut filters\n        lowCutFilter.process(channelData, buffer.getNumSamples());\n        peakFilter.process(channelData, buffer.getNumSamples());\n        highCutFilter.process(channelData, buffer.getNumSamples());\n    }\n}"
            },
            {
                "title": "Spectrum Analysis FFT",
                "language": "cpp",
                "description": "Pushing samples to the FFT data generator for visualizer rendering.",
                "code": "void AudioQAudioProcessor::pushNextSampleIntoFifo (float sample) noexcept\n{\n    if (fifoIndex == fftSize)\n    {\n        if (! nextFFTBlockReady)\n        {\n            juce::zeromem (fftData, sizeof (fftData));\n            memcpy (fftData, fifo, sizeof (fifo));\n            nextFFTBlockReady = true;\n        }\n        fifoIndex = 0;\n    }\n    fifo[fifoIndex++] = sample;\n}"
            }
        ],
        "links": {
            "repo": "https://github.com/Szunias/AudioQ" 
        }
    },
    "wwise_unreal_fixer": {
        "code_snippets": [
            {
                "title": "Reference Scanner (Python)",
                "language": "python",
                "description": "Scans Unreal Engine assets for broken Wwise AkAudio references.",
                "code": "def scan_for_broken_refs(project_dir):\n    broken_files = []\n    for root, dirs, files in os.walk(project_dir):\n        for file in files:\n            if file.endswith(\".uasset\"):\n                path = os.path.join(root, file)\n                with open(path, 'rb') as f:\n                    content = f.read()\n                    # Look for AkAudioEvent signature but missing valid index\n                    if b'AkAudioEvent' in content and b'None' in content:\n                        broken_files.append(path)\n    return broken_files"
            }
        ],
        "full_description": "A lifesaver tool for Unreal Audio integration.\n\nWhen migrating Wwise projects or collaborating via Perforce, Unreal often loses track of Wwise assets (SoundBanks, Events), resulting in silent actors. This tool automates the detection and re-linking process by parsing binary uasset headers and forcing a refresh of the Wwise picker database."
    },
    "unreal_engine_rebuilder": {
        "code_snippets": [
            {
                "title": "Clean & Rebuild Logic (Batch)",
                "language": "batch",
                "description": "Automates the deletion of intermediate/derived data caches to force a clean engine rebuild.",
                "code": "@echo off\necho Cleaning Unreal Engine Intermediate Files...\n\nRMDIR /S /Q \"Intermediate\"\nRMDIR /S /Q \"Binaries\"\nRMDIR /S /Q \"DerivedDataCache\"\nRMDIR /S /Q \"Saved\"\n\necho Regenerating Project Files...\n\"%UE5_ENGINE_PATH%\\Build\\BatchFiles\\Build.bat\" -project=\"%PROJECT_PATH%\" -progress\n\necho Build Complete.\npause"
            }
        ],
        "full_description": "DevOps automation for game developers.\n\nUnreal Engine frequently encounters 'corrupt' intermediate files that cause linker errors. This tool creates a 'Factory Reset' state for the project's build environment without touching actual assets, saving developers from manually deleting folders and regenerating solution files."
    },
    "interactive_music": {
        "full_description": "Complex Wwise Interactive Music Hierarchy.\n\nDesigned to demonstrate proficiency in non-linear composition. The system uses a 'Music Switch Container' as the root, branching into 'Playlists' for each game state (Exploration, Combat, Stealth). \n\nTransitions are handled via specific 'Exit Cues' to ensure musicality, rather than immediate crossfades. 'Stingers' (musical overlays) are triggered on top of the base loop for momentary feedback (e.g., enemy spotted) without breaking the groove.",
        "code_snippets": [
             {
                "title": "Wwise Logic Structure",
                "language": "yaml",
                "description": "Pseudo-structure of the Wwise hierarchy.",
                "code": "Music Switch Container: Global_Music\n  ├── State: Exploration (110 BPM)\n  │     └── Playlist: Ambient_Loop\n  │           ├── Track: Pads (Volume: 0dB)\n  │           └── Track: Percussion_Light (RTPC: Intensity -> Volume)\n  ├── State: Combat (140 BPM)\n  │     └── Playlist: Battle_Loop\n  │           ├── Track: Aggressive_Bass\n  │           ├── Track: Heavy_Drums\n  │           └── Track: Arp_Synth (Random Container)\n  └── Transition Rules:\n        Exploration -> Combat: Next Bar, Crossfade 500ms\n        Combat -> Exploration: Exit Cue, Post-Exit Tail"
            }
        ]
    }
}

# --- EXECUTION ---

# 1. Update JSON Data
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_projects(list_key):
    for p in data.get(list_key, []):
        pid = p['id']
        if pid in updates:
            p.update(updates[pid])
            print(f"Enriched {pid}")

update_projects('featured_projects')
update_projects('additional_projects')

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 2. Update Translations (Optional PL descriptions for these deep dives)
# I will inject these specific descriptions to PL translation file to avoid english fallback
pl_updates = {
    "project_audioq_full_desc": "W pełni funkcjonalna wtyczka VST Equalizer. Pętla przetwarzania DSP obsługuje filtry parametryczne bufor po buforze, a analiza FFT generuje dane dla wizualizera w czasie rzeczywistym.",
    "project_wwise_unreal_fixer_full_desc": "Narzędzie ratujące życie przy integracji Wwise. Automatyzuje wykrywanie i ponowne łączenie zgubionych referencji (SoundBanks, Events) poprzez parsowanie nagłówków plików uasset.",
    "project_unreal_engine_rebuilder_full_desc": "Automatyzacja DevOps dla developerów gier. Usuwa pliki tymczasowe (Intermediate, Binaries) i regeneruje pliki projektu, naprawiając błędy linkera bez ryzyka utraty assetów.",
    "project_interactive_music_full_desc": "Złożona hierarchia muzyczna w Wwise. Wykorzystuje Music Switch Container jako korzeń, rozgałęziając się na playlisty dla stanów gry. Przejścia oparte na Exit Cues zapewniają muzykalność."
}

if os.path.exists(pl_file):
    with open(pl_file, 'r', encoding='utf-8') as f:
        pl_data = json.load(f)
    
    pl_data.update(pl_updates)
    
    with open(pl_file, 'w', encoding='utf-8') as f:
        json.dump(pl_data, f, indent=2, ensure_ascii=False)
    print("Updated PL translations for deep dives.")

print("Deep Enrichment Complete.")
