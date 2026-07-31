# Readability and contrast review

Date: 2026-07-31

The revision separates decorative accent colors from text colors. The original coral (`#ff715b`) remains available for fills, borders and focus indicators, while text uses a darker `--coral-text` token. Muted copy is also darker and the low-contrast green method label was replaced.

Calculated WCAG relative contrast against the main paper background (`#f6f1e7`):

| Token | Foreground | Contrast |
|---|---:|---:|
| `--ink-2` | `#173a36` | 11.01:1 |
| `--muted` | `#405b57` | 6.54:1 |
| `--coral-text` | `#a92f22` | 5.99:1 |
| method green text | `#365f16` | 6.65:1 |
| clinical banner body on `#fff8df` | `#102c2a` | 13.95:1 |

These reusable body and small-text combinations exceed the WCAG AA 4.5:1 threshold for normal text. Focus indication still uses the brighter coral as a non-text visual cue.

This is a static token audit. Browser-level accessibility automation and visual regression should still be run in Codespaces/CI after dependencies are installed.
