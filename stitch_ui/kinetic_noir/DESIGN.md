---
name: Kinetic Noir
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-2xl:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is a high-octane, minimalist aesthetic engineered for a premium gaming experience. It leverages a "Hyper-Dark" palette to eliminate peripheral distraction, focusing the user's intensity entirely on the gameplay and typography.

The style is a fusion of **Minimalism** and **High-Contrast Modernism**. It relies on absolute blacks, stark white accents, and a structural grid defined by subtle, semi-transparent hair-lines rather than heavy shadows. The emotional response is one of precision, speed, and sophistication. Motion is a core pillar of the brand identity—interactions should feel elastic and responsive, utilizing scale-based feedback (e.g., subtle shrinking on press) to mimic physical tactile resistance.

## Colors

The palette is strictly monochromatic to maintain high visual focus. 

- **Backgrounds:** Use pure `#000000` for the primary canvas to ensure perfect blacks on OLED displays.
- **Surface/Inputs:** Use `#1A1A1A` for secondary containers, input fields, and recessed elements.
- **Primary Action:** Pure `#FFFFFF` is reserved for primary buttons and critical UI state changes.
- **Borders:** A consistent `1px` stroke using `rgba(255, 255, 255, 0.10)` provides structural definition without breaking the minimalist flow.
- **Text:** Use `#FFFFFF` for primary content and `rgba(255, 255, 255, 0.60)` for secondary or metadata.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, Swiss-inspired clarity. 

- **Scale:** Large display sizes use heavy weights (700-800) and tight letter-spacing to create a "wall of text" impact suitable for high scores and word reveals.
- **Hierarchy:** Use font weight rather than color to establish hierarchy. Primary information should be SemiBold or Bold, while utility text remains Regular.
- **Functionality:** All caps should be used sparingly for `label-sm` to denote categories or "GAME OVER" states, paired with increased letter spacing for legibility.

## Layout & Spacing

The design system employs a **Fluid Grid** model with an 8px base unit. 

- **Mobile:** A 4-column grid with 20px side margins. Elements typically span the full width or 2 columns.
- **Desktop/Tablet:** A 12-column centered grid with a max-width of 1200px.
- **Vertical Rhythm:** Large sections are separated by `lg` (48px) or `xl` (80px) spacing to maintain the minimalist breathability.
- **Motion Note:** When transitioning between screens, use staggered entrance animations (20ms delay per element) following a vertical flow.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Tonal Layering** and **Outline Definition**.

- **Level 0 (Floor):** Pure `#000000` background.
- **Level 1 (Card/Input):** `#1A1A1A` surface with a `1px` stroke of `white/10`.
- **Level 2 (Floating/Modal):** `#1A1A1A` surface with a slightly brighter `1px` stroke of `white/20`. 

Depth is further communicated through motion: elements that are "active" should scale up to 102% on hover or scale down to 98% on click, creating a physical "pressing" sensation without needing drop shadows.

## Shapes

The shape language is bold and exaggerated to contrast against the sharp typography.

- **Standard Elements:** Buttons and small cards use `rounded-lg` (16px).
- **Primary Containers:** Feature cards and modals use `rounded-xl` (24px) or even custom `3xl` (32px) for a soft, premium feel.
- **Inputs:** Word input fields should utilize `rounded-lg` to maintain a consistent interactive language with buttons.

## Components

- **Primary Buttons:** Solid `#FFFFFF` fill with `#000000` text. Transitions should include a subtle scale-down on press.
- **Secondary/Input Fields:** `#1A1A1A` background with `white/10` border. On focus, the border should brighten to `white/40`.
- **Chips/Badges:** Small, `rounded-full` (pill) containers with `white/10` background and `label-sm` text.
- **Game Tiles:** Large `#1A1A1A` squares with `rounded-lg` corners. Lettering inside should be `display-lg`.
- **Progress Bars:** A thin `2px` track of `white/10` with a solid `white` fill indicating progress.
- **Modals:** Centered overlays using `3xl` rounded corners, triggered with a backdrop blur of 10px on the background layer.