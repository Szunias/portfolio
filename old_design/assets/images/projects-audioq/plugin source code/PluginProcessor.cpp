#include "PluginProcessor.h"
#include "PluginEditor.h"

/**
 * NewProjectAudioProcessor.cpp
 *
 * The core audio-processing logic, including:
 *  - Loading / playing audio via AudioFilePlayer,
 *  - Applying filters & compression,
 *  - Handling tempo-based resampling,
 *  - Granular (small random loops),
 *  - A manual tremolo (simple LFO),
 *  - Volume safety detection (stops audio if peaks exceed 0.99f).
 */

NewProjectAudioProcessor::NewProjectAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
    : AudioProcessor(BusesProperties()
        .withInput("Input", juce::AudioChannelSet::stereo(), true)
        .withOutput("Output", juce::AudioChannelSet::stereo(), true)
    ),
    apvts(*this, nullptr, "PARAMETERS", createParameters())
#endif
{
    // Configure our two StateVariable filters
    lpf.setType(juce::dsp::StateVariableTPTFilterType::lowpass);
    hpf.setType(juce::dsp::StateVariableTPTFilterType::highpass);
}

NewProjectAudioProcessor::~NewProjectAudioProcessor()
{
}

//==============================================================================
const juce::String NewProjectAudioProcessor::getName() const
{
    return "DragDropTimeStretchPlugin";
}

bool NewProjectAudioProcessor::acceptsMidi()  const { return false; }
bool NewProjectAudioProcessor::producesMidi() const { return false; }
bool NewProjectAudioProcessor::isMidiEffect() const { return false; }
double NewProjectAudioProcessor::getTailLengthSeconds() const { return 0.0; }

int  NewProjectAudioProcessor::getNumPrograms() { return 1; }
int  NewProjectAudioProcessor::getCurrentProgram() { return 0; }
void NewProjectAudioProcessor::setCurrentProgram(int) {}
const juce::String NewProjectAudioProcessor::getProgramName(int) { return {}; }
void NewProjectAudioProcessor::changeProgramName(int, const juce::String&) {}

//==============================================================================
#ifndef JucePlugin_PreferredChannelConfigurations
bool NewProjectAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    // Only support stereo output
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;
    return true;
}
#endif

//==============================================================================
void NewProjectAudioProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    // Prepare our audio file player
    audioFilePlayer.prepareToPlay(samplesPerBlock, sampleRate);

    // Setup DSP chain
    juce::dsp::ProcessSpec spec;
    spec.sampleRate = sampleRate;
    spec.maximumBlockSize = (juce::uint32)samplesPerBlock;
    spec.numChannels = 2;

    // Prepare filters
    lpf.prepare(spec);
    hpf.prepare(spec);
    lpf.reset();
    hpf.reset();

    // Prepare compressor
    compressor.prepare(spec);
    compressor.reset();

    // Visualization buffer
    visualizerBuffer.setSize(2, samplesPerBlock);
    visualizerBuffer.clear();

    // Tremolo
    currentSR = sampleRate;
    tremoloPhase = 0.0f;
}

void NewProjectAudioProcessor::releaseResources()
{
    // Cleanup
    audioFilePlayer.releaseResources();
}

