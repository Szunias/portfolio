#pragma once

#include <JuceHeader.h>
#include "AudioFilePlayer.h"
#include "ColorizedOfflineWaveComponent.h"

/**
 * DragDropOfflineWave
 *
 * This component handles:
 *  1) Receiving WAV files via Drag & Drop,
 *  2) Loading those files into an AudioFilePlayer and displaying the waveform,
 *  3) Two toggle buttons for "Random Mode" and "Granular Mode".
 *
 * When a file is dropped, the audio file is loaded and displayed in a ColorizedOfflineWaveComponent.
 * Buttons appear to let the user switch between Random Mode (random looping of short/medium regions)
 * and Granular Mode (random looping of very short “grains”).
 */
class DragDropOfflineWave : public juce::Component,
    public juce::FileDragAndDropTarget
{
public:
    /**
     * Constructor
     * @param p - reference to the main AudioFilePlayer
     * @param offlineWaveRef - reference to the ColorizedOfflineWaveComponent that displays the waveform
     */
    DragDropOfflineWave(AudioFilePlayer& p, ColorizedOfflineWaveComponent& offlineWaveRef);

    /** Destructor */
    ~DragDropOfflineWave() override;

    //==============================================================================
    // FileDragAndDropTarget overrides
    //==============================================================================
    /** Called by JUCE to check if we are interested in the dragged files */
    bool isInterestedInFileDrag(const juce::StringArray& files) override;

    /** Called when a file or files enter the drag area */
    void fileDragEnter(const juce::StringArray& files, int x, int y) override;

    /** Called when the files leave the drag area without being dropped */
    void fileDragExit(const juce::StringArray& files) override;

    /** Called when the files are actually dropped */
    void filesDropped(const juce::StringArray& files, int x, int y) override;

    //==============================================================================
    // JUCE Component overrides
    //==============================================================================
    /** Paints the component (shows a hint text if no file is dropped yet) */
    void paint(juce::Graphics& g) override;

    /** Called whenever the component is resized, used to place buttons. */
    void resized() override;

private:
    /** Toggles "Random Mode" on/off, updates the button text. */
    void toggleRandomMode();

    /** Toggles "Granular Mode" on/off, updates the button text. */
    void toggleGranularMode();

    //==============================================================================
    // References / State
    //==============================================================================
    AudioFilePlayer& player;                          ///< AudioFilePlayer reference
    ColorizedOfflineWaveComponent& offlineWave;       ///< Waveform display reference

    bool isDraggingOver = false;                      ///< True if a file is being dragged over

    // Buttons for toggling modes
    juce::TextButton randomModeButton{ "Enable Random Mode" };
    bool isRandomModeOn = false;

    juce::TextButton granularModeButton{ "Enable Granular Mode" };
    bool isGranularModeOn = false;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DragDropOfflineWave)
};
