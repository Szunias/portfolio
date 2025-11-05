#pragma once

#include <JuceHeader.h>
#include <vector>
#include <functional>

/**
 * ColorizedOfflineWaveComponent
 *
 * A component that displays a static offline audio buffer in a colorful waveform.
 * - Single-click sets the playhead position (calls onPlayheadDragged callback),
 * - Mouse drag selects a region (calls onRegionSelected callback).
 * - The waveform can be colorized based on amplitude.
 */
class ColorizedOfflineWaveComponent : public juce::Component
{
public:
    ColorizedOfflineWaveComponent();
    ~ColorizedOfflineWaveComponent() override;

    /** Pass in the audio buffer to display; it will create an internal “envelope” representation. */
    void setOfflineBuffer(const juce::AudioBuffer<float>& buf);

    /** Update the playhead marker (0..1). */
    void setPlayheadPosition(double pos);
    double getPlayheadPosition() const { return playheadPos; }

    /** Callback if the user single-clicks to move the playhead. */
    void setPlayheadCallback(std::function<void(double)> callback) { onPlayheadDragged = callback; }

    /** Callback if the user selects a region via drag. */
    void setRegionSelectedCallback(std::function<void(double, double)> callback) { onRegionSelected = callback; }

    //==============================================================================
    // JUCE overrides
    //==============================================================================
    void paint(juce::Graphics& g) override;
    void resized() override;

    //==============================================================================
    // Appearance
    //==============================================================================
    /** Set the color used for the region highlight. */
    void setRegionColor(juce::Colour c);

    /** Set the color used for the playhead line. */
    void setPlayheadColor(juce::Colour c);

    /**
     * Asynchronously set a region highlight in [0..1],
     * e.g., used by random/granular mode to highlight chosen loop region.
     */
    void setRegionSelectionNormalized(double startNorm, double endNorm);

private:
    /** Rebuilds an amplitude envelope from offlineBuffer for drawing. */
    void rebuildEnvelope();

    // Mouse events for single-click and dragging
    void mouseDown(const juce::MouseEvent& event) override;
    void mouseDrag(const juce::MouseEvent& event) override;
    void mouseUp(const juce::MouseEvent& event) override;

    // Offline buffer data
    juce::AudioBuffer<float> offlineBuffer;
    std::vector<float> envelope;

    double playheadPos = 0.0;
    std::function<void(double)> onPlayheadDragged;

    bool   isSelectingRegion = false;
    double regionStartNorm = 0.0;
    double regionEndNorm = 0.0;
    float  mouseDownX = 0.0f;
    bool   mouseMoved = false;

    std::function<void(double, double)> onRegionSelected;
    static constexpr float dragThreshold = 5.0f; // px threshold to detect region drag

    juce::CriticalSection bufferLock;

    // Appearance
    juce::Colour regionSelectionColour = juce::Colours::yellow.withAlpha(0.25f);
    juce::Colour playheadColour = juce::Colours::limegreen;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(ColorizedOfflineWaveComponent)
};
