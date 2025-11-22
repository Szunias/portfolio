#include "AudioFilePlayer.h"
#include <random>

/**
 * AudioFilePlayer.cpp
 *
 * Implements a basic AudioFilePlayer that:
 *  - Loads a file, sets up a transport,
 *  - Supports random or granular looping by automatically selecting new regions,
 *  - Maintains an offlineBuffer for waveform visualization,
 *  - Optional crossfade for loop transitions.
 */

AudioFilePlayer::AudioFilePlayer()
    : thread("AudioFilePlayerThread"),
    resamplingSource(&transport, false, 2) // false: not deleting input source, 2: max channels
{
    formatManager.registerBasicFormats();
    thread.startThread();
    transport.addChangeListener(this);
}

AudioFilePlayer::~AudioFilePlayer()
{
    transport.removeChangeListener(this);
    transport.stop();
    transport.setSource(nullptr);
    thread.stopThread(500);
}

//==============================================================================
bool AudioFilePlayer::loadFile(const juce::File& file)
{
    stop();

    auto* reader = formatManager.createReaderFor(file);
    if (reader != nullptr)
    {
        std::unique_ptr<juce::AudioFormatReaderSource> newSource(
            new juce::AudioFormatReaderSource(reader, true)
        );

        transport.setSource(newSource.get(),
            0,       // readAheadBufferSize
            &thread, // TimeSliceThread
            reader->sampleRate);

        readerSource.reset(newSource.release());

        loadedSampleRate = reader->sampleRate;
        loadedLengthInSamples = (long long)reader->lengthInSamples;
        loadedLengthInSeconds = (double)loadedLengthInSamples / loadedSampleRate;

        return true;
    }
    return false;
}

bool AudioFilePlayer::loadFileToBuffer(const juce::File& file)
{
    auto* reader = formatManager.createReaderFor(file);
    if (reader == nullptr)
        return false;

    long long numSamples = (long long)reader->lengthInSamples;
    if (numSamples <= 0)
    {
        delete reader;
        return false;
    }

    const long long maxSamplesToRead = 2000000;
    const long long samplesToRead = (numSamples < maxSamplesToRead)
        ? numSamples
        : maxSamplesToRead;

    offlineBuffer.setSize((int)reader->numChannels, (int)samplesToRead);
    offlineBuffer.clear();

    reader->read(&offlineBuffer,
        0,                    // destination start sample
        (int)samplesToRead,   // number of samples to read
        0,                    // reader start sample
        true,                 // use left chan?
        true);                // use right chan?

    delete reader;
    return true;
}

//==============================================================================
void AudioFilePlayer::start()
{
    if (!transport.isPlaying())
        transport.start();
}

void AudioFilePlayer::stop()
{
    if (transport.isPlaying())
        transport.stop();
}

bool AudioFilePlayer::isPlaying() const
{
    return transport.isPlaying();
}

void AudioFilePlayer::setResamplingRatio(double ratio)
{
    // E.g., ratio = 1.0 => normal speed, 2.0 => double speed, 0.5 => half speed
    resamplingSource.setResamplingRatio(ratio);
}

void AudioFilePlayer::setPosition(double newTimeSec)
{
    transport.setPosition(newTimeSec);
}

double AudioFilePlayer::getPosition() const
{
    return transport.getCurrentPosition();
}

double AudioFilePlayer::getLength() const
{
    return loadedLengthInSeconds;
}

void AudioFilePlayer::prepareToPlay(int samplesPerBlock, double sampleRate)
{
    currentSampleRate = sampleRate;
    resamplingSource.prepareToPlay(samplesPerBlock, sampleRate);
}

void AudioFilePlayer::releaseResources()
{
    resamplingSource.releaseResources();
}

//==============================================================================
void AudioFilePlayer::setLooping(bool shouldLoop)
{
    looping = shouldLoop;
}

void AudioFilePlayer::setRegionLoop(double startSec, double endSec, bool enable)
{
    regionStartSec = juce::jmax(0.0, startSec);
    regionEndSec = juce::jmax(regionStartSec, endSec);
    useRegionLoop = enable;
}

