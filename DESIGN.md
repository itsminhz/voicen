# Design Style Guide

## Aesthetic Direction

**Warm, calm notebook.** VoiceNote AI is a personal study notebook you talk to
— it should feel like opening a well-loved paper notebook, not a SaaS
dashboard. The palette is cream paper and ink, warmed up with a single amber
accent (the "highlighter" color). Typography pairs a warm serif display face
with a clean, friendly sans body face. Corners are generously rounded like
cards on a desk. Motion is quiet and physical: gentle pulses, soft rises, no
flashy gradients or glass.

This directly serves the product: the microphone is the hero, so the rest of
the UI recedes into a calm, paper-like backdrop that never competes with it.

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-paper` | `#fbf6ec` | App background (page canvas) |
| `--color-paper-dim` | `#f3ebd9` | Secondary background / section fills |
| `--color-surface` | `#fffdf8` | Card / panel surfaces (slightly whiter than paper) |
| `--color-ink` | `#2b2420` | Primary text |
| `--color-ink-soft` | `#6b5f4f` | Secondary text |
| `--color-ink-faint` | `#948671` | Tertiary text / placeholders |
| `--color-line` | `#e6d9bd` | Borders, dividers |
| `--color-line-soft` | `#efe4cc` | Faint borders on surface cards |
| `--color-accent` | `#c26b1f` | Primary accent (mic button, links, primary actions) |
| `--color-accent-soft` | `#f3ddb8` | Accent tints (badges, highlighted chips) |
| `--color-accent-dark` | `#97500f` | Accent hover/active |
| `--color-accent-contrast` | `#fffaf0` | Text/icons on top of accent-filled surfaces |
| `--color-success` / `-soft` | `#4c7a52` / `#dbead9` | Correct answers, saved states |
| `--color-danger` / `-soft` | `#b34632` / `#f6ddd4` | Errors, destructive actions |

Avoid generic blue/gray/purple. All neutrals are warm-toned (paper/ink), never
cool gray.

## Typography

- **Display font:** `Fraunces` (variable, optical size axis) — used for all
  headings (`h1`–`h4`), the wordmark, and large emphasis numerals. Warm,
  slightly editorial serif that reads as "notebook", not corporate.
- **Body font:** `Karla` — used for body copy, UI labels, buttons, inputs.
  Clean, warm, geometric-humanist sans that stays legible at small sizes.
- Both imported from Google Fonts at the top of `src/client/index.css`.
- Headings default to `font-display`; everything else inherits `font-body`
  from `body`.

## Spacing & Radius

- Generous whitespace; prefer `p-6`/`p-8` on cards over cramped `p-3`/`p-4`.
- Radius convention: `rounded-xl` (1.25rem) for buttons/inputs/small cards,
  `rounded-2xl` (1.75rem) for large cards and panels, `rounded-full` for the
  mic button and pills/badges. Avoid sharp corners anywhere.
- Borders use `--color-line` / `--color-line-soft` at 1px, not heavy shadows —
  shadows are used sparingly and softly (`shadow-sm`/`shadow-md` with warm
  tint) to keep the "paper" feel rather than a floating-glass feel.

## Motion & Animation

- `animate-fade-in` — generic entrance for page sections.
- `animate-slide-up` / `animate-slide-up-sm` — card and list-item entrances
  (stagger with `animation-delay` inline style for lists).
- `animate-mic-pulse` — subtle breathing scale on the mic button while idle/
  recording.
- `animate-mic-ring` — expanding/fading ring(s) behind the mic button while
  actively recording (layer 2–3 with staggered delays for a "ripple" effect).
- `animate-wave` — vertical scale animation for audio waveform bars during
  recording (stagger each bar's `animation-delay`).
- `animate-shimmer` — skeleton loading placeholders (combine with a
  `bg-gradient-to-r` background and `bg-[length:200%_100%]`).

Keep motion subtle — short durations, no bouncing or spinning logos.
