#pragma once

#include <JuceHeader.h>
#include <functional>
#include <vector>

/**
 * AudioFilePlayer
 *
 * A class for loading and playing audio files in JUCE, using:
 *  - AudioFormatReader -> AudioFormatReaderSource -> AudioTransportSource,
 *  - ResamplingAudioSource for speed/pitch changes,
 *  - "Random Mode" or "Granular Mode" to automatically jump around the file in small or medium loops,
 *  - Offline buffer for displaying the waveform.
 *
 * It also provides region-based looping with optional crossfades and random region generation.
 */
struct Grain
{
    // Old struct for multi-grain usage, not used in the new approach.
    long long offlineStart = 0;
    int       totalSamples = 0;
    int       cursor = 0;
    int       startOffsetInBlock = 0;
};

class AudioFilePlayer : private juce::ChangeListener
{
public:
    AudioFilePlayer();
    ~AudioFilePlayer();

    //==============================================================================
    // Loading files
    //==============================================================================
    /**
     * Load an audio file into the transport. Returns true on success.
     */
    bool loadFile(const juce::File& file);

    /**
     * Load an audio file into offlineBuffer (for waveform display).
     */
    bool loadFileToBuffer(const juce::File& file);

    //==============================================================================
    // Transport / Playback
    //==============================================================================
    void start();
    void stop();
    bool isPlaying() const;
    void setResamplingRatio(double ratio);

    // Position
    void setPosition(double newTimeSec);
    double getPosition() const;
    double getLength()   const;

    // Prepare & Release
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& info);
    void prepareToPlay(int samplesPerBlock, double sampleRate);
    void releaseResources();

    //==============================================================================
    // Looping
    //==============================================================================
    void setLooping(bool shouldLoop);
    void setRegionLoop(double startSec, double endSec, bool enable);

    // Offline buffer for display
    const juce::AudioBuffer<float>& getOfflineBuffer() const { return offlineBuffer; }

    //==============================================================================
    // Random / Granular
    //==============================================================================
    void setRandomMode(bool shouldEnable);
    bool isRandomMode() const { return randomMode; }

    void setGranularMode(bool enable);
    bool isGranularMode() const { return granularMode; }

    // Parameters used if needed
    void setGrainSize(float sizeSec) { grainSizeSec = sizeSec; }
    void setGrainDensity(float density) { grainDensity = density; }

    // Callback for region highlight changes
    std::function<void(double startNorm,
        double endNorm,
        juce::Colour regionColour,
        juce::Colour playheadColour)> onRandomRegionChanged;

    // Crossfade time in ms for looping transitions
    void setCrossfadeTimeMs(double ms);

private:
    /** Internal callback for changes in AudioTransportSource. */
    void changeListenerCallback(juce::ChangeBroadcaster* src) override;

    /**
     * Generate a new random region. The length depends on whether we are
     * in randomMode (bigger) or granularMode (smaller).
     */
    void generateRandomRegion();

    /** Fades out the last portion of a block for crossfade. */
    void fadeOut(const juce::AudioSourceChannelInfo& info, int fadeSamps);

    /** Fades in the next portion of a block for crossfade. */
    void fadeIn(const juce::AudioSourceChannelInfo& info, int fadeSamps);

    // Old multi-grain approach (not used now)
    void spawnNewGrains(int) {}
    void mixGrains(juce::AudioSourceChannelInfo&) {}

    //==============================================================================
    // Internal objects
    //==============================================================================
    juce::AudioFormatManager formatManager;
    juce::TimeSliceThread    thread;

    juce::AudioTransportSource                     transport;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
    juce::ResamplingAudioSource                    resamplingSource;

    double currentSampleRate = 0.0;

    // Region-based loop
    bool   looping = false;
    bool   useRegionLoop = false;
    double regionStartSec = 0.0;
    double regionEndSec = 0.0;

    // File info
    double    loadedSampleRate = 0.0;
    long long loadedLengthInSamples = 0;
    double    loadedLengthInSeconds = 0.0;

    // Offline buffer for waveform
    juce::AudioBuffer<float> offlineBuffer;

    // Random / Granular
    bool randomMode = false;
    bool granularMode = false;

    float grainSizeSec = 0.05f;
    float grainDensity = 3.0f;

    int crossfadeSamples = 0;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioFilePlayer)
};