//==============================================================================
void NewProjectAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer,
    juce::MidiBuffer& midiMessages)
{
    juce::ignoreUnused(midiMessages);
    juce::ScopedNoDenormals noDenormals;

    // If dangerously loud, zero out the audio until user clicks Continue
    if (dangerousVolumeDetected)
    {
        buffer.clear();
        return;
    }

    // Grab parameter values from APVTS
    float gainValue = *apvts.getRawParameterValue("GAIN");
    float tempoValue = *apvts.getRawParameterValue("TEMPO");
    float lpfCutoff = *apvts.getRawParameterValue("LPF");
    float hpfCutoff = *apvts.getRawParameterValue("HPF");

    float cThresh = *apvts.getRawParameterValue("COMPTHRESH");
    float cRatio = *apvts.getRawParameterValue("COMPRATIO");
    float cAttack = *apvts.getRawParameterValue("COMPATTACK");
    float cRelease = *apvts.getRawParameterValue("COMPRELEASE");

    float grainSize = *apvts.getRawParameterValue("GRAIN_SIZE");
    float grainDensity = *apvts.getRawParameterValue("GRAIN_DENSITY");

    float tremRate = *apvts.getRawParameterValue("TREM_RATE");   // 0.1..10 Hz
    float tremDepth = *apvts.getRawParameterValue("TREM_DEPTH");  // 0..1

    // Adjust file player speed from tempo
    double ratio = (double)tempoValue / 120.0;
    audioFilePlayer.setResamplingRatio(ratio);

    // Granular
    audioFilePlayer.setGrainSize(grainSize);
    audioFilePlayer.setGrainDensity(grainDensity);

    // Fetch audio from the file player
    juce::AudioSourceChannelInfo info(buffer);
    audioFilePlayer.getNextAudioBlock(info);

    // Set filter cutoffs
    lpf.setCutoffFrequency(lpfCutoff);
    hpf.setCutoffFrequency(hpfCutoff);

    // Wrap the buffer in a dsp block
    juce::dsp::AudioBlock<float> dspBlock(buffer);
    juce::dsp::ProcessContextReplacing<float> ctx(dspBlock);

    // Process filters
    lpf.process(ctx);
    hpf.process(ctx);

    // Process compressor
    compressor.setThreshold(cThresh);
    compressor.setRatio(cRatio);
    compressor.setAttack(cAttack);
    compressor.setRelease(cRelease);
    compressor.process(ctx);

    // Manual tremolo if enabled
    if (tremoloOn && tremDepth > 0.0f)
    {
        int numSamples = buffer.getNumSamples();
        int numChannels = buffer.getNumChannels();

        float phaseInc = (float)(2.0 * juce::MathConstants<double>::pi * tremRate / currentSR);

        for (int sample = 0; sample < numSamples; ++sample)
        {
            // LFO ranges [0..1] => amplitude = 1 - depth + depth * LFO
            float lfoVal = 0.5f + 0.5f * std::sin(tremoloPhase);
            float amplitude = (1.0f - tremDepth) + (tremDepth * lfoVal);

            for (int ch = 0; ch < numChannels; ++ch)
            {
                float* writePtr = buffer.getWritePointer(ch);
                writePtr[sample] *= amplitude;
            }

            tremoloPhase += phaseInc;
            if (tremoloPhase > juce::MathConstants<float>::twoPi)
                tremoloPhase -= juce::MathConstants<float>::twoPi;
        }
    }

    // Final overall gain
    buffer.applyGain(gainValue);

    // Copy to visualizer
    {
        const juce::ScopedLock sl(bufferLock);
        visualizerBuffer.makeCopyOf(buffer);
    }

    // Check for dangerously high peaks
    float peak = 0.0f;
    for (int ch = 0; ch < buffer.getNumChannels(); ++ch)
    {
        const float* readPtr = buffer.getReadPointer(ch);
        for (int i = 0; i < buffer.getNumSamples(); ++i)
        {
            float mag = std::abs(readPtr[i]);
            if (mag > peak)
                peak = mag;
        }
    }
    if (peak > 0.99f)
        dangerousVolumeDetected = true;
}

bool NewProjectAudioProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* NewProjectAudioProcessor::createEditor()
{
    // Our custom editor
    return new NewProjectAudioProcessorEditor(*this);
}

//==============================================================================
void NewProjectAudioProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    // Save APVTS
    juce::MemoryOutputStream mos(destData, true);
    apvts.state.writeToStream(mos);
}

void NewProjectAudioProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    // Restore APVTS
    auto tree = juce::ValueTree::readFromData(data, (size_t)sizeInBytes);
    if (tree.isValid())
        apvts.replaceState(tree);
}

juce::AudioProcessorValueTreeState::ParameterLayout NewProjectAudioProcessor::createParameters()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    // Gain (0..3.1623 => ~ +10 dB)
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "GAIN", "Gain", 0.0f, 3.1623f, 1.0f
    ));

    // Tempo
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "TEMPO", "Tempo (BPM)", 20.0f, 300.0f, 120.0f
    ));

    // LPF, HPF
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "LPF", "LPF (Hz)", 20.0f, 20000.0f, 20000.0f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "HPF", "HPF (Hz)", 20.0f, 20000.0f, 20.0f
    ));

    // Compressor
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "COMPTHRESH", "Threshold (dB)", -60.0f, 0.0f, -20.0f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "COMPRATIO", "Ratio", 1.0f, 20.0f, 2.0f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "COMPATTACK", "Attack (ms)", 1.0f, 200.0f, 10.0f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "COMPRELEASE", "Release (ms)", 5.0f, 1000.0f, 100.0f
    ));

    // Granular
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "GRAIN_SIZE", "Grain Size", 0.05f, 0.5f, 0.1f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "GRAIN_DENSITY", "Grain Density", 0.1f, 1.0f, 0.5f
    ));

    // Tremolo
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "TREM_RATE", "Tremolo Rate (Hz)", 0.1f, 10.0f, 5.0f
    ));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        "TREM_DEPTH", "Tremolo Depth", 0.0f, 1.0f, 0.5f
    ));

    return { params.begin(), params.end() };
}

void NewProjectAudioProcessor::getVisualizerBuffer(juce::AudioBuffer<float>& outBuffer)
{
    // Copy the internal buffer used for visualization
    const juce::ScopedLock sl(bufferLock);
    outBuffer.makeCopyOf(visualizerBuffer);
}

juce::AudioProcessor* createPluginFilter()
{
    return new NewProjectAudioProcessor();
}