//==============================================================================
void AudioFilePlayer::setRandomMode(bool shouldEnable)
{
    randomMode = shouldEnable;
    if (randomMode)
    {
        // If randomMode is on, also ensure region-based loop
        looping = true;
        useRegionLoop = true;
        generateRandomRegion();
    }
}

void AudioFilePlayer::setGranularMode(bool enable)
{
    granularMode = enable;
    if (granularMode)
    {
        // Similarly ensure region-based loop
        looping = true;
        useRegionLoop = true;
        generateRandomRegion();
    }
}

void AudioFilePlayer::setCrossfadeTimeMs(double ms)
{
    if (currentSampleRate > 0.0)
        crossfadeSamples = (int)std::round((ms / 1000.0) * currentSampleRate);
    else
        crossfadeSamples = 0;
}

//==============================================================================
void AudioFilePlayer::getNextAudioBlock(const juce::AudioSourceChannelInfo& info)
{
    // If no file loaded or transport not playing, just clear
    if (!readerSource)
    {
        info.clearActiveBufferRegion();
        return;
    }

    if (!transport.isPlaying())
    {
        info.clearActiveBufferRegion();
        return;
    }

    double startPos = transport.getCurrentPosition();
    double blockEnd = startPos + (info.numSamples / currentSampleRate);
    double audioLen = getLength();

    //--------------------------------------------------------------------------------
    // Region-based loop (works for random or granular or normal region)
    //--------------------------------------------------------------------------------
    if (useRegionLoop && looping && (regionEndSec > regionStartSec))
    {
        if (blockEnd > regionEndSec)
        {
            // We'll split the block into 2 parts: up to regionEndSec, then from regionStart
            int samplesUntilEnd = juce::roundToInt((regionEndSec - startPos) * currentSampleRate);
            samplesUntilEnd = juce::jlimit(0, info.numSamples, samplesUntilEnd);

            // First portion until region end
            if (samplesUntilEnd > 0)
            {
                juce::AudioSourceChannelInfo firstChunk(info.buffer,
                    info.startSample,
                    samplesUntilEnd);
                resamplingSource.getNextAudioBlock(firstChunk);

                // Fade out at region boundary if crossfade is enabled
                int fadeSamps = juce::jmin(crossfadeSamples, samplesUntilEnd);
                if (fadeSamps > 0)
                    fadeOut(firstChunk, fadeSamps);
            }

            // Second portion => jump to regionStart or generate new region if random
            int secondChunkSize = info.numSamples - samplesUntilEnd;
            if (secondChunkSize > 0)
            {
                // If random/granular => choose new random region
                if (randomMode || granularMode)
                    generateRandomRegion();
                else
                    transport.setPosition(regionStartSec);

                juce::AudioSourceChannelInfo secondChunk(info.buffer,
                    info.startSample + samplesUntilEnd,
                    secondChunkSize);
                resamplingSource.getNextAudioBlock(secondChunk);

                // Fade in from region start
                int fadeSamps = juce::jmin(crossfadeSamples, secondChunkSize);
                if (fadeSamps > 0)
                    fadeIn(secondChunk, fadeSamps);
            }
        }
        else
        {
            // Entire block is within region
            resamplingSource.getNextAudioBlock(info);
        }

        // If position somehow advanced beyond endSec, pick new region or jump
        double newPos = transport.getCurrentPosition();
        if (newPos >= regionEndSec)
        {
            if (randomMode || granularMode)
                generateRandomRegion();
            else
                transport.setPosition(regionStartSec);
        }
    }
    else if (looping && audioLen > 0.0)
    {
        // Normal full-file loop
        if (blockEnd > audioLen)
        {
            int samplesUntilEnd = juce::roundToInt((audioLen - startPos) * currentSampleRate);
            samplesUntilEnd = juce::jlimit(0, info.numSamples, samplesUntilEnd);

            // portion until file end
            if (samplesUntilEnd > 0)
            {
                juce::AudioSourceChannelInfo firstChunk(info.buffer,
                    info.startSample,
                    samplesUntilEnd);
                resamplingSource.getNextAudioBlock(firstChunk);

                int fadeSamps = juce::jmin(crossfadeSamples, samplesUntilEnd);
                if (fadeSamps > 0)
                    fadeOut(firstChunk, fadeSamps);
            }

            // from file start
            int secondChunkSize = info.numSamples - samplesUntilEnd;
            if (secondChunkSize > 0)
            {
                transport.setPosition(0.0);

                juce::AudioSourceChannelInfo secondChunk(info.buffer,
                    info.startSample + samplesUntilEnd,
                    secondChunkSize);
                resamplingSource.getNextAudioBlock(secondChunk);

                int fadeSamps = juce::jmin(crossfadeSamples, secondChunkSize);
                if (fadeSamps > 0)
                    fadeIn(secondChunk, fadeSamps);
            }
        }
        else
        {
            resamplingSource.getNextAudioBlock(info);
        }
    }
    else
    {
        // Normal playback, no looping
        resamplingSource.getNextAudioBlock(info);
    }
}

