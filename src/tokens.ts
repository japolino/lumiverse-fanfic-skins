// Color and type tokens for each skin. Values are taken from the live sites
// (computed styles on archiveofourown.org and wattpad.com, October 2026) and
// from AO3's public stylesheets in otwcode/otwarchive.

export type SkinId = "ao3" | "wattpad";
export type Mode = "light" | "dark";

export interface Tokens {
  /** Outer app background behind the reading column. */
  shell: string;
  /** The reading column / page. */
  page: string;
  /** Raised surfaces: menus, modals, drawers. */
  panel: string;
  panelAlt: string;
  hover: string;
  text: string;
  textMuted: string;
  textDim: string;
  heading: string;
  link: string;
  linkHover: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentContrast: string;
  selection: string;
  selectionText: string;
  inputBg: string;
  inputFocusBg: string;
  quoteBorder: string;
  codeBg: string;
  shadow: string;
  scrollThumb: string;
  danger: string;
  success: string;
  warning: string;
  uiFont: string;
  proseFont: string;
  headingFont: string;
  monoFont: string;
}

const lucida = `"Lucida Grande", "Lucida Sans Unicode", Verdana, Helvetica, sans-serif, "GNU Unifont"`;
const georgia = `Georgia, "Times New Roman", serif`;
const sourceSans = `"Source Sans Pro", "Source Sans 3", "Helvetica Neue", Helvetica, Arial, sans-serif`;
const mono = `Consolas, "Liberation Mono", Menlo, monospace`;

/** AO3-specific extras that do not map onto the shared reader tokens. */
export interface Ao3Extras {
  nav: string;
  navTop: string;
  navBottom: string;
  navShadow: string;
  masthead: string;
  logoFilter: string;
  btnTop: string;
  btnBottom: string;
  btnEdge: string;
  btnText: string;
  btnBorder: string;
  btnHoverShadow: string;
  metaBorder: string;
  metaBg: string;
  commentBg: string;
  footer: string;
  tagUnderline: string;
}

/** Wattpad-specific extras. */
export interface WattpadExtras {
  orange: string;
  orangeText: string;
  teal: string;
  purple: string;
  purpleSoft: string;
  purpleText: string;
  pill: string;
  pillText: string;
  marker: string;
  markerText: string;
  heroScrim: string;
  card: string;
}

export const AO3: Record<Mode, Tokens & Ao3Extras> = {
  light: {
    shell: "#ffffff",
    page: "#ffffff",
    panel: "#ffffff",
    panelAlt: "#f3f3f3",
    hover: "#eeeeee",
    text: "#2a2a2a",
    textMuted: "#555555",
    textDim: "#777777",
    heading: "#2a2a2a",
    link: "#111111",
    linkHover: "#990000",
    border: "#dddddd",
    borderStrong: "#bbbbbb",
    accent: "#990000",
    accentHover: "#b30000",
    accentText: "#990000",
    accentContrast: "#ffffff",
    selection: "#990000",
    selectionText: "#ffffff",
    inputBg: "#ffffff",
    inputFocusBg: "#f3efec",
    quoteBorder: "#bbbbbb",
    codeBg: "#f3f3f3",
    shadow: "0 1px 4px rgba(0,0,0,.18)",
    scrollThumb: "#bbbbbb",
    danger: "#990000",
    success: "#2b7a2b",
    warning: "#a06d00",
    uiFont: lucida,
    proseFont: lucida,
    headingFont: georgia,
    monoFont: mono,
    nav: "#990000",
    navTop: "#a50000",
    navBottom: "#880000",
    navShadow:
      "inset 0 -6px 10px rgba(0,0,0,.35), 1px 1px 3px -1px rgba(0,0,0,.25), inset 0 -1px 0 rgba(0,0,0,.85)",
    masthead: "#ffffff",
    logoFilter: "none",
    btnTop: "#ffffff",
    btnBottom: "#dddddd",
    btnEdge: "#bbbbbb",
    btnText: "#444444",
    btnBorder: "#bbbbbb",
    btnHoverShadow: "inset 2px 2px 2px #bbbbbb",
    metaBorder: "#cccccc",
    metaBg: "#ffffff",
    commentBg: "#dddddd",
    footer: "#990000",
    tagUnderline: "#111111",
  },
  // Modelled on AO3's official "Reversi" site skin: charcoal pages, light
  // text, and the archive's red kept for navigation and titles.
  dark: {
    shell: "#1f1f1f",
    page: "#262626",
    panel: "#2c2c2c",
    panelAlt: "#333333",
    hover: "#3a3a3a",
    text: "#e3e3e3",
    textMuted: "#b4b4b4",
    textDim: "#949494",
    heading: "#f2f2f2",
    link: "#e8e8e8",
    linkHover: "#ff8f8f",
    border: "#444444",
    borderStrong: "#5c5c5c",
    accent: "#d14b4b",
    accentHover: "#e86464",
    accentText: "#ff8f8f",
    accentContrast: "#ffffff",
    selection: "#8a1f1f",
    selectionText: "#ffffff",
    inputBg: "#1c1c1c",
    inputFocusBg: "#141414",
    quoteBorder: "#5c5c5c",
    codeBg: "#1b1b1b",
    shadow: "0 2px 8px rgba(0,0,0,.5)",
    scrollThumb: "#5a5a5a",
    danger: "#e16c6c",
    success: "#78b98a",
    warning: "#d4a24d",
    uiFont: lucida,
    proseFont: lucida,
    headingFont: georgia,
    monoFont: mono,
    nav: "#7a0000",
    navTop: "#8c0000",
    navBottom: "#660000",
    navShadow:
      "inset 0 -6px 10px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.5), inset 0 -1px 0 rgba(0,0,0,.9)",
    masthead: "#2a2a2a",
    logoFilter: "brightness(1.75) saturate(1.15)",
    btnTop: "#4a4a4a",
    btnBottom: "#333333",
    btnEdge: "#262626",
    btnText: "#e6e6e6",
    btnBorder: "#5e5e5e",
    btnHoverShadow: "inset 2px 2px 2px #1c1c1c",
    metaBorder: "#4d4d4d",
    metaBg: "#2a2a2a",
    commentBg: "#333333",
    footer: "#5e0000",
    tagUnderline: "#bdbdbd",
  },
};

