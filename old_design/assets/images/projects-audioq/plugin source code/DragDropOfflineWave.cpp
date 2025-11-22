#include "DragDropOfflineWave.h"

/**
 * DragDropOfflineWave.cpp
 *
 * Implementation of the DragDropOfflineWave component, which:
 *  - Accepts drag & drop of audio files,
 *  - Loads them into the AudioFilePlayer and updates the waveform display,
 *  - Shows two toggle buttons for Random Mode and Granular Mode.
 */

DragDropOfflineWave::DragDropOfflineWave(AudioFilePlayer& p,
    ColorizedOfflineWaveComponent& offlineWaveRef)
    : player(p), offlineWave(offlineWaveRef)
{
    // Random mode button
    addAndMakeVisible(randomModeButton);
    randomModeButton.setVisible(false); // hidden until a file is dropped
    randomModeButton.onClick = [this] { toggleRandomMode(); };

    // Granular mode button
    addAndMakeVisible(granularModeButton);
    granularModeButton.setVisible(false); // hidden until a file is dropped
    granularModeButton.onClick = [this] { toggleGranularMode(); };
}

DragDropOfflineWave::~DragDropOfflineWave()
{
}

bool DragDropOfflineWave::isInterestedInFileDrag(const juce::StringArray&)
{
    // We accept any file (could restrict to .wav or .aif if you like)
    return true;
}

void DragDropOfflineWave::fileDragEnter(const juce::StringArray&, int, int)
{
    isDraggingOver = true;
    repaint();
}

void DragDropOfflineWave::fileDragExit(const juce::StringArray&)
{
    isDraggingOver = false;
    repaint();
}

void DragDropOfflineWave::filesDropped(const juce::StringArray& files, int, int)
{
    isDraggingOver = false;
    repaint();

    if (files.size() > 0)
    {
        juce::File droppedFile(files[0]);
        if (droppedFile.existsAsFile())
        {
            // 1) Load into the AudioFilePlayer
            bool okTransport = player.loadFile(droppedFile);
            // 2) Load to offline buffer for the visual waveform
            bool okOffline = player.loadFileToBuffer(droppedFile);

            if (okOffline)
            {
                // Update the waveform display with the newly loaded offlineBuffer
                offlineWave.setOfflineBuffer(player.getOfflineBuffer());
                offlineWave.setPlayheadPosition(0.0);
                // Clear any region selection
                offlineWave.setRegionSelectionNormalized(0.0, 0.0);
            }

            // Show the 2 toggle buttons (Random / Granular)
            randomModeButton.setVisible(true);
            granularModeButton.setVisible(true);

            // Reset states
            player.setRandomMode(false);
            isRandomModeOn = false;
            randomModeButton.setButtonText("Enable Random Mode");

            player.setGranularMode(false);
            isGranularModeOn = false;
            granularModeButton.setButtonText("Enable Granular Mode");
        }
    }
}

void DragDropOfflineWave::paint(juce::Graphics& g)
{
    // If a file is being dragged, show a greenish background
    g.fillAll(isDraggingOver ? juce::Colours::darkgreen
        : juce::Colours::lightgrey);

    g.setColour(juce::Colours::white);
    g.setFont(16.0f);

    if (!randomModeButton.isVisible() && !granularModeButton.isVisible())
    {
        // Inform the user that they can drop a file here
        g.drawFittedText("Drop a file here to load and see the waveform",
            getLocalBounds().reduced(4),
            juce::Justification::centred,
            3);
    }
    else
    {
        // Once a file is loaded, show a simpler hint
        g.drawFittedText("File loaded. You can enable Random or Granular Mode below.",
            getLocalBounds().reduced(4),
            juce::Justification::centred,
            3);
    }
}

void DragDropOfflineWave::resized()
{
    auto r = getLocalBounds().reduced(5);

    // Position the two buttons at the bottom
    auto bottomRow = r.removeFromBottom(40);

    // Half the row for each button
    auto leftHalf = bottomRow.removeFromLeft(bottomRow.getWidth() / 2);

    randomModeButton.setBounds(leftHalf.reduced(2));
    granularModeButton.setBounds(bottomRow.reduced(2));
}

void DragDropOfflineWave::toggleRandomMode()
{
    isRandomModeOn = !isRandomModeOn;
    player.setRandomMode(isRandomModeOn);

    if (isRandomModeOn)
    {
        // Turn off Granular if we enable Random
        isGranularModeOn = false;
        player.setGranularMode(false);
        granularModeButton.setButtonText("Enable Granular Mode");

        // Provide a callback so that each time a random region is chosen, we highlight it
        player.onRandomRegionChanged =
            [this](double startNorm, double endNorm, juce::Colour regionC, juce::Colour playheadC)
            {
                offlineWave.setRegionSelectionNormalized(startNorm, endNorm);
                offlineWave.setRegionColor(regionC);
                offlineWave.setPlayheadColor(playheadC);
            };
    }
    else
    {
        // Remove the callback and reset wave highlight
        player.onRandomRegionChanged = nullptr;
        offlineWave.setRegionSelectionNormalized(0.0, 0.0);
        offlineWave.setPlayheadColor(juce::Colours::limegreen);
    }

    randomModeButton.setButtonText(isRandomModeOn ? "Disable Random Mode"
        : "Enable Random Mode");
}

void DragDropOfflineWave::toggleGranularMode()
{
    isGranularModeOn = !isGranularModeOn;
    player.setGranularMode(isGranularModeOn);

    if (isGranularModeOn)
    {
        // Turn off Random if we enable Granular
        isRandomModeOn = false;
        player.setRandomMode(false);
        randomModeButton.setButtonText("Enable Random Mode");

        // Provide a callback for new granular regions
        player.onRandomRegionChanged =
            [this](double startNorm, double endNorm, juce::Colour regionC, juce::Colour playheadC)
            {
                // Each small grain region => highlight it
                offlineWave.setRegionSelectionNormalized(startNorm, endNorm);
                offlineWave.setRegionColor(regionC);
                offlineWave.setPlayheadColor(playheadC);
            };
    }
    else
    {
        // Remove the callback and reset wave highlight
        player.onRandomRegionChanged = nullptr;
        offlineWave.setRegionSelectionNormalized(0.0, 0.0);
        offlineWave.setPlayheadColor(juce::Colours::limegreen);
    }

    granularModeButton.setButtonText(isGranularModeOn ? "Disable Granular Mode"
        : "Enable Granular Mode");
}