void AudioFilePlayer::changeListenerCallback(juce::ChangeBroadcaster* src)
{
    if (src == &transport)
    {
        // If transport changes, we could do something, but we don't specifically here.
    }
}

void AudioFilePlayer::generateRandomRegion()
{
    double fileLen = getLength();
    if (fileLen <= 0.05)
        return;

    // Different region lengths for random vs granular
    double minLen = randomMode ? 0.1 : 0.05;
    double maxLen = randomMode ? 3.0 : 0.20;

    if (minLen > fileLen)
        minLen = fileLen * 0.5;

    double range = (fileLen - minLen);
    if (range < 0.0)
        range = 0.0;

    // Generate a random start
    double newStart = ((double)std::rand() / RAND_MAX) * range;
    double length = minLen + ((double)std::rand() / RAND_MAX) * (maxLen - minLen);
    double newEnd = newStart + length;
    if (newEnd > fileLen)
        newEnd = fileLen;

    regionStartSec = newStart;
    regionEndSec = newEnd;

    // Move transport to new region start
    transport.setPosition(regionStartSec);

    // Notify UI (ColorizedOfflineWave) if needed
    if (onRandomRegionChanged)
    {
        double normStart = regionStartSec / fileLen;
        double normEnd = regionEndSec / fileLen;

        // Create some random colors for region + playhead
        juce::Colour c1 = juce::Colour::fromHSV(
            (float)(std::rand() % 360) / 360.0f,
            0.4f + 0.4f * ((float)std::rand() / RAND_MAX),
            1.0f, 0.3f
        );
        juce::Colour c2 = juce::Colour::fromHSV(
            (float)(std::rand() % 360) / 360.0f,
            0.9f,
            0.95f,
            1.0f
        );

        onRandomRegionChanged(normStart, normEnd, c1, c2);
    }
}

//------------------------------------------------------------------------------
void AudioFilePlayer::fadeOut(const juce::AudioSourceChannelInfo& sourceInfo, int fadeSamps)
{
    if (fadeSamps < 1)
        return;

    int startOffset = sourceInfo.numSamples - fadeSamps;
    if (startOffset < 0)
        startOffset = 0;

    auto* buffer = const_cast<juce::AudioBuffer<float>*>(sourceInfo.buffer);

    for (int ch = 0; ch < buffer->getNumChannels(); ++ch)
    {
        float* data = buffer->getWritePointer(ch, sourceInfo.startSample + startOffset);
        for (int i = 0; i < fadeSamps && (startOffset + i) < sourceInfo.numSamples; ++i)
        {
            float x = (float)i / (float)(fadeSamps - 1);
            float gain = std::cos(juce::MathConstants<float>::halfPi * x);
            data[i] *= gain;
        }
    }
}

void AudioFilePlayer::fadeIn(const juce::AudioSourceChannelInfo& sourceInfo, int fadeSamps)
{
    if (fadeSamps < 1)
        return;

    auto* buffer = const_cast<juce::AudioBuffer<float>*>(sourceInfo.buffer);

    for (int ch = 0; ch < buffer->getNumChannels(); ++ch)
    {
        float* data = buffer->getWritePointer(ch, sourceInfo.startSample);

        for (int i = 0; i < fadeSamps && i < sourceInfo.numSamples; ++i)
        {
            float x = (float)i / (float)(fadeSamps - 1);
            float gain = std::sin(juce::MathConstants<float>::halfPi * x);
            data[i] *= gain;
        }
    }
}
