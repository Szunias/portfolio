#include "PluginProcessor.h"
#include "PluginEditor.h"

/**
 * NewProjectAudioProcessorEditor.cpp
 *
 * Implementation of the main GUI editor. This file wires up:
 *  - The offline wave + drag-and-drop,
 *  - The bottom wave visualizer,
 *  - Sliders/Buttons for various audio parameters,
 *  - Timers for updating the wave displays,
 *  - A volume warning if the audio gets too loud.
 */

NewProjectAudioProcessorEditor::NewProjectAudioProcessorEditor(NewProjectAudioProcessor& p)
    : AudioProcessorEditor(&p),
    audioProcessor(p),
    // Initialize the DragDropOfflineWave with references
    topWaveDragDrop(audioProcessor.getAudioFilePlayer(), topColorWave)
{
    // Our overall size
    setSize(1300, 900);

    // Assign our custom LookAndFeel to the relevant sliders
    gainSlider.setLookAndFeel(&myLookAndFeel);
    tempoSlider.setLookAndFeel(&myLookAndFeel);
    lpfSlider.setLookAndFeel(&myLookAndFeel);
    hpfSlider.setLookAndFeel(&myLookAndFeel);

    compThreshSlider.setLookAndFeel(&myLookAndFeel);
    compRatioSlider.setLookAndFeel(&myLookAndFeel);
    compAttackSlider.setLookAndFeel(&myLookAndFeel);
    compReleaseSlider.setLookAndFeel(&myLookAndFeel);

    grainSizeSlider.setLookAndFeel(&myLookAndFeel);
    grainDensitySlider.setLookAndFeel(&myLookAndFeel);

    tremoloRateSlider.setLookAndFeel(&myLookAndFeel);
    tremoloDepthSlider.setLookAndFeel(&myLookAndFeel);

    //------------------------------------------------------------------------------
    // Setup callbacks for the top offline waveform:
    //  Single click => set the player position,
    //  Drag => define a region loop
    //------------------------------------------------------------------------------
    topColorWave.setPlayheadCallback([this](double normalizedPos)
        {
            auto& player = audioProcessor.getAudioFilePlayer();

            // Only allow setting position if random & granular are both off
            if (!player.isRandomMode() && !player.isGranularMode())
            {
                double lengthSec = player.getLength();
                double newSec = normalizedPos * lengthSec;
                player.setPosition(newSec);
            }
        });

    topColorWave.setRegionSelectedCallback([this](double startNorm, double endNorm)
        {
            auto& player = audioProcessor.getAudioFilePlayer();

            // Only define region looping if random & granular are off
            if (!player.isRandomMode() && !player.isGranularMode())
            {
                double lengthSec = player.getLength();
                double startSec = startNorm * lengthSec;
                double endSec = endNorm * lengthSec;
                player.setRegionLoop(startSec, endSec, true);
            }
        });

    //------------------------------------------------------------------------------
    // Sliders + Attachments
    //------------------------------------------------------------------------------

    // Gain
    gainSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    gainSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(gainSlider);
    gainAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "GAIN", gainSlider);

    // Tempo
    tempoSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    tempoSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(tempoSlider);
    tempoAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "TEMPO", tempoSlider);

    // LPF
    lpfSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    lpfSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(lpfSlider);
    lpfAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "LPF", lpfSlider);

    // HPF
    hpfSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    hpfSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(hpfSlider);
    hpfAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "HPF", hpfSlider);

    // Compressor Sliders
    compThreshSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    compRatioSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    compAttackSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    compReleaseSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);

    compThreshSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    compRatioSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    compAttackSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    compReleaseSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);

    addAndMakeVisible(compThreshSlider);
    addAndMakeVisible(compRatioSlider);
    addAndMakeVisible(compAttackSlider);
    addAndMakeVisible(compReleaseSlider);

    compThreshAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "COMPTHRESH", compThreshSlider);
    compRatioAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "COMPRATIO", compRatioSlider);
    compAttackAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "COMPATTACK", compAttackSlider);
    compReleaseAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "COMPRELEASE", compReleaseSlider);

    // Granular
    grainSizeSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    grainSizeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    grainSizeSlider.setRange(0.05f, 0.5f, 0.01f);
    addAndMakeVisible(grainSizeSlider);
    grainSizeAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "GRAIN_SIZE", grainSizeSlider);

    grainDensitySlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    grainDensitySlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    grainDensitySlider.setRange(0.1f, 1.0f, 0.01f);
    addAndMakeVisible(grainDensitySlider);
    grainDensityAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "GRAIN_DENSITY", grainDensitySlider);

    // Tremolo
    tremoloRateSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    tremoloRateSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(tremoloRateSlider);
    tremoloRateAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "TREM_RATE", tremoloRateSlider);

    tremoloDepthSlider.setSliderStyle(juce::Slider::RotaryVerticalDrag);
    tremoloDepthSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    addAndMakeVisible(tremoloDepthSlider);
    tremoloDepthAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
        audioProcessor.getAPVTS(), "TREM_DEPTH", tremoloDepthSlider);

    tremoloEnableButton.setClickingTogglesState(true);
    tremoloEnableButton.onClick = [this]
        {
            bool on = tremoloEnableButton.getToggleState();
            audioProcessor.setTremoloEnabled(on);
        };
    addAndMakeVisible(tremoloEnableButton);

    //------------------------------------------------------------------------------
    // Labels
    //------------------------------------------------------------------------------
    gainLabel.setText("Gain", juce::dontSendNotification);
    gainLabel.setJustificationType(juce::Justification::centred);
    gainLabel.attachToComponent(&gainSlider, false);
    addAndMakeVisible(gainLabel);

    tempoLabel.setText("Tempo", juce::dontSendNotification);
    tempoLabel.setJustificationType(juce::Justification::centred);
    tempoLabel.attachToComponent(&tempoSlider, false);
    addAndMakeVisible(tempoLabel);

    lpfLabel.setText("LPF", juce::dontSendNotification);
    lpfLabel.setJustificationType(juce::Justification::centred);
    lpfLabel.attachToComponent(&lpfSlider, false);
    addAndMakeVisible(lpfLabel);

    hpfLabel.setText("HPF", juce::dontSendNotification);
    hpfLabel.setJustificationType(juce::Justification::centred);
    hpfLabel.attachToComponent(&hpfSlider, false);
    addAndMakeVisible(hpfLabel);

    compThreshLabel.setText("Thresh", juce::dontSendNotification);
    compThreshLabel.setJustificationType(juce::Justification::centred);
    compThreshLabel.attachToComponent(&compThreshSlider, false);
    addAndMakeVisible(compThreshLabel);

    compRatioLabel.setText("Ratio", juce::dontSendNotification);
    compRatioLabel.setJustificationType(juce::Justification::centred);
    compRatioLabel.attachToComponent(&compRatioSlider, false);
    addAndMakeVisible(compRatioLabel);

    compAttackLabel.setText("Attack", juce::dontSendNotification);
    compAttackLabel.setJustificationType(juce::Justification::centred);
    compAttackLabel.attachToComponent(&compAttackSlider, false);
    addAndMakeVisible(compAttackLabel);

    compReleaseLabel.setText("Release", juce::dontSendNotification);
    compReleaseLabel.setJustificationType(juce::Justification::centred);
    compReleaseLabel.attachToComponent(&compReleaseSlider, false);
    addAndMakeVisible(compReleaseLabel);

    grainSizeLabel.setText("Grain Size", juce::dontSendNotification);
    grainSizeLabel.setJustificationType(juce::Justification::centred);
    grainSizeLabel.attachToComponent(&grainSizeSlider, false);
    addAndMakeVisible(grainSizeLabel);

    grainDensityLabel.setText("Grain Density", juce::dontSendNotification);
    grainDensityLabel.setJustificationType(juce::Justification::centred);
    grainDensityLabel.attachToComponent(&grainDensitySlider, false);
    addAndMakeVisible(grainDensityLabel);

    tremoloRateLabel.setText("Trem Rate", juce::dontSendNotification);
    tremoloRateLabel.setJustificationType(juce::Justification::centred);
    tremoloRateLabel.attachToComponent(&tremoloRateSlider, false);
    addAndMakeVisible(tremoloRateLabel);

    tremoloDepthLabel.setText("Trem Depth", juce::dontSendNotification);
    tremoloDepthLabel.setJustificationType(juce::Justification::centred);
    tremoloDepthLabel.attachToComponent(&tremoloDepthSlider, false);
    addAndMakeVisible(tremoloDepthLabel);

    //------------------------------------------------------------------------------
    // Playback control Buttons
    //------------------------------------------------------------------------------
    playButton.onClick = [this] { togglePlay(); };
    addAndMakeVisible(playButton);

    loopButton.setClickingTogglesState(true);
    loopButton.onClick = [this] { toggleLoop(); };
    addAndMakeVisible(loopButton);

    //------------------------------------------------------------------------------
    // Waves
    //------------------------------------------------------------------------------
    addAndMakeVisible(topColorWave);
    addAndMakeVisible(topWaveDragDrop);
    addAndMakeVisible(bottomWave);

    //------------------------------------------------------------------------------
    // Volume warning
    //------------------------------------------------------------------------------
    volumeExceededLabel.setText("WARNING: Volume limit exceeded!\nPress 'Continue' to resume audio.",
        juce::dontSendNotification);
    volumeExceededLabel.setJustificationType(juce::Justification::centred);
    volumeExceededLabel.setColour(juce::Label::textColourId, juce::Colours::red);
    volumeExceededLabel.setVisible(false);
    addAndMakeVisible(volumeExceededLabel);

    continueButton.setButtonText("Continue");
    continueButton.setVisible(false);
    continueButton.onClick = [this]
        {
            audioProcessor.setDangerousVolumeDetected(false);
        };
    addAndMakeVisible(continueButton);

    //------------------------------------------------------------------------------
    // Start a timer to update the wave visuals ~25 times per second
    //------------------------------------------------------------------------------
    startTimerHz(25);
}

