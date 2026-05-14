# EduReach Design System

## Typography
- **Primary Font**: 'Inter', sans-serif (Google Fonts)
- **Headings**: 'Inter', sans-serif (Font-weight: 800-900 for emphasis)
- **Body**: 'Inter', sans-serif (Font-weight: 400-500)

## Color Palette (Semantic Tokens)
We use Tailwind CSS semantic variables that automatically respond to light and dark modes.

### Background & Surfaces
- `bg-background`: The lowest layer (e.g., page backgrounds).
  - Light: `#FFFFFF`
  - Dark: `#0B0F19` (Deep Space)
- `bg-surface`: Elevated elements (cards, navbars, sidebars).
  - Light: `#F8F9FA`
  - Dark: `#111827` (Tonal Gray)
- `bg-surface-soft`: Interactive elements or secondary cards.
  - Light: `#f3f4f6` (gray-100)
  - Dark: `#1f2937` (gray-800)
- `bg-surface-muted`: Dividers, borders, or inactive states.
  - Light: `#e5e7eb` (gray-200)
  - Dark: `#1f2937` (gray-800)

### Foreground & Typography
- `text-primary`: Primary text (headings, body).
  - Light: `#1a2330`
  - Dark: `#FFFFFF`
- `text-secondary`: Supporting text (subtitles, meta info).
  - Light: `#5c6776`
  - Dark: `#94a3b8`

### Branding & System States
- **Accent** (`text-accent` / `bg-accent`): `#2563eb` (Modern Blue)
- **Accent Soft**: `rgba(37, 99, 235, 0.2)`
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Rose)

## Layout & Components
- **Corner Roundness**: `24px` for small components, `48px` for large cards.
- **Glassmorphism**: Use `backdrop-blur-xl` and `bg-opacity` for overlays.
- **Borders**: Minimalist approach (`border-border`). Use tonal shifts (`bg-surface-soft`) instead of borders where possible.
- **Navigation**: Top Navbar should be present on **ALL** pages including dashboards.
