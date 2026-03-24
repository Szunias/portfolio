#pragma once

#include <JuceHeader.h>

/**
 * MyLookAndFeel
 *
 * A custom LookAndFeel class for a consistent appearance:
 *  - Rotary slider style with gradient fill and drop shadows,
 *  - Custom button styling (gradient, shadows),
 *  - ComboBox styling,
 *  - A helper to draw a gradient background for the plugin editor.
 */
class MyLookAndFeel : public juce::LookAndFeel_V4
{
public:
    MyLookAndFeel()
    {
        //==============================================================================
        // Global color assignments for various controls
        //==============================================================================
        setColour(juce::Slider::thumbColourId, juce::Colours::white);
        setColour(juce::Slider::rotarySliderFillColourId, juce::Colours::grey.darker());
        setColour(juce::Slider::rotarySliderOutlineColourId, juce::Colours::black);

        setColour(juce::ComboBox::backgroundColourId, juce::Colours::black);
        setColour(juce::ComboBox::textColourId, juce::Colours::white);
        setColour(juce::ComboBox::outlineColourId, juce::Colours::darkgrey);

        setColour(juce::TextButton::buttonColourId, juce::Colours::darkblue);
        setColour(juce::TextButton::buttonOnColourId, juce::Colours::blue);
        setColour(juce::TextButton::textColourOnId, juce::Colours::white);
        setColour(juce::TextButton::textColourOffId, juce::Colours::white);
    }

    /**
     * Draws a vertical gradient background for the main plugin editor.
     */
    void drawEditorBackground(juce::Graphics& g, int width, int height)
    {
        juce::ColourGradient backgroundGrad(
            juce::Colour(25, 25, 50),        // near top color
            (float)width * 0.5f, 0.0f,       // gradient x1, y1
            juce::Colour(5, 5, 5),          // near bottom color
            (float)width * 0.5f, (float)height, // gradient x2, y2
            false
        );

        // Additional color stop
        backgroundGrad.addColour(0.3, juce::Colours::darkgrey.darker(0.3f));

        g.setGradientFill(backgroundGrad);
        g.fillAll();
    }

    //==============================================================================
    // Overridden LookAndFeel methods for Sliders, Buttons, ComboBoxes
    //==============================================================================
    void drawRotarySlider(juce::Graphics& g,
        int x, int y,
        int width, int height,
        float sliderPos,
        float rotaryStartAngle,
        float rotaryEndAngle,
        juce::Slider&) override
    {
        const auto bounds = juce::Rectangle<int>(x, y, width, height).toFloat();

        // Drop shadow behind the rotary knob
        {
            juce::DropShadow ds(juce::Colours::black.withAlpha(0.5f), 6, { 2, 2 });
            juce::Path shape;
            shape.addEllipse(bounds);
            ds.drawForPath(g, shape);
        }

        // Body of the rotary knob with a simple gradient
        auto gradient = juce::ColourGradient(
            juce::Colours::darkgrey.darker(0.4f),
            bounds.getCentreX(), bounds.getCentreY(),
            juce::Colours::darkgrey.brighter(0.3f),
            bounds.getX(), bounds.getBottom(),
            false
        );
        g.setGradientFill(gradient);
        g.fillEllipse(bounds.reduced(3));

        // Outline with a light alpha
        g.setColour(juce::Colours::white.withAlpha(0.3f));
        g.drawEllipse(bounds.reduced(3), 1.0f);

        // Draw the pointer
        float angle = rotaryStartAngle + sliderPos * (rotaryEndAngle - rotaryStartAngle);
        float pointerLength = bounds.getWidth() / 2.6f;
        float pointerThickness = 3.0f;

        juce::Path p;
        p.addRoundedRectangle(-pointerThickness * 0.5f, -pointerLength,
            pointerThickness, pointerLength, 1.0f);

        p.applyTransform(juce::AffineTransform::rotation(angle)
            .translated(bounds.getCentreX(),
                bounds.getCentreY()));

        g.setColour(juce::Colours::white);
        g.fillPath(p);
    }

    void drawButtonBackground(juce::Graphics& g,
        juce::Button& button,
        const juce::Colour& backgroundColour,
        bool isMouseOverButton,
        bool isButtonDown) override
    {
        const auto bounds = button.getLocalBounds().toFloat().reduced(1.0f);

        // Drop shadow
        juce::DropShadow ds(juce::Colours::black.withAlpha(0.4f), 4, { 1, 2 });
        juce::Path shape;
        shape.addRoundedRectangle(bounds, 6.0f);
        ds.drawForPath(g, shape);

        // Vertical gradient fill
        auto baseColour = isButtonDown ? backgroundColour.brighter(0.2f)
            : backgroundColour;

        auto grad = juce::ColourGradient(
            baseColour.darker(0.2f),
            bounds.getCentreX(), bounds.getY(),
            baseColour.brighter(0.3f),
            bounds.getCentreX(), bounds.getBottom(),
            false
        );

        g.setGradientFill(grad);
        g.fillRoundedRectangle(bounds, 6.0f);

        // Outline
        g.setColour(isMouseOverButton ? juce::Colours::white : juce::Colours::darkgrey);
        g.drawRoundedRectangle(bounds, 6.0f, isButtonDown ? 2.0f : 1.0f);
    }

    void drawComboBox(juce::Graphics& g,
        int width, int height,
        bool /*isButtonDown*/,
        int, int, int, int,
        juce::ComboBox&) override
    {
        const auto bounds = juce::Rectangle<float>((float)width, (float)height);

        // Gradient background
        juce::Colour bc(juce::Colours::black);
        juce::Colour bc2(juce::Colours::grey);

        auto grad = juce::ColourGradient(bc, 0, 0,
            bc2, 0, (float)height,
            false);
        g.setGradientFill(grad);
        g.fillRoundedRectangle(bounds, 4.0f);

        g.setColour(juce::Colours::darkgrey);
        g.drawRoundedRectangle(bounds, 4.0f, 1.0f);

        // Draw a small down-arrow
        float arrowX = (float)width - 15.0f;
        float arrowY = (float)height * 0.5f;

        juce::Path path;
        path.startNewSubPath(arrowX, arrowY - 3.0f);
        path.lineTo(arrowX + 5.0f, arrowY + 3.0f);
        path.lineTo(arrowX - 5.0f, arrowY + 3.0f);
        path.closeSubPath();

        g.setColour(juce::Colours::white);
        g.fillPath(path);
    }
};
