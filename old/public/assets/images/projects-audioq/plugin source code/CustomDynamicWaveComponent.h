#pragma once
#include <JuceHeader.h>

/**
 * CustomDynamicWaveComponent
 *
 * A real-time waveform display component that:
 *  - Uses a circular buffer of amplitudes,
 *  - Paints vertical lines that represent amplitude over time,
 *  - Fades out if no new data arrives for a certain time (to visually indicate inactivity).
 */
class CustomDynamicWaveComponent : public juce::Component,
    private juce::Timer
{
public:
    CustomDynamicWaveComponent();
    ~CustomDynamicWaveComponent() override;

    /**
     * Pushes audio samples into the circular amplitude buffer.
     * This is typically called on the GUI thread with data from the plugin.
     */
    void pushBuffer(const juce::AudioBuffer<float>& sourceBuffer);

private:
    //==============================================================================
    /** Timer callback that periodically repaints, applying a fade-out if data is old. */
    void timerCallback() override;

    /** Draw the wave. */
    void paint(juce::Graphics& g) override;

    /** If resized, nothing special to do here. */
    void resized() override;

    //==============================================================================
    // Circular buffer
    std::vector<float> amplitudeBuffer;
    int bufferSize = 2048;
    int writePos = 0;

    // Fade-out
    juce::uint64 lastDataArrivalTime = 0;
    const float  fadeFactor = 0.95f;   // multiplier per timer tick
    const int    minFadeOutMs = 1000;    // fade if no data for this many ms

    juce::CriticalSection bufferLock;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(CustomDynamicWaveComponent)
};