export const WATTPAD: Record<Mode, Tokens & WattpadExtras> = {
  light: {
    shell: "#ffffff",
    page: "#ffffff",
    panel: "#ffffff",
    panelAlt: "#f6f6f6",
    hover: "#f2f2f2",
    text: "#222222",
    textMuted: "#6f6f6f",
    textDim: "#8c8c8c",
    heading: "#222222",
    link: "#e64809",
    linkHover: "#ff500a",
    border: "#eeeeee",
    borderStrong: "#d6d6d6",
    accent: "#ff500a",
    accentHover: "#ff6122",
    accentText: "#e64809",
    accentContrast: "#ffffff",
    selection: "#ffd9c7",
    selectionText: "#222222",
    inputBg: "#f6f6f6",
    inputFocusBg: "#ffffff",
    quoteBorder: "#ff500a",
    codeBg: "#f6f6f6",
    shadow: "0 2px 12px rgba(18,18,18,.08)",
    scrollThumb: "#cfcfcf",
    danger: "#e0281f",
    success: "#1d9c5a",
    warning: "#c78400",
    uiFont: sourceSans,
    proseFont: sourceSans,
    headingFont: sourceSans,
    monoFont: mono,
    orange: "#ff500a",
    orangeText: "#e64809",
    teal: "#00b2b2",
    purple: "#2a1c60",
    purpleSoft: "#f6f2ff",
    purpleText: "#3b19a9",
    pill: "#121212",
    pillText: "#ffffff",
    marker: "#6f6f6f",
    markerText: "#ffffff",
    heroScrim: "rgba(18,18,18,.55)",
    card: "#ffffff",
  },
  // Wattpad's reader night mode.
  dark: {
    shell: "#121212",
    page: "#121212",
    panel: "#1e1e1e",
    panelAlt: "#232323",
    hover: "#2a2a2a",
    text: "#e9e9e9",
    textMuted: "#a8a8a8",
    textDim: "#7d7d7d",
    heading: "#f5f5f5",
    link: "#ff7a45",
    linkHover: "#ff9466",
    border: "#2c2c2c",
    borderStrong: "#3d3d3d",
    accent: "#ff500a",
    accentHover: "#ff6a2b",
    accentText: "#ff7a45",
    accentContrast: "#ffffff",
    selection: "#a83a0b",
    selectionText: "#ffffff",
    inputBg: "#1e1e1e",
    inputFocusBg: "#232323",
    quoteBorder: "#ff500a",
    codeBg: "#1a1a1a",
    shadow: "0 2px 14px rgba(0,0,0,.55)",
    scrollThumb: "#3f3f3f",
    danger: "#ff6b62",
    success: "#4cc38a",
    warning: "#f0b23d",
    uiFont: sourceSans,
    proseFont: sourceSans,
    headingFont: sourceSans,
    monoFont: mono,
    orange: "#ff500a",
    orangeText: "#ff7a45",
    teal: "#1fc7c7",
    purple: "#5a3fd0",
    purpleSoft: "#241a45",
    purpleText: "#c9b8ff",
    pill: "#f2f2f2",
    pillText: "#121212",
    marker: "#4a4a4a",
    markerText: "#e9e9e9",
    heroScrim: "rgba(0,0,0,.62)",
    card: "#1e1e1e",
  },
};