NewProjectAudioProcessorEditor::~NewProjectAudioProcessorEditor()
{
    stopTimer();

    // Reset custom LookAndFeel to avoid dangling pointers
    gainSlider.setLookAndFeel(nullptr);
    tempoSlider.setLookAndFeel(nullptr);
    lpfSlider.setLookAndFeel(nullptr);
    hpfSlider.setLookAndFeel(nullptr);

    compThreshSlider.setLookAndFeel(nullptr);
    compRatioSlider.setLookAndFeel(nullptr);
    compAttackSlider.setLookAndFeel(nullptr);
    compReleaseSlider.setLookAndFeel(nullptr);

    grainSizeSlider.setLookAndFeel(nullptr);
    grainDensitySlider.setLookAndFeel(nullptr);

    tremoloRateSlider.setLookAndFeel(nullptr);
    tremoloDepthSlider.setLookAndFeel(nullptr);
}

void NewProjectAudioProcessorEditor::paint(juce::Graphics& g)
{
    // Draw our custom background gradient
    myLookAndFeel.drawEditorBackground(g, getWidth(), getHeight());

    // Title text
    g.setColour(juce::Colours::white.withAlpha(0.9f));
    g.setFont(juce::Font("Helvetica", 24.0f, juce::Font::bold));
    g.drawFittedText("Szunio LLC AudioQ",
        getLocalBounds().removeFromTop(40),
        juce::Justification::centred,
        1);
}

