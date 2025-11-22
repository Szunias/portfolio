#include "ColorizedOfflineWaveComponent.h"

/**
 * ColorizedOfflineWaveComponent.cpp
 *
 * Implementation of an offline buffer waveform display. It shows:
 *  - A colorized waveform (colors vary with amplitude),
 *  - A draggable region selection,
 *  - A playhead line.
 */

ColorizedOfflineWaveComponent::ColorizedOfflineWaveComponent()
{
    setMouseCursor(juce::MouseCursor::PointingHandCursor);
}

ColorizedOfflineWaveComponent::~ColorizedOfflineWaveComponent() {}

void ColorizedOfflineWaveComponent::setOfflineBuffer(const juce::AudioBuffer<float>& buf)
{
    {
        juce::ScopedLock sl(bufferLock);
        offlineBuffer.makeCopyOf(buf, true);
        rebuildEnvelope();
    }
    repaint();
}

void ColorizedOfflineWaveComponent::setPlayheadPosition(double pos)
{
    {
        juce::ScopedLock sl(bufferLock);
        playheadPos = juce::jlimit(0.0, 1.0, pos);
    }
    repaint();
}

void ColorizedOfflineWaveComponent::rebuildEnvelope()
{
    envelope.clear();

    int numSamples = offlineBuffer.getNumSamples();
    int numCh = offlineBuffer.getNumChannels();
    if (numSamples < 1 || numCh < 1)
        return;

    // We'll create a 1024-point envelope
    const int envResolution = 1024;
    envelope.resize((size_t)envResolution, 0.0f);

    for (int i = 0; i < envResolution; ++i)
    {
        int start = i * numSamples / envResolution;
        int end = (i + 1) * numSamples / envResolution;
        if (end > numSamples)
            end = numSamples;

        float peak = 0.0f;
        for (int ch = 0; ch < numCh; ++ch)
        {
            const float* data = offlineBuffer.getReadPointer(ch);
            for (int s = start; s < end; ++s)
            {
                float a = std::abs(data[s]);
                if (a > peak)
                    peak = a;
            }
        }
        envelope[(size_t)i] = juce::jlimit(0.0f, 1.0f, peak);
    }
}

void ColorizedOfflineWaveComponent::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::darkgrey.darker(0.6f));

    // Copy data locally for thread safety
    std::vector<float> localEnv;
    double localPlayhead = 0.0;
    double selStart = 0.0, selEnd = 0.0;
    juce::Colour localRegionColour, localPlayheadColour;

    {
        juce::ScopedLock sl(bufferLock);
        localEnv = envelope;
        localPlayhead = playheadPos;
        selStart = std::min(regionStartNorm, regionEndNorm);
        selEnd = std::max(regionStartNorm, regionEndNorm);
        localRegionColour = regionSelectionColour;
        localPlayheadColour = playheadColour;
    }

    if (localEnv.empty())
    {
        g.setColour(juce::Colours::white);
        g.drawFittedText("No file loaded or empty buffer!",
            getLocalBounds(),
            juce::Justification::centred,
            1);
        return;
    }

    auto bounds = getLocalBounds().toFloat();
    float w = bounds.getWidth();
    float h = bounds.getHeight();
    int envSz = (int)localEnv.size();

    // Draw region highlight
    if (selEnd > selStart + 0.000001)
    {
        float rx1 = bounds.getX() + (float)selStart * w;
        float rx2 = bounds.getX() + (float)selEnd * w;
        g.setColour(localRegionColour);
        g.fillRect(rx1, bounds.getY(), rx2 - rx1, bounds.getHeight());
    }

    // Draw waveform
    for (int i = 0; i < envSz; ++i)
    {
        float x = (float)i / (float)envSz * w;
        float amp = localEnv[(size_t)i];

        // Simple amplitude-based color transitions
        juce::Colour c;
        if (amp < 0.25f)
        {
            // Light green to green
            juce::Colour lightGreen = juce::Colour(144, 238, 144);
            c = lightGreen.interpolatedWith(juce::Colours::green, amp / 0.25f);
        }
        else if (amp < 0.5f)
        {
            c = juce::Colours::green.interpolatedWith(juce::Colours::white, (amp - 0.25f) / 0.25f);
        }
        else if (amp < 0.75f)
        {
            c = juce::Colours::white.interpolatedWith(juce::Colours::yellow, (amp - 0.5f) / 0.25f);
        }
        else
        {
            c = juce::Colours::yellow.interpolatedWith(juce::Colours::red, (amp - 0.75f) / 0.25f);
        }
        g.setColour(c);

        float halfH = h * 0.5f;
        float midY = bounds.getY() + halfH;
        float mag = amp * halfH;

        g.drawLine(x, midY - mag, x, midY + mag, 1.0f);
    }

    // Draw the playhead line
    if (localPlayhead >= 0.0 && localPlayhead <= 1.0)
    {
        float px = bounds.getX() + (float)localPlayhead * w;
        g.setColour(localPlayheadColour);
        g.drawLine(px, bounds.getY(), px, bounds.getBottom(), 2.0f);
    }
}

