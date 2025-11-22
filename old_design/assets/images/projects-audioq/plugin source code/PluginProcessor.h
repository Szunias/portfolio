#pragma once

#include <JuceHeader.h>
#include "AudioFilePlayer.h"
#include "MyLookAndFeel.h"

/**
 * NewProjectAudioProcessor
 *
 * Main audio processing class that manages:
 *  - AudioFilePlayer for playback,
 *  - High-pass / Low-pass filters,
 *  - A compressor,
 *  - Gain & tempo (via resampling),
 *  - Granular (grainSize/grainDensity),
 *  - Manual tremolo effect (enabled via a toggle, with rate/depth),
 *  - A buffer for real-time waveform visualization,
 *  - Detecting dangerously loud volume and stopping audio if it exceeds a threshold.
 */
class NewProjectAudioProcessor : public juce::AudioProcessor
{
public:
    NewProjectAudioProcessor();
    ~NewProjectAudioProcessor() override;

    //==============================================================================
    // Standard JUCE overrides
    //==============================================================================
    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

#ifndef JucePlugin_PreferredChannelConfigurations
    /** Restrict the plugin to stereo. */
    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
#endif

    /** The main audio callback: fetch from AudioFilePlayer and apply effects. */
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    bool hasEditor() const override;
    juce::AudioProcessorEditor* createEditor() override;

    //==============================================================================
    // Basic info
    //==============================================================================
    const juce::String getName() const override;
    bool acceptsMidi()  const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    // Programs (unused in this example)
    //==============================================================================
    int  getNumPrograms()                                         override;
    int  getCurrentProgram()                                      override;
    void setCurrentProgram(int index)                             override;
    const juce::String getProgramName(int index)                  override;
    void changeProgramName(int index, const juce::String& newName) override;

    //==============================================================================
    // State management
    //==============================================================================
    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    //==============================================================================
    // Accessors
    //==============================================================================
    juce::AudioProcessorValueTreeState& getAPVTS() { return apvts; }
    AudioFilePlayer& getAudioFilePlayer() { return audioFilePlayer; }

    /**
     * Thread-safe method to retrieve the buffer used for real-time wave visualization.
     */
    void getVisualizerBuffer(juce::AudioBuffer<float>& outBuffer);

    //==============================================================================
    // Volume Safety
    //==============================================================================
    bool isDangerousVolumeDetected() const { return dangerousVolumeDetected; }
    void setDangerousVolumeDetected(bool shouldStop) { dangerousVolumeDetected = shouldStop; }

    //==============================================================================
    // Tremolo on/off
    //==============================================================================
    void setTremoloEnabled(bool enable) { tremoloOn = enable; }

private:
    /** Creates the set of parameters used by AudioProcessorValueTreeState. */
    static juce::AudioProcessorValueTreeState::ParameterLayout createParameters();

    //==============================================================================
    // File player
    AudioFilePlayer audioFilePlayer;

    // Filters
    juce::dsp::StateVariableTPTFilter<float> lpf;
    juce::dsp::StateVariableTPTFilter<float> hpf;

    // Compressor
    juce::dsp::Compressor<float> compressor;

    // Parameter storage
    juce::AudioProcessorValueTreeState apvts;

    // Real-time visualization buffer
    juce::AudioBuffer<float> visualizerBuffer;
    juce::CriticalSection    bufferLock;

    // Volume safety
    bool dangerousVolumeDetected = false;

    // Manual Tremolo
    bool  tremoloOn = false;
    float tremoloPhase = 0.0f;
    double currentSR = 44100.0;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(NewProjectAudioProcessor)
};