void NewProjectAudioProcessorEditor::resized()
{
    auto area = getLocalBounds().reduced(10);

    // Reserve top 40 px for title
    area.removeFromTop(40);

    // A row for main sliders & buttons
    auto topRow = area.removeFromTop(180);

    gainSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    tempoSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));

    grainSizeSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    grainDensitySlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    lpfSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    hpfSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));

    compThreshSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    compRatioSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    compAttackSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    compReleaseSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));

    playButton.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 25));
    loopButton.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 25));

    // Tremolo enable + sliders
    tremoloEnableButton.setBounds(topRow.removeFromLeft(100).withSizeKeepingCentre(90, 25));
    tremoloRateSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));
    tremoloDepthSlider.setBounds(topRow.removeFromLeft(80).withSizeKeepingCentre(60, 60));

    // Next, top wave area (30% of remaining height)
    auto colorWaveArea = area.removeFromTop((int)(area.getHeight() * 0.3f));
    topColorWave.setBounds(colorWaveArea);

    // Then 50 px for drag & drop instructions
    auto ddArea = area.removeFromTop(50);
    topWaveDragDrop.setBounds(ddArea);

    // 60 px at the bottom for volume warning
    auto warningArea = area.removeFromBottom(60);

    // Remaining area = bottom wave
    bottomWave.setBounds(area);

    volumeExceededLabel.setBounds(warningArea.removeFromTop(30).reduced(10));
    continueButton.setBounds(warningArea.withSizeKeepingCentre(100, 24));
}

void NewProjectAudioProcessorEditor::timerCallback()
{
    // 1) Update top wave's playhead
    double currentPos = audioProcessor.getAudioFilePlayer().getPosition();
    double length = audioProcessor.getAudioFilePlayer().getLength();
    double posFraction = (length > 0.0) ? (currentPos / length) : 0.0;
    topColorWave.setPlayheadPosition(posFraction);

    // 2) Update the Play button text
    if (audioProcessor.getAudioFilePlayer().isPlaying())
        playButton.setButtonText("Stop");
    else
        playButton.setButtonText("Play");

    // 3) Update the bottom wave visualizer
    updateVisualizer();

    // 4) Check volume warning
    bool isDangerous = audioProcessor.isDangerousVolumeDetected();
    volumeExceededLabel.setVisible(isDangerous);
    continueButton.setVisible(isDangerous);
}

void NewProjectAudioProcessorEditor::updateVisualizer()
{
    juce::AudioBuffer<float> bufferCopy;
    audioProcessor.getVisualizerBuffer(bufferCopy);
    bottomWave.pushBuffer(bufferCopy);
}

void NewProjectAudioProcessorEditor::togglePlay()
{
    auto& player = audioProcessor.getAudioFilePlayer();
    if (player.isPlaying())
        player.stop();
    else
        player.start();
}

void NewProjectAudioProcessorEditor::toggleLoop()
{
    bool loopState = loopButton.getToggleState();
    audioProcessor.getAudioFilePlayer().setLooping(loopState);
}
