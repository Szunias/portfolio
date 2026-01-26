#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "MyLookAndFeel.h"
#include "DragDropOfflineWave.h"
#include "ColorizedOfflineWaveComponent.h"
#include "CustomDynamicWaveComponent.h"

/**
 * NewProjectAudioProcessorEditor
 *
 * This is the main GUI editor for the plugin. It contains:
 *  - Offline waveform display (ColorizedOfflineWaveComponent),
 *  - A drag-and-drop area (DragDropOfflineWave),
 *  - A bottom real-time waveform (CustomDynamicWaveComponent),
 *  - Various Sliders & Buttons for Gain, Tempo, HPF, LPF, Compressor, Granular, Tremolo, etc.
 *  - A volume-exceeded warning mechanism (if the audio is dangerously loud).
 */
class NewProjectAudioProcessorEditor : public juce::AudioProcessorEditor,
    private juce::Timer
{
public:
    NewProjectAudioProcessorEditor(NewProjectAudioProcessor&);
    ~NewProjectAudioProcessorEditor() override;

    /** Paints the main background and title. */
    void paint(juce::Graphics&) override;

    /** Called when the editor is resized; handles layout of subcomponents. */
    void resized() override;

    /** Updates the real-time visualizer with new audio data. */
    void updateVisualizer();

private:
    //==============================================================================
    /** Timer callback that runs periodically (25-30Hz) to update visuals. */
    void timerCallback() override;

    /** Toggles AudioFilePlayer playback start/stop. */
    void togglePlay();

    /** Toggles loop in the AudioFilePlayer. */
    void toggleLoop();

    //==============================================================================
    NewProjectAudioProcessor& audioProcessor; ///< Reference to the main processor

    MyLookAndFeel myLookAndFeel; ///< Our custom LookAndFeel instance

    //==============================================================================
    // Waveform components
    ColorizedOfflineWaveComponent topColorWave; ///< The top offline wave
    DragDropOfflineWave           topWaveDragDrop; ///< The drag-and-drop area
    CustomDynamicWaveComponent    bottomWave; ///< The bottom real-time wave

    //==============================================================================
    // Sliders & attachments (linking to APVTS parameters)
    juce::Slider gainSlider, tempoSlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> gainAttachment, tempoAttachment;

    juce::Slider lpfSlider, hpfSlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> lpfAttachment, hpfAttachment;

    // Compressor
    juce::Slider compThreshSlider, compRatioSlider, compAttackSlider, compReleaseSlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment>
        compThreshAttachment, compRatioAttachment, compAttackAttachment, compReleaseAttachment;

    // Granular
    juce::Slider grainSizeSlider, grainDensitySlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> grainSizeAttachment, grainDensityAttachment;

    // Tremolo
    juce::TextButton tremoloEnableButton{ "Tremolo On/Off" };
    juce::Slider tremoloRateSlider;
    juce::Slider tremoloDepthSlider;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> tremoloRateAttachment, tremoloDepthAttachment;

    //==============================================================================
    // Buttons
    juce::TextButton playButton{ "Play" };
    juce::TextButton loopButton{ "Loop" };

    //==============================================================================
    // Labels
    juce::Label gainLabel, tempoLabel;
    juce::Label lpfLabel, hpfLabel;
    juce::Label compThreshLabel, compRatioLabel, compAttackLabel, compReleaseLabel;
    juce::Label grainSizeLabel, grainDensityLabel;
    juce::Label tremoloRateLabel, tremoloDepthLabel;

    //==============================================================================
    // Volume-exceeded warning
    juce::Label     volumeExceededLabel;
    juce::TextButton continueButton{ "Continue" };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(NewProjectAudioProcessorEditor)
};
