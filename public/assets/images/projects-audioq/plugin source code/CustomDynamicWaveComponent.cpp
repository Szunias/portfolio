#include "CustomDynamicWaveComponent.h"
/**
 * CustomDynamicWaveComponent
 *
 * A JUCE component for dynamically displaying an audio waveform:
 *  - Updates in real-time with incoming audio data.
 *  - Displays the waveform with a color gradient based on amplitude.
 *  - Fades out when no new data is received for a period of time.
 *  - Uses a circular buffer to store and display recent audio samples.
 *
 * Customizable appearance with a subtle gradient background and dynamic color changes
 * based on the waveform's amplitude. Periodic updates are handled using a timer.
 */

CustomDynamicWaveComponent::CustomDynamicWaveComponent()
{
    amplitudeBuffer.resize(bufferSize, 0.0f);
    startTimerHz(30);
}

CustomDynamicWaveComponent::~CustomDynamicWaveComponent()
{
    stopTimer();
}

void CustomDynamicWaveComponent::pushBuffer(const juce::AudioBuffer<float>& sourceBuffer)
{
    const int numSamples = sourceBuffer.getNumSamples();
    const int numChannels = sourceBuffer.getNumChannels();

    // Update last data arrival time
    lastDataArrivalTime = juce::Time::getMillisecondCounter();

    juce::ScopedLock sl(bufferLock);

    for (int i = 0; i < numSamples; ++i)
    {
        float maxSample = 0.0f;
        for (int ch = 0; ch < numChannels; ++ch)
        {
            float val = std::abs(sourceBuffer.getReadPointer(ch)[i]);
            if (val > maxSample)
                maxSample = val;
        }

        amplitudeBuffer[writePos] = maxSample;
        writePos = (writePos + 1) % bufferSize;
    }
}

void CustomDynamicWaveComponent::timerCallback()
{
    auto nowMs = juce::Time::getMillisecondCounter();
    auto delta = nowMs - lastDataArrivalTime;

    // If no data for a while, fade out
    if (delta > minFadeOutMs)
    {
        juce::ScopedLock sl(bufferLock);
        for (auto& amp : amplitudeBuffer)
            amp *= fadeFactor;
    }

    repaint();
}

void CustomDynamicWaveComponent::paint(juce::Graphics& g)
{
    // Subtle gradient background
    juce::ColourGradient backgroundGrad(
        juce::Colours::blue.brighter(0.3f),
        0.f, 0.f,
        juce::Colours::darkblue.darker(0.7f),
        0.f, (float)getHeight(),
        false
    );
    g.setGradientFill(backgroundGrad);
    g.fillAll();

    juce::ScopedLock sl(bufferLock);

    if (amplitudeBuffer.empty())
    {
        g.setColour(juce::Colours::white);
        g.drawFittedText("No audio data!", getLocalBounds(), juce::Justification::centred, 1);
        return;
    }

    auto r = getLocalBounds().toFloat();
    float w = r.getWidth();
    float h = r.getHeight();
    int envSize = (int)amplitudeBuffer.size();

    for (int i = 0; i < envSize; ++i)
    {
        float x = (float)i / (float)envSize * w;
        float amp = amplitudeBuffer[i];

        // color thresholds
        juce::Colour c;
        if (amp < 0.25f) c = juce::Colours::white;
        else if (amp < 0.50f) c = juce::Colours::yellow;
        else if (amp < 0.75f) c = juce::Colours::orange;
        else                  c = juce::Colours::red;

        g.setColour(c);

        float halfH = h * 0.5f;
        float midY = r.getY() + halfH;
        float mag = amp * halfH;

        float y1 = midY - mag;
        float y2 = midY + mag;

        g.drawLine(x, y1, x, y2, 1.0f);
    }
}

void CustomDynamicWaveComponent::resized()
{
    // nothing special
}
