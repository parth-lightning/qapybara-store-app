// Platform-independent source of truth. Numeric measurements are logical pixels.
export const tokens = {
  colors: {
    light: {
      background: "#f6f7f7",
      surface: "#ecefef",
      elevated: "#fcfdfd",
      text: "#202727",
      muted: "#566161",
      border: "#cbd2d2",
      accent: "#245b4b",
      onAccent: "#f8fbfa",
      error: "#99342f",
    },
    dark: {
      background: "#171e1e",
      surface: "#242d2d",
      elevated: "#1e2727",
      text: "#eef2f1",
      muted: "#b3bfbc",
      border: "#4c5c57",
      accent: "#a1d2bb",
      onAccent: "#172c23",
      error: "#ffb7ac",
    },
  },
  fontFamilies: { sans: "Manrope", mono: "monospace" },
  typeScale: {
    caption: 12,
    small: 14,
    body: 16,
    lead: 20,
    heading: 28,
    title: 40,
    display: 64,
  },
  spacing: {
    micro: 4,
    tight: 8,
    small: 12,
    base: 16,
    medium: 24,
    large: 32,
    section: 64,
    spacious: 96,
  },
  radii: { none: 0, control: 4, panel: 4 },
  shadows: {
    light: "0 8px 28px rgba(32,50,45,0.08)",
    dark: "0 8px 28px rgba(10,20,17,0.22)",
  },
  motion: {
    durations: { instant: 0, fast: 140, normal: 220 },
    easings: {
      standard: "cubic-bezier(0.2,0,0,1)",
      exit: "cubic-bezier(0.4,0,1,1)",
    },
  },
  layout: {
    maxWidth: 1400,
    breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
    layers: { base: 0, header: 10, notice: 20 },
  },
};