void ColorizedOfflineWaveComponent::resized()
{
    // No sub-components to arrange
}

void ColorizedOfflineWaveComponent::mouseDown(const juce::MouseEvent& event)
{
    mouseDownX = (float)event.getMouseDownX();
    mouseMoved = false;

    float x = (float)event.getPosition().x;
    float w = (float)getWidth();
    float norm = juce::jlimit(0.0f, 1.0f, x / w);

    {
        juce::ScopedLock sl(bufferLock);
        regionStartNorm = norm;
        regionEndNorm = norm;
        isSelectingRegion = false;
    }
}

void ColorizedOfflineWaveComponent::mouseDrag(const juce::MouseEvent& event)
{
    float distX = std::abs((float)event.getDistanceFromDragStartX());
    if (distX > dragThreshold)
        mouseMoved = true;

    float x = (float)event.getPosition().x;
    float w = (float)getWidth();
    float norm = juce::jlimit(0.0f, 1.0f, x / w);

    if (mouseMoved)
    {
        juce::ScopedLock sl(bufferLock);
        isSelectingRegion = true;
        regionEndNorm = norm;
    }

    repaint();
}

void ColorizedOfflineWaveComponent::mouseUp(const juce::MouseEvent& event)
{
    float x = (float)event.getPosition().x;
    float w = (float)getWidth();
    float norm = juce::jlimit(0.0f, 1.0f, x / w);

    double startVal, endVal;
    bool wasSelecting = false;

    {
        juce::ScopedLock sl(bufferLock);
        if (isSelectingRegion)
        {
            regionEndNorm = norm;
            wasSelecting = true;
            startVal = std::min(regionStartNorm, regionEndNorm);
            endVal = std::max(regionStartNorm, regionEndNorm);
        }
        else
        {
            // Single click => set playhead
            playheadPos = norm;
        }
    }

    repaint();

    if (!wasSelecting)
    {
        // Single-click callback
        if (onPlayheadDragged)
            onPlayheadDragged(norm);
    }
    else
    {
        // Region-selected callback
        if (onRegionSelected && endVal > startVal + 0.000001)
            onRegionSelected(startVal, endVal);
    }
}

void ColorizedOfflineWaveComponent::setRegionColor(juce::Colour c)
{
    juce::ScopedLock sl(bufferLock);
    regionSelectionColour = c;
}

void ColorizedOfflineWaveComponent::setPlayheadColor(juce::Colour c)
{
    juce::ScopedLock sl(bufferLock);
    playheadColour = c;
}

void ColorizedOfflineWaveComponent::setRegionSelectionNormalized(double startNorm, double endNorm)
{
    // Call asynchronously so we don't block the audio or cause thread conflicts
    juce::MessageManager::callAsync([this, startNorm, endNorm]()
        {
            juce::ScopedLock sl(bufferLock);
            regionStartNorm = juce::jlimit(0.0, 1.0, startNorm);
            regionEndNorm = juce::jlimit(0.0, 1.0, endNorm);
            isSelectingRegion = true;
            repaint();
        });
}
