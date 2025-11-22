# Background Override Fix Guide

## Problem

The modular stylesheet `assets/css/custom/patterns/interactive-visuals.css` defines a global rule in the **"Disable theme's built-in background layer"** section:

```css
#wrapper > .bg {
  display: none !important;
  background: none !important;
}
```

This rule **hides all background elements** that are direct children of `#wrapper`, which prevents custom backgrounds from showing on project pages.

## Solution

To add a custom background to a project page, follow these steps:

### 1. Structure Your HTML

Place the background element **outside** of `#wrapper`, as a direct child of `<body>`:

```html
<body>
  <div class="custom-background"></div>  <!-- OUTSIDE #wrapper -->
  
  <div id="wrapper">
    <!-- Your content here -->
  </div>
</body>
```

### 2. Override CSS with High Specificity

Use strong selectors with `!important` to override the global rule:

```css
/* High specificity selector to override the interactive-visuals background lock */
body .custom-background,
.custom-background {
  display: block !important;
  visibility: visible !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 1 !important;                    /* Lower than #wrapper */
  pointer-events: none !important;          /* Allow clicks through */
  background: url('path/to/image.jpg') repeat center !important;
  background-size: 400px 400px !important;
  opacity: 1 !important;
}
```

### 3. Set #wrapper Z-Index

Ensure `#wrapper` has a higher z-index than the background:

```css
#wrapper,
#wrapper > .bg {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  position: relative !important;
  z-index: 10 !important;                   /* Higher than background */
}
```

## Key Points

- ✅ Background element must be **outside #wrapper**
- ✅ Use `body .custom-background` selector for high specificity
- ✅ Add `!important` to all critical properties
- ✅ Set `z-index: 1` for background, `z-index: 10` for wrapper
- ✅ Add `pointer-events: none` to allow clicking content above
- ✅ Hide default backgrounds: `.bg-gradient`, `.bg-orbs`, etc.

## Example: ray-animation.html

See `projects/ray-animation.html` for a working implementation with the "Black Coal.jpg" texture background.

The fix uses all the above techniques to successfully override the global background-blocking rule.

## Testing

1. Open the page in browser
2. Press F12 to open DevTools
3. Inspect the background element
4. Verify `display: block` and `background-image` are set
5. Check z-index layering (background: 1, wrapper: 10)

---

**Last Updated:** 2025-10-11  
**Author:** Igor Szuniewicz
