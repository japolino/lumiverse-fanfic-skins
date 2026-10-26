import type { Mode, Tokens } from "../tokens";

/** Root selector: present only while a skin is active. */
export const S = "html[data-ffs-skin]";
/** Both native message layouts. */
export const MSG = `:is([data-component="MinimalMessage"], [data-component="BubbleMessage"])`;
export const CHAR = `${MSG}:is([data-part="character"], [data-part="streaming"])`;
export const USER = `${MSG}[data-part="user"]`;

export interface Layout {
  /** Width of the reading column. */
  measure: string;
  /** Horizontal padding inside the column. */
  gutter: string;
  proseSize: number;
  proseLeading: string;
  paragraphGap: string;
  radius: { xs: string; sm: string; md: string; lg: string; xl: string };
}

const mix = (color: string, pct: number, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;

/** Custom properties for injected UI plus overrides of Lumiverse's own tokens. */
export function variables(t: Tokens, mode: Mode, layout: Layout): string {
  const r = layout.radius;
  return `
${S} {
  color-scheme: ${mode} !important;
  --ffs-shell: ${t.shell};
  --ffs-page: ${t.page};
  --ffs-panel: ${t.panel};
  --ffs-panel-alt: ${t.panelAlt};
  --ffs-hover: ${t.hover};
  --ffs-text: ${t.text};
  --ffs-text-muted: ${t.textMuted};
  --ffs-text-dim: ${t.textDim};
  --ffs-heading: ${t.heading};
  --ffs-link: ${t.link};
  --ffs-link-hover: ${t.linkHover};
  --ffs-border: ${t.border};
  --ffs-border-strong: ${t.borderStrong};
  --ffs-accent: ${t.accent};
  --ffs-accent-hover: ${t.accentHover};
  --ffs-accent-text: ${t.accentText};
  --ffs-accent-contrast: ${t.accentContrast};
  --ffs-input: ${t.inputBg};
  --ffs-input-focus: ${t.inputFocusBg};
  --ffs-quote: ${t.quoteBorder};
  --ffs-code: ${t.codeBg};
  --ffs-shadow: ${t.shadow};
  --ffs-ui-font: ${t.uiFont};
  --ffs-prose-font: ${t.proseFont};
  --ffs-heading-font: ${t.headingFont};
  --ffs-mono-font: ${t.monoFont};
  --ffs-measure: ${layout.measure};
  --ffs-gutter: ${layout.gutter};
  --ffs-prose-size: calc(${layout.proseSize}px * var(--lumiverse-font-scale, 1));
  --ffs-prose-leading: ${layout.proseLeading};
  --ffs-paragraph-gap: ${layout.paragraphGap};

  --lumiverse-font-family: ${t.uiFont} !important;
  --lumiverse-font-mono: ${t.monoFont} !important;
  --lumiverse-primary: ${t.accent} !important;
  --lumiverse-primary-hover: ${t.accentHover} !important;
  --lumiverse-primary-muted: ${mix(t.accent, 70, t.page)} !important;
  --lumiverse-primary-text: ${t.accentText} !important;
  --lumiverse-primary-contrast: ${t.accentContrast} !important;
  --lumiverse-primary-light: ${mix(t.accent, 10)} !important;
  --lumiverse-primary-010: ${mix(t.accent, 10)} !important;
  --lumiverse-primary-015: ${mix(t.accent, 15)} !important;
  --lumiverse-primary-020: ${mix(t.accent, 20)} !important;
  --lumiverse-primary-030: ${mix(t.accent, 30)} !important;
  --lumiverse-primary-040: ${mix(t.accent, 40)} !important;
  --lumiverse-primary-050: ${mix(t.accent, 50)} !important;
  --lumiverse-secondary: ${t.textMuted} !important;
  --lumiverse-bg: ${t.shell} !important;
  --lumiverse-bg-elevated: ${t.panel} !important;
  --lumiverse-bg-hover: ${t.hover} !important;
  --lumiverse-bg-dark: ${t.panelAlt} !important;
  --lumiverse-bg-darker: ${t.panelAlt} !important;
  --lumiverse-bg-deep: ${t.shell} !important;
  --lumiverse-bg-040: ${mix(t.shell, 40)} !important;
  --lumiverse-bg-050: ${mix(t.shell, 50)} !important;
  --lumiverse-bg-070: ${mix(t.shell, 70)} !important;
  --lumiverse-bg-elevated-040: ${mix(t.panel, 40)} !important;
  --lumiverse-bg-deep-080: ${mix(t.shell, 80)} !important;
  --lumiverse-text: ${t.text} !important;
  --lumiverse-text-muted: ${t.textMuted} !important;
  --lumiverse-text-dim: ${t.textDim} !important;
  --lumiverse-text-hint: ${t.textDim} !important;
  --lumiverse-text-primary: ${t.text} !important;
  --lumiverse-text-secondary: ${t.textMuted} !important;
  --lumiverse-border: ${t.border} !important;
  --lumiverse-border-hover: ${t.borderStrong} !important;
  --lumiverse-border-light: ${t.border} !important;
  --lumiverse-border-neutral: ${t.border} !important;
  --lumiverse-border-neutral-hover: ${t.borderStrong} !important;
  --lumiverse-border-subtle: ${t.border} !important;
  --lumiverse-danger: ${t.danger} !important;
  --lumiverse-danger-015: ${mix(t.danger, 15)} !important;
  --lumiverse-danger-020: ${mix(t.danger, 20)} !important;
  --lumiverse-danger-050: ${mix(t.danger, 50)} !important;
  --lumiverse-success: ${t.success} !important;
  --lumiverse-success-015: ${mix(t.success, 15)} !important;
  --lumiverse-success-020: ${mix(t.success, 20)} !important;
  --lumiverse-success-050: ${mix(t.success, 50)} !important;
  --lumiverse-warning: ${t.warning} !important;
  --lumiverse-warning-015: ${mix(t.warning, 15)} !important;
  --lumiverse-warning-020: ${mix(t.warning, 20)} !important;
  --lumiverse-warning-050: ${mix(t.warning, 50)} !important;
  --lumiverse-fill-subtle: ${mix(t.text, 4)} !important;
  --lumiverse-fill: ${mix(t.text, 7)} !important;
  --lumiverse-fill-hover: ${mix(t.text, 10)} !important;
  --lumiverse-fill-medium: ${mix(t.text, 12)} !important;
  --lumiverse-fill-strong: ${mix(t.text, 16)} !important;
  --lumiverse-fill-heavy: ${mix(t.text, 22)} !important;
  --lumiverse-fill-deepest: ${mode === "dark" ? "rgba(0,0,0,.6)" : "rgba(0,0,0,.35)"} !important;
  --lumiverse-card-bg: ${t.panel} !important;
  --lumiverse-card-image-bg: ${t.panelAlt} !important;
  --lumiverse-input-bg: ${t.inputBg} !important;
  --lumiverse-surface: ${t.panel} !important;
  --lumiverse-surface-hover: ${t.hover} !important;
  --lumiverse-surface-muted: ${t.panelAlt} !important;
  --lumiverse-icon: ${t.textMuted} !important;
  --lumiverse-icon-muted: ${t.textDim} !important;
  --lumiverse-icon-dim: ${t.textDim} !important;
  --lumiverse-modal-backdrop: ${mode === "dark" ? "rgba(0,0,0,.66)" : "rgba(20,20,20,.45)"} !important;
  --lumiverse-gradient-modal: ${t.panel} !important;
  --lumiverse-swatch-border: ${t.borderStrong} !important;
  --lumiverse-prose-italic: inherit !important;
  --lumiverse-prose-bold: inherit !important;
  --lumiverse-prose-dialogue: inherit !important;
  --lumiverse-prose-blockquote: ${t.textMuted} !important;
  --lumiverse-prose-link: ${t.link} !important;
  --lumiverse-shadow: ${t.shadow} !important;
  --lumiverse-shadow-sm: ${t.shadow} !important;
  --lumiverse-shadow-md: ${t.shadow} !important;
  --lumiverse-shadow-lg: ${t.shadow} !important;
  --lumiverse-shadow-xl: ${t.shadow} !important;
  --lumiverse-radius-xs: ${r.xs} !important;
  --lumiverse-radius-sm: ${r.sm} !important;
  --lumiverse-radius: ${r.md} !important;
  --lumiverse-radius-md: ${r.md} !important;
  --lumiverse-radius-lg: ${r.lg} !important;
  --lumiverse-radius-xl: ${r.xl} !important;
  --lcs-radius-xs: ${r.xs} !important;
  --lcs-radius-sm: ${r.sm} !important;
  --lcs-radius: ${r.md} !important;
  --lcs-glass-bg: ${t.panel} !important;
  --lcs-glass-bg-hover: ${t.hover} !important;
  --lcs-glass-border: ${t.border} !important;
  --lcs-glass-border-hover: ${t.borderStrong} !important;
  --lcs-glass-blur: 0px !important;
  --lcs-glass-soft-blur: 0px !important;
  --lcs-glass-strong-blur: 0px !important;
  --lumiverse-scene-text-scrim: transparent !important;
  scrollbar-color: ${t.scrollThumb} transparent;
}`;
}

/**
 * The continuous-reader treatment: message cards are flattened into one
 * document while keeping every node, so editing, swipes, streaming and
 * selection keep working.
 */
export function reader(): string {
  return `
${S} body, ${S} #root { background: var(--ffs-shell) !important; color: var(--ffs-text) !important; font-family: var(--ffs-ui-font) !important; }
${S} ::selection { background: var(--ffs-accent); color: var(--ffs-accent-contrast); }

/* A lumitheme may already draw its own masthead; ours replaces it. */
${S} [data-component="ChatView"]::before,
${S} [data-component="ChatView"] [class*="_chatToolbar_"]::before { content: none !important; display: none !important; }

/* Reading sites have no wallpapers. */
${S} [data-component="ChatView"] :is([class*="_sceneBackgroundLayer_"], [class*="_sceneTextContextLayer_"], [class*="_wallpaperTransitionLayer_"]) { display: none !important; }
${S} [data-component="ChatView"] { background: var(--ffs-shell) !important; color: var(--ffs-text) !important; }
${S} [data-component="ChatView"] [data-lumiverse-surface="chat-body"],
${S} [data-component="ChatView"] [data-lumiverse-surface="chat-column"],
${S} [data-component="ChatView"] [data-lumiverse-surface="chat-column-inner"] { background: transparent !important; }

${S} [data-component="MessageList"] {
  background: var(--ffs-shell) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  scrollbar-color: var(--ffs-border-strong) transparent;
}
${S} [data-component="MessageList"] > [data-spindle-mount="chat_stream_before"],
${S} [data-component="MessageList"] > [data-spindle-mount="chat_stream_after"] { display: block; }
${S} [data-component="MessageList"] > [class*="_virtualSpace_"] {
  width: min(100%, var(--ffs-measure)) !important;
  margin: 0 auto !important;
  background: var(--ffs-page) !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
}
${S} [data-component="MessageList"] [data-item-type="message"] { padding-bottom: 0 !important; }

/* Composer tool buttons: plain icons, whatever a lumitheme did to buttons. */
${S} [data-component="InputArea"] :is([class*="_actionBtn_"], [class*="_attachBtn_"], [class*="_toolBtn_"], [class*="_iconBtn_"]):not([class*="_sendBtn_"]) {
  background: transparent !important;
  color: var(--ffs-text-muted) !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
${S} [data-component="InputArea"] :is([class*="_actionBtn_"], [class*="_attachBtn_"], [class*="_toolBtn_"], [class*="_iconBtn_"]):not([class*="_sendBtn_"]):hover {
  background: var(--ffs-hover) !important;
  color: var(--ffs-text) !important;
}

${S} ${MSG} {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 var(--ffs-gutter) !important;
  background: transparent !important;
  background-image: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  color: var(--ffs-text) !important;
  overflow: visible !important;
  position: relative;
}
${S} ${MSG}::before, ${S} ${MSG}::after { content: none !important; display: none !important; }
${S} ${MSG}[class*="_selected_"] { outline: 2px solid var(--ffs-accent) !important; outline-offset: -2px; }

${S} ${CHAR} > [class*="_avatar_"],
${S} ${CHAR} > [class*="_avatarBg_"],
${S} ${CHAR} > [class*="_bubble_"] > [class*="_header_"] { display: none !important; }
${S} ${MSG} > [class*="_avatarBg_"] { display: none !important; }

${S} ${MSG} > [class*="_bubble_"] {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
${S} ${MSG} > [class*="_bubble_"] > [class*="_content_"] { padding: 0 !important; margin: 0 !important; background: transparent !important; }
${S} ${MSG}, ${S} ${MSG} [data-component="MessageContent"] { direction: ltr !important; text-align: start !important; }

/* Per-message actions float on hover instead of sitting in the page. */
${S} ${MSG} > :is([class*="_actionsWrap_"], [data-component="BubbleActions"], [class*="_actionsPill_"]) {
  position: absolute !important;
  top: 2px !important;
  right: 6px !important;
  z-index: 8 !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 120ms ease !important;
}
${S} ${MSG}:is(:hover, :focus-within) > :is([class*="_actionsWrap_"], [data-component="BubbleActions"], [class*="_actionsPill_"]) { opacity: 1 !important; pointer-events: auto !important; }
@media (hover: none) {
  ${S} ${MSG} > :is([class*="_actionsWrap_"], [data-component="BubbleActions"], [class*="_actionsPill_"]) {
    position: static !important; opacity: 1 !important; pointer-events: auto !important;
    width: fit-content; margin: 2px 0 8px auto !important;
  }
}
${S} :is([data-component="BubbleActions"], ${MSG} [class*="_actions_"]) {
  background: var(--ffs-panel) !important;
  border: 1px solid var(--ffs-border-strong) !important;
  box-shadow: var(--ffs-shadow) !important;
}

/* Prose. */
${S} [data-component="MessageContent"] {
  max-width: none !important;
  padding: 0 !important;
  color: var(--ffs-text) !important;
  font-family: var(--ffs-prose-font) !important;
  font-size: var(--ffs-prose-size) !important;
  line-height: var(--ffs-prose-leading) !important;
  overflow-wrap: anywhere;
}
${S} [data-component="MessageContent"] :is(p, li) { font-size: inherit !important; line-height: inherit !important; }
${S} [data-component="MessageContent"] p { margin: 0 0 var(--ffs-paragraph-gap) !important; }
${S} [data-component="MessageContent"] :is(em, i, strong, b, q) { color: inherit !important; }
${S} [data-component="MessageContent"] :is(h1, h2, h3, h4) { color: var(--ffs-heading) !important; font-family: var(--ffs-heading-font) !important; line-height: 1.25 !important; margin: 1.3em 0 .6em !important; }
${S} [data-component="MessageContent"] a { color: var(--ffs-link) !important; }
${S} [data-component="MessageContent"] a:hover { color: var(--ffs-link-hover) !important; }
${S} [data-component="MessageContent"] blockquote { margin: 1.1em 0 !important; padding: .1em 1.1em !important; border-left: 3px solid var(--ffs-quote) !important; background: transparent !important; color: var(--ffs-text-muted) !important; }
${S} [data-component="MessageContent"] hr { height: 0 !important; border: 0 !important; border-top: 1px solid var(--ffs-border-strong) !important; margin: 2em auto !important; width: 40% !important; }
${S} [data-component="MessageContent"] :is(code, pre) { font-family: var(--ffs-mono-font) !important; background: var(--ffs-code) !important; color: var(--ffs-text) !important; border: 1px solid var(--ffs-border) !important; }
${S} [data-component="MessageContent"] pre code { border: 0 !important; background: transparent !important; }

${S} [data-component="SwipeControls"] { color: var(--ffs-text-dim) !important; }

/* Forms keep their native metrics but use the site's surfaces. */
${S} :where(button, input, select, textarea) { font-family: inherit; }
${S} input::placeholder, ${S} textarea::placeholder { color: var(--ffs-text-dim); }

/* Drawer and settings surfaces. */
${S} [data-lumiverse-surface="viewport-drawer"] { background: var(--ffs-panel) !important; }
${S} [class*="_panelTitle_"] { font-family: var(--ffs-heading-font) !important; color: var(--ffs-heading) !important; }

@media (max-width: 760px) {
  ${S} { --ffs-gutter: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  ${S} *, ${S} *::before, ${S} *::after { transition: none !important; animation: none !important; }
}`;
}

/**
 * Lumithemes often style every `button` or `input` with !important. Mark each
 * declaration in rules aimed at our own elements (".ffs-…") important too, so
 * the extension's UI looks the same whatever theme is applied.
 */
export function guard(css: string): string {
  return css.replace(/([^{}]*)\{([^{}]*)\}/g, (rule, selector: string, body: string) => {
    if (!selector.includes(".ffs-")) return rule;
    const decls = splitDeclarations(body).map((d) => {
      const trimmed = d.trim();
      if (!trimmed || /!important$/.test(trimmed) || !trimmed.includes(":")) return d;
      return `${d.replace(/\s+$/, "")} !important`;
    });
    return `${selector}{${decls.join(";")}}`;
  });
}

function splitDeclarations(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) {
      out.push(body.slice(start, i));
      start = i + 1;
    }
  }
  out.push(body.slice(start));
  return out;
}
