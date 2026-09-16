# Theme & Design Tokens

## Part 1 — Compact Token Summary

### Color Palette
- **Background**: `--bg-space: #020813`, `--bg-deep: #010610`, `--bg-panel: rgba(6, 14, 30, 0.82)`
- **Borders**: `--border-subtle: rgba(56, 189, 248, 0.12)`, `--border-active: rgba(56, 189, 248, 0.35)`
- **Accents**: `--accent-blue: #38bdf8`, `--accent-cyan: #06b6d4`, `--accent-teal: #14b8a6`
- **Text**: `--text-primary: #e2e8f0`, `--text-secondary: #94a3b8`, `--text-dim: #475569`
- **Risk Levels**: `--risk-critical: #ff2244`, `--risk-high: #ff8800`, `--risk-moderate: #ffd700`, `--risk-low: #00e87b`

### Typography
- **Mono**: `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`
- **HUD/Display**: `'Orbitron', 'Exo 2', ui-sans-serif, sans-serif`
- **Body**: `'Exo 2', ui-sans-serif, system-ui, sans-serif`
- Fonts loaded from Google Fonts: JetBrains Mono, Exo 2, Orbitron

### Key Patterns
- Glassmorphism panels: `backdrop-filter: blur(24px) saturate(190%)` with layered gradients
- Pill buttons: `border-radius: 9999px` with glass backgrounds
- Status dots: 6px circles with colored box-shadows and pulse animations
- Corner brackets: 8px borders on `::before`/`::after` pseudo-elements
- Section labels: 0.68rem mono, 0.15em tracking, uppercase, with 4px blue dot prefix

## Part 2 — Raw Source Dumps

### CSS Variables (from `src/index.css`)
```css
:root {
  --bg-space: #020813;
  --bg-deep: #010610;
  --bg-panel: rgba(6, 14, 30, 0.82);
  --bg-panel-hover: rgba(10, 22, 50, 0.9);
  --border-subtle: rgba(56, 189, 248, 0.12);
  --border-active: rgba(56, 189, 248, 0.35);
  --accent-blue: #38bdf8;
  --accent-cyan: #06b6d4;
  --accent-teal: #14b8a6;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-dim: #475569;
  --risk-critical: #ff2244;
  --risk-high: #ff8800;
  --risk-moderate: #ffd700;
  --risk-low: #00e87b;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-hud: 'Orbitron', 'Exo 2', ui-sans-serif, sans-serif;
  --font-body: 'Exo 2', ui-sans-serif, system-ui, sans-serif;
}
```

### Tailwind Config
- Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin (no `tailwind.config.ts` — uses v4 CSS-first config)
- All customization is via CSS custom properties in `index.css`

### Key CSS Classes
- `.glass-panel` — Liquid glass panel with blur, gradient, border, and inner highlight
- `.mission-panel` — Technical glass console panel variant
- `.danger-panel` — Red-tinted danger variant
- `.btn-primary` — Blue gradient pill button with glow
- `.btn-secondary` — Transparent glass pill button
- `.btn-icon` — 34px circular icon button
- `.btn-danger` — Red gradient pill button
- `.kpi-card` — KPI tile with left border accent and hover lift
- `.input-field` — Glass well input with focus glow
- `.section-label` — Blue mono label with dot prefix
- `.hud-label` — Dim mono label
- `.hud-value` — Bright mono value
- `.liquid-glass-dock` — Floating dock panel
- `.liquid-glass-pill` — Small glass pill element
- `.liquid-table-row` — Table row with hover glow
- `.risk-bar` / `.risk-bar-fill` — Progress bar for risk scores
- `.scanline-overlay` — CRT scanline effect
- `.bracket` — Corner bracket decorations

### Keyframe Animations
- `scanline`, `fadeInUp`, `fadeIn`, `slideInLeft`, `slideInRight`
- `orbitalPulse`, `criticalPulse`, `numberCount`, `borderGlow`
- `spinSlowCW`, `spinSlowCCW`, `radarSweep`, `dataScroll`

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Orbitron:wght@400..900&display=swap');
```
