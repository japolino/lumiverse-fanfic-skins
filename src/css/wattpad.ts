import { WATTPAD, type Mode } from "../tokens";
import { wattpadMarkUri } from "../brand";
import { iconDataUri } from "../icons";
import { CHAR, MSG, S, USER, reader, variables, type Layout } from "./common";

export function wattpadLayout(proseSize: number): Layout {
  return {
    measure: "760px",
    gutter: "clamp(22px, 8vw, 84px)",
    proseSize: proseSize || 18,
    proseLeading: "1.667",
    paragraphGap: "12px",
    radius: { xs: "4px", sm: "4px", md: "8px", lg: "12px", xl: "16px" },
  };
}

export function wattpadCss(mode: Mode, proseSize: number, paragraphComments: boolean): string {
  const t = WATTPAD[mode];
  const layout = wattpadLayout(proseSize);
  const bubble = iconDataUri("comment", t.textMuted, 24);
  const person = iconDataUri("user", t.textMuted, 18);
  // Only the paragraph under the pointer gets a marker, and only faintly.
  const markers = paragraphComments
    ? `
${S} ${CHAR} [data-component="MessageContent"] p { position: relative; }
${S} ${CHAR} [data-component="MessageContent"] p::after {
  content: ""; position: absolute; top: .4em; right: calc(-1 * min(44px, var(--ffs-gutter) - 8px));
  width: 20px; height: 18px; background: ${bubble} center / 20px 18px no-repeat;
  opacity: 0; transition: opacity .2s ease; cursor: pointer;
}
${S} ${CHAR} [data-component="MessageContent"] p:hover::after { opacity: .4; }
@media (max-width: 760px) { ${S} ${CHAR} [data-component="MessageContent"] p::after { display: none; } }`
    : "";

  return `@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap");
${variables(t, mode, layout)}
${S} {
  --ffs-orange: ${t.orange};
  --ffs-orange-text: ${t.orangeText};
  --ffs-pill: ${t.pill};
  --ffs-pill-text: ${t.pillText};
  --ffs-card: ${t.card};
  --ffs-hero-scrim: ${t.heroScrim};
}
${reader()}

/* ---------- Site header ---------- */
${S} .ffs-wp-header {
  flex: 0 0 auto; width: 100%; position: relative; z-index: 30; box-sizing: border-box;
  display: flex; align-items: center; gap: 6px; height: 50px; padding: 0 16px;
  background: var(--ffs-page); border-bottom: 1px solid var(--ffs-border); font-family: var(--ffs-ui-font);
}
${S} .ffs-wp-brand { all: unset; cursor: pointer; display: flex; align-items: center; gap: 4px; }
${S} .ffs-wp-brand b { font: 700 23px/1 var(--ffs-ui-font); letter-spacing: -1.1px; color: var(--ffs-orange); }
${S} .ffs-wp-brand img { width: 25px; height: auto; margin-top: -3px; }
${S} .ffs-wp-right { margin-left: auto; display: flex; align-items: center; gap: 2px; }
${S} .ffs-wp-icon { all: unset; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; color: var(--ffs-text-muted); }
${S} .ffs-wp-icon:hover, ${S} .ffs-wp-icon:focus-visible { background: var(--ffs-hover); color: var(--ffs-text); }
${S} .ffs-wp-avatar { width: 30px; height: 30px; margin-left: 6px; border-radius: 50%; object-fit: cover; background: var(--ffs-panel-alt); cursor: pointer; }

/* ---------- Story bar (native chat toolbar) ---------- */
${S} [data-component="ChatView"] [class*="_chatToolbar_"] {
  position: relative; background: var(--ffs-page) !important; border: 0 !important; border-bottom: 1px solid var(--ffs-border) !important;
  box-shadow: 0 1px 2px rgba(0,0,0,.04) !important; padding: 6px 16px !important; min-height: 50px; gap: 4px; justify-content: flex-end !important;
}
${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"] { border-radius: 4px !important; background: transparent !important; border: 0 !important; color: var(--ffs-text-muted) !important; box-shadow: none !important; }
${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"]:hover { background: var(--ffs-hover) !important; color: var(--ffs-text) !important; }
${S} .ffs-wp-storybar { display: contents; }
${S} .ffs-wp-story {
  all: unset; box-sizing: border-box; cursor: pointer; order: -1; margin-right: auto; display: flex; align-items: center; gap: 10px;
  min-width: 0; height: 38px; padding: 0 8px 0 4px; border-radius: 6px; color: var(--ffs-text-muted); font-family: var(--ffs-ui-font);
}
${S} .ffs-wp-story:hover, ${S} .ffs-wp-story:focus-visible { background: var(--ffs-hover); }
${S} .ffs-wp-story img { width: 22px; height: 33px; object-fit: cover; border-radius: 2px; flex: 0 0 auto; background: var(--ffs-panel-alt); }
${S} .ffs-wp-story .meta { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
${S} .ffs-wp-story .meta b { font-size: 14px; font-weight: 600; color: var(--ffs-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40vw; }
${S} .ffs-wp-story .meta span { font-size: 12px; color: var(--ffs-text-muted); white-space: nowrap; }
${S} .ffs-wp-story svg { flex: 0 0 auto; opacity: .6; }
${S} .ffs-wp-progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; pointer-events: none; z-index: 5; }
${S} .ffs-wp-progress i { display: block; height: 100%; width: var(--ffs-progress, 0%); background: var(--ffs-text-dim); opacity: .5; }

/* ---------- Story hero ---------- */
${S} .ffs-wp-hero { position: relative; overflow: hidden; isolation: isolate; color: #fff; font-family: var(--ffs-ui-font); }
${S} .ffs-wp-hero .bg { position: absolute; inset: -40px; z-index: -2; background-size: cover; background-position: center 30%; filter: blur(26px) saturate(1.2); transform: scale(1.1); }
${S} .ffs-wp-hero::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--ffs-hero-scrim); }
${S} .ffs-wp-hero .inner { display: flex; gap: 22px; align-items: center; width: min(100%, 720px); margin: 0 auto; padding: 30px 20px; box-sizing: border-box; }
${S} .ffs-wp-hero .cover { flex: 0 0 auto; width: 108px; aspect-ratio: 2 / 3; border-radius: 4px; object-fit: cover; box-shadow: 0 4px 16px rgba(0,0,0,.4); background: rgba(255,255,255,.1); }
${S} .ffs-wp-hero h2 { margin: 0 0 4px; font-size: 22px; font-weight: 600; line-height: 1.2; color: #fff; font-family: var(--ffs-ui-font); }
${S} .ffs-wp-hero .byline { font-size: 13px; opacity: .8; margin-bottom: 10px; }
${S} .ffs-wp-hero p { margin: 0; font-size: 14px; line-height: 1.5; opacity: .9; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; }
${S} .ffs-wp-hero .edit { all: unset; cursor: pointer; display: inline-block; margin-top: 10px; font-size: 12px; opacity: .65; text-decoration: underline; text-underline-offset: 2px; }
${S} .ffs-wp-hero .edit:hover, ${S} .ffs-wp-hero .edit:focus-visible { opacity: 1; }
@media (max-width: 560px) {
  ${S} .ffs-wp-hero .inner { flex-direction: column; text-align: center; padding: 24px 16px; }
}

/* ---------- Parts ---------- */
${S} .ffs-wp-ch { text-align: center; margin: 40px 0 22px; font-family: var(--ffs-ui-font); }
${S} .ffs-wp-ch h3 { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.3; color: var(--ffs-heading); letter-spacing: .1px; font-family: var(--ffs-ui-font); }
${markers}

/* ---------- Your turns, as reader comments ---------- */
${S} ${USER} { padding: 0 var(--ffs-gutter) !important; margin: 18px 0 22px !important; }
${S} ${USER}:is([data-component="MinimalMessage"]) {
  display: grid !important; grid-template-columns: 40px minmax(0, 1fr); column-gap: 10px; align-items: start;
}
${S} ${USER} > [class*="_avatar_"] {
  display: block !important; width: 40px !important; height: 40px !important; margin: 12px 0 0 !important; border-radius: 50% !important; overflow: hidden; position: static !important;
}
${S} ${USER} > [class*="_avatar_"] * { width: 100% !important; height: 100% !important; border-radius: 50% !important; }
${S} ${USER} > [class*="_avatar_"] img { object-fit: cover !important; }
${S} ${USER} > [class*="_bubble_"] {
  background: var(--ffs-panel-alt) !important; border-radius: 12px !important; padding: 10px 14px 6px !important;
}
${S} ${USER} > [class*="_bubble_"] > [class*="_header_"] { display: flex !important; align-items: baseline; gap: 8px; margin: 0 0 2px !important; padding: 0 !important; background: transparent !important; }
${S} ${USER} [class*="_name_"] { font: 700 14px/1.3 var(--ffs-ui-font) !important; color: var(--ffs-text) !important; }
${S} ${USER} [class*="_metaPill_"] { background: transparent !important; border: 0 !important; padding: 0 !important; color: var(--ffs-text-dim) !important; font-size: 12px !important; }
${S} ${USER} [data-component="MessageContent"] { font-size: calc(var(--ffs-prose-size) * .86) !important; line-height: 1.5 !important; }
${S} ${USER} [data-component="MessageContent"] p { margin-bottom: 6px !important; }

/* ---------- End of part ---------- */
${S} .ffs-wp-end { width: min(100%, var(--ffs-measure)); margin: 0 auto; padding: 26px var(--ffs-gutter) 40px; box-sizing: border-box; background: var(--ffs-page); font-family: var(--ffs-ui-font); color: var(--ffs-text); text-align: center; }
${S} .ffs-wp-next {
  all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  height: 40px; padding: 0 22px; border-radius: 20px; border: 1px solid var(--ffs-border); color: var(--ffs-text); font-weight: 600; font-size: 15px;
}
${S} .ffs-wp-next:hover, ${S} .ffs-wp-next:focus-visible { background: var(--ffs-hover); }
${S} .ffs-wp-notice { margin: 10px 0 0; font-size: 13px; color: var(--ffs-text-muted); }

/* ---------- Composer: Wattpad's comment box, docked under the page ---------- */
${S} [data-component="InputArea"] {
  left: 0 !important; right: 0 !important;
  bottom: calc(var(--app-keyboard-inset-bottom, 0px) / var(--lumiverse-ui-scale, 1)) !important;
  padding: 8px max(14px, calc((100% - var(--ffs-measure)) / 2 + 14px)) calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  gap: 6px !important;
  background: var(--ffs-page) !important; background-image: none !important;
  border: 0 !important; border-top: 1px solid var(--ffs-border) !important; border-radius: 0 !important;
  box-shadow: 0 -8px 24px ${mode === "dark" ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.06)"} !important;
  backdrop-filter: none !important;
}
${S} [data-component="InputArea"] [class*="_actionBtn_"]:hover { color: var(--ffs-orange-text) !important; }
${S} [data-component="InputArea"] [class*="_inputRow_"] { align-items: flex-end !important; gap: 8px !important; }
/* You, beside the field, like on a Wattpad comment. */
${S} [data-component="InputArea"] [class*="_inputRow_"]::before {
  content: ""; flex: 0 0 36px; width: 36px; height: 36px; margin: 0 2px 2px 0; border-radius: 50%;
  background: var(--ffs-persona-avatar, none) center / cover no-repeat, ${person} center / 18px no-repeat, var(--ffs-panel-alt);
  box-shadow: inset 0 0 0 1px var(--ffs-border);
}
${S} [data-component="InputArea"] [class*="_inputWrapper_"] {
  background: var(--ffs-panel-alt) !important; border: 1px solid var(--ffs-border) !important; border-radius: 20px !important;
  box-shadow: none !important; padding: 0 6px !important;
}
${S} [data-component="InputArea"] [class*="_inputWrapper_"]:focus-within {
  border-color: var(--ffs-orange) !important; background: var(--ffs-input-focus) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ffs-orange) 18%, transparent) !important;
}
${S} [data-component="InputArea"] :is(textarea, [class*="_textareaMirror_"]) { font-family: var(--ffs-ui-font) !important; }
${S} [data-component="InputArea"] textarea { background: transparent !important; color: var(--ffs-text) !important; }
${S} [data-component="InputArea"] textarea::placeholder { color: var(--ffs-text-dim) !important; }
/* The orange Post pill; it turns into a dark Stop pill while a part is being written. */
${S} [data-component="InputArea"] [class*="_sendBtnShell_"] { width: auto !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"] {
  width: auto !important; min-width: 40px; height: 40px !important; padding: 0 17px 0 14px !important; gap: 6px;
  border: 0 !important; border-radius: 999px !important; box-shadow: none !important; transform: none !important;
  background: var(--ffs-orange) !important; color: #fff !important;
  font: 600 15px/1 var(--ffs-ui-font) !important; letter-spacing: .1px;
}
${S} [data-component="InputArea"] [class*="_sendBtn_"]:hover:not(:disabled) { background: var(--ffs-accent-hover) !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"]:active:not(:disabled) { transform: scale(.97) !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"]:disabled { background: var(--ffs-panel-alt) !important; color: var(--ffs-text-dim) !important; opacity: 1 !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"]:not([class*="_sendBtnHoldTracking_"])::after { content: "Post"; }
${S} [data-component="InputArea"] [class*="_sendBtn_"][class*="_sendBtnStop_"] { background: var(--ffs-pill) !important; color: var(--ffs-pill-text) !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"][class*="_sendBtnStop_"]:hover:not(:disabled) { background: var(--ffs-pill) !important; filter: brightness(1.15); }
${S} [data-component="InputArea"] [class*="_sendBtn_"][class*="_sendBtnStop_"]::after { content: "Stop"; }
@media (max-width: 560px) {
  ${S} [data-component="InputArea"] [class*="_inputRow_"]::before { display: none; }
  ${S} [data-component="InputArea"] [class*="_sendBtn_"] { width: 40px !important; padding: 0 !important; }
  ${S} [data-component="InputArea"] [class*="_sendBtn_"]::after { content: none !important; }
}

/* ---------- Buttons and surfaces ---------- */
${S} button[class*="_btnPrimary_"] { border-radius: 999px !important; }
${S} [data-spindle-mount="sidebar"] { background: var(--ffs-page) !important; border-right: 1px solid var(--ffs-border) !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id] { color: var(--ffs-text-muted) !important; border-radius: 8px !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id]:hover { background: var(--ffs-hover) !important; color: var(--ffs-text) !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id][class*="_tabBtnActive_"] { color: var(--ffs-orange-text) !important; background: ${mode === "dark" ? "rgba(255,80,10,.12)" : "#fff1ea"} !important; }
${S} [class*="_panelTitle_"] { font-weight: 700 !important; }

/* ---------- Home ---------- */
${S} [data-component="LandingPage"] { background: var(--ffs-page) !important; }
${S} [data-component="LandingPage"] :is([data-landing-background-glow], [data-landing-background-grid]) { display: none !important; }
${S}[data-ffs-home] [data-component="LandingPageHeader"] { background: transparent !important; border: 0 !important; box-shadow: none !important; }
${S}[data-ffs-home] [data-component="LandingPageHeader"] > [class*="_logo_"] { visibility: hidden; width: 0; overflow: hidden; }
${S} [data-component="LandingPageHeader"] [class*="_accountBtn_"] { border-radius: 999px !important; background: var(--ffs-panel-alt) !important; border: 0 !important; color: var(--ffs-text) !important; box-shadow: none !important; font-weight: 600; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardTilt_"] { transform: none !important; }
/* A library shelf: the cover on top, the title and stats underneath, same footprint. */
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_card_"]:has(> [class*="_cardBtn_"]) { aspect-ratio: 3 / 4; border-radius: 0 !important; border: 0 !important; box-shadow: none !important; background: transparent !important; overflow: visible; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardBtn_"] { height: 100% !important; display: flex !important; flex-direction: column !important; background: transparent !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; outline: none !important; padding: 0 !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardShine_"] { display: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardImage_"] {
  aspect-ratio: auto !important; flex: 1 1 auto !important; min-height: 0 !important; height: auto !important;
  border-radius: 4px !important; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .15s ease, box-shadow .15s ease;
}
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardBtn_"]:hover [class*="_cardImage_"] { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardImageOverlay_"] { display: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardContent_"] { position: static !important; inset: auto !important; flex: 0 0 auto !important; padding: 8px 2px 2px !important; background: transparent !important; text-align: left !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardName_"] { font: 600 calc(15px * var(--lumiverse-font-scale, 1))/1.25 var(--ffs-ui-font) !important; color: var(--ffs-heading) !important; text-shadow: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardName_"] svg { color: var(--ffs-orange) !important; fill: currentColor !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] :is([class*="_cardTime_"], [class*="_cardMeta_"]) { color: var(--ffs-text-muted) !important; text-shadow: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_favoriteCard_"] [class*="_cardImage_"]::after {
  content: ""; position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 3px;
  background: var(--ffs-orange) ${wattpadMarkUri("#ffffff")} center / 14px auto no-repeat;
}
${S} [data-component="LandingPageTabs"] button { border-radius: 999px !important; font-weight: 600 !important; }
${S} [data-component="HomepageCharacterLibrary"] { background: var(--ffs-page) !important; border-color: var(--ffs-border) !important; }
${S} [data-component="HomepageCharacterLibrary"] h2, ${S} [data-component="LandingPageChats"] h2 { font: 600 calc(22px * var(--lumiverse-font-scale, 1))/1.3 var(--ffs-ui-font) !important; }
${S} .ffs-wp-welcome { width: 100%; margin: 18px 0 8px; padding: 0; box-sizing: border-box; font-family: var(--ffs-ui-font); }
${S} .ffs-wp-welcome h2 { margin: 0; font-size: calc(34px * var(--lumiverse-font-scale, 1)); font-weight: 600; color: var(--ffs-heading); letter-spacing: -.3px; }
${S} .ffs-wp-welcome p { margin: 4px 0 0; color: var(--ffs-text-muted); font-size: 15px; }
${S} ${MSG} [data-spindle-mount="message_body_before"] { display: block; }
`;
}
