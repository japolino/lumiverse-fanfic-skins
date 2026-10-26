import { AO3, type Mode } from "../tokens";
import { ao3RequiredTags } from "../generated/assets";
import { CHAR, MSG, S, USER, reader, variables, type Layout } from "./common";

export function ao3Layout(proseSize: number): Layout {
  return {
    measure: "880px",
    gutter: "clamp(20px, 5vw, 56px)",
    proseSize: proseSize || 16,
    proseLeading: "1.5",
    paragraphGap: "1.286em",
    radius: { xs: "2px", sm: "3px", md: "4px", lg: "5px", xl: "6px" },
  };
}

/** Sprite offsets from AO3's 13-group-blurb.css. */
export const REQUIRED_TAG_POS: Record<string, string> = {
  "rating-general": "-50px -25px",
  "rating-teen": "0 -25px",
  "rating-mature": "-75px -25px",
  "rating-explicit": "-25px -25px",
  "rating-notrated": "-150px 0",
  "warning-none": "-150px 0",
  "warning-choosenotto": "-125px -25px",
  "warning-yes": "-150px -25px",
  "category-none": "-150px 0",
  "category-ff": "-25px 0",
  "category-gen": "-50px 0",
  "category-mm": "0 0",
  "category-fm": "-75px 0",
  "category-multi": "-100px 0",
  "category-other": "-125px 0",
  "complete-yes": "-175px -25px",
  "complete-no": "-100px -25px",
};

export function ao3Css(mode: Mode, proseSize: number): string {
  const t = AO3[mode];
  const layout = ao3Layout(proseSize);
  const bevel = `linear-gradient(${t.btnTop} 2%, ${t.btnBottom} 95%, ${t.btnEdge} 100%)`;
  const sprite = Object.entries(REQUIRED_TAG_POS)
    .map(([k, pos]) => `${S} .ffs-req .${k} { background-position: ${pos}; }`)
    .join("\n");

  return `
${variables(t, mode, layout)}
${S} {
  --ffs-nav: ${t.nav};
  --ffs-nav-top: ${t.navTop};
  --ffs-nav-bottom: ${t.navBottom};
  --ffs-nav-shadow: ${t.navShadow};
  --ffs-masthead: ${t.masthead};
  --ffs-logo-filter: ${t.logoFilter};
  --ffs-bevel: ${bevel};
  --ffs-btn-text: ${t.btnText};
  --ffs-btn-border: ${t.btnBorder};
  --ffs-btn-hover-shadow: ${t.btnHoverShadow};
  --ffs-meta-border: ${t.metaBorder};
  --ffs-meta-bg: ${t.metaBg};
  --ffs-comment-bg: ${t.commentBg};
  --ffs-footer: ${t.footer};
  --ffs-tag-underline: ${t.tagUnderline};
}
${reader()}

/* ---------- Site header ---------- */
${S} .ffs-ao3-header { flex: 0 0 auto; width: 100%; position: relative; z-index: 30; font-family: var(--ffs-ui-font); }
${S} .ffs-ao3-masthead {
  display: flex; align-items: center; gap: 12px;
  min-height: 58px; padding: 6px max(14px, calc((100% - 1180px) / 2));
  background: var(--ffs-masthead);
}
${S} .ffs-ao3-brand { display: flex; align-items: center; gap: 2px; color: var(--ffs-accent-text); text-decoration: none; cursor: pointer; border: 0; background: none; padding: 0; }
${S} .ffs-ao3-logo { height: 42px; width: auto; filter: var(--ffs-logo-filter); }
${S} .ffs-ao3-wordmark { font: 400 calc(24px * var(--lumiverse-font-scale, 1))/1 Georgia, serif; color: ${mode === "dark" ? "#ff8f8f" : "#990000"}; white-space: nowrap; }
${S} .ffs-ao3-wordmark sup { font-size: .45em; vertical-align: super; margin-left: 3px; color: var(--ffs-text-dim); }
${S} .ffs-ao3-user { margin-left: auto; display: flex; gap: 14px; align-items: center; font-size: 13px; color: var(--ffs-text); }
${S} .ffs-ao3-user button { all: unset; cursor: pointer; color: var(--ffs-text); }
${S} .ffs-ao3-user button:hover { color: var(--ffs-accent-text); text-decoration: underline; }
${S} .ffs-ao3-nav {
  display: flex; align-items: center; gap: 2px; min-height: 30px;
  padding: 0 max(8px, calc((100% - 1180px) / 2 - 6px));
  background: linear-gradient(var(--ffs-nav-top), var(--ffs-nav) 55%, var(--ffs-nav-bottom));
  box-shadow: var(--ffs-nav-shadow);
}
${S} .ffs-ao3-nav button.ffs-ao3-navlink { all: unset; cursor: pointer; color: #fff; font-size: 14px; padding: 6px 10.5px; line-height: 18px; }
${S} .ffs-ao3-nav button.ffs-ao3-navlink:hover, ${S} .ffs-ao3-nav button.ffs-ao3-navlink:focus-visible { background: #ddd; color: #900; outline: none; }
${S} .ffs-ao3-search { margin-left: auto; display: flex; align-items: center; gap: 4px; }
${S} .ffs-ao3-search input { width: 150px; height: 18px; border: 0; border-radius: 14px; padding: 2px 10px; background: #eee; color: #2a2a2a; font: inherit; font-size: 12px; box-shadow: inset 0 1px 2px #bbb; }
${S} .ffs-ao3-search button { all: unset; cursor: pointer; font-size: 12px; padding: 2px 9px; border-radius: 14px; background: #eee; color: #2a2a2a; border: 1px solid #bbb; }
${S} .ffs-ao3-search button:hover { color: #900; }

/* ---------- AO3 buttons ---------- */
${S} .ffs-ao3-btn,
${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"],
${S} button[class*="_btn_"]:not([class*="_btnPrimary_"]):not([class*="_btnDanger_"]):not([class*="_btnGhost_"]):not([class*="_btnDangerGhost_"]):not([class*="_btnIcon"]):not([aria-pressed="true"]) {
  background: var(--ffs-bevel) !important;
  color: var(--ffs-btn-text) !important;
  border: 1px solid var(--ffs-btn-border) !important;
  border-bottom-color: ${mode === "dark" ? "#222" : "#aaa"} !important;
  border-radius: .25em !important;
  box-shadow: none !important;
}
${S} .ffs-ao3-btn { display: inline-flex; align-items: center; gap: 5px; padding: .25em .75em; font: inherit; font-size: 13px; line-height: 1.286; cursor: pointer; white-space: nowrap; text-decoration: none; }
${S} .ffs-ao3-btn:hover:not(:disabled),
${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"]:hover:not(:disabled),
${S} button[class*="_btn_"]:not([class*="_btnPrimary_"]):not([class*="_btnDanger_"]):not([class*="_btnGhost_"]):not([class*="_btnDangerGhost_"]):not([class*="_btnIcon"]):hover:not(:disabled) {
  color: var(--ffs-accent-text) !important;
  border-top-color: #999 !important; border-left-color: #999 !important;
  box-shadow: var(--ffs-btn-hover-shadow) !important;
}
${S} .ffs-ao3-btn[aria-pressed="true"] { color: var(--ffs-accent-text) !important; box-shadow: var(--ffs-btn-hover-shadow) !important; }

/* ---------- Work navigation (native chat toolbar) ---------- */
${S} [data-component="ChatView"] [class*="_chatToolbar_"] {
  background: transparent !important; border: 0 !important; box-shadow: none !important;
  justify-content: flex-end !important; gap: 4px; padding: 8px max(14px, calc((100% - var(--ffs-measure)) / 2)) !important;
  min-height: 40px;
}
${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"] { width: auto !important; min-width: 30px; gap: 5px; padding: 3px 8px !important; }
@media (min-width: 900px) {
  ${S} [data-component="ChatView"] [class*="_chatToolbar_"] [class*="_toolbarBtn_"][aria-label]::after {
    content: attr(aria-label); font: 400 12px/1.3 var(--ffs-ui-font); white-space: nowrap;
  }
}
${S} .ffs-ao3-worknav { display: contents; }
${S} .ffs-ao3-worknav .ffs-ao3-btn { font-size: 12px; padding: 3px 9px; }

/* ---------- Work preface ---------- */
${S} .ffs-ao3-work { width: min(100%, var(--ffs-measure)); margin: 0 auto; padding: 18px var(--ffs-gutter) 4px; box-sizing: border-box; background: var(--ffs-page); color: var(--ffs-text); font-family: var(--ffs-ui-font); font-size: 13px; line-height: 1.5; }
${S} .ffs-ao3-meta { position: relative; margin: 0 0 1.286em; padding: 1.286em .75em .4em; border: 1px solid var(--ffs-meta-border); background: var(--ffs-meta-bg); display: grid; grid-template-columns: minmax(9em, 25%) 1fr; column-gap: 1em; }
${S} .ffs-ao3-meta dt { color: var(--ffs-text); margin: 0 0 .643em; }
${S} .ffs-ao3-meta dt.warn { font-weight: 700; }
${S} .ffs-ao3-meta dd { margin: 0 0 .643em; min-width: 0; }
${S} .ffs-ao3-meta dd ul { display: inline; margin: 0; padding: 0; }
${S} .ffs-ao3-meta dd li { display: inline; list-style: none; }
${S} .ffs-ao3-meta dd li + li::before { content: ", "; }
${S} .ffs-ao3-tag { color: var(--ffs-link); border-bottom: 1px dotted var(--ffs-tag-underline); text-decoration: none; }
${S} .ffs-ao3-tag.strong { font-weight: 700; }
${S} .ffs-ao3-meta .stats { display: flex; flex-wrap: wrap; gap: 0 .9em; margin: 0; }
${S} .ffs-ao3-meta .stats span b { font-weight: 400; color: var(--ffs-text); }
${S} .ffs-ao3-meta .stats span i { font-style: normal; color: var(--ffs-text); margin-left: .35em; }
${S} .ffs-ao3-edit { position: absolute; right: .75em; bottom: .5em; font-size: 11px; }
${S} .ffs-ao3-edit button { all: unset; cursor: pointer; color: var(--ffs-text-dim); border-bottom: 1px dotted currentColor; }
${S} .ffs-ao3-edit button:hover { color: var(--ffs-accent-text); }
${S} .ffs-req { position: absolute; top: .8em; right: .75em; display: grid; grid-template-columns: repeat(2, 25px); gap: 3px; margin: 0; padding: 0; list-style: none; }
${S} .ffs-req span { display: block; width: 25px; height: 25px; background-image: url("${ao3RequiredTags}"); background-repeat: no-repeat; }
${sprite}
${S} .ffs-ao3-meta.has-req { padding-right: 70px; }

${S} .ffs-ao3-preface { margin: 1.5em 3em .5em; padding: .643em .643em 0; }
${S} .ffs-ao3-preface h2 { font: 400 calc(2.1em * var(--lumiverse-font-scale, 1))/1.2 var(--ffs-heading-font); color: var(--ffs-heading); text-align: center; margin: 0 0 .3em; }
${S} .ffs-ao3-preface .byline { font: 400 1.15em/1.3 var(--ffs-heading-font); text-align: center; margin: 0 0 1.2em; color: var(--ffs-text); }
${S} .ffs-ao3-preface .byline a { color: ${mode === "dark" ? "#ff8f8f" : "#990000"}; text-decoration: none; border-bottom: 1px solid; }
${S} .ffs-ao3-preface .module { margin: 0 0 1em; }
${S} .ffs-ao3-preface h3 { font: 400 1.15em/1.3 var(--ffs-heading-font); color: var(--ffs-heading); border-bottom: 1px solid var(--ffs-text); margin: 0 0 .5em; padding: 0 0 .1em; }
${S} .ffs-ao3-preface blockquote { margin: .643em 0 0 3em; padding: 0; border: 0; color: var(--ffs-text); font-size: 1.05em; white-space: pre-line; }
@media (max-width: 760px) {
  ${S} .ffs-ao3-preface { margin: 1em 0 .5em; }
  ${S} .ffs-ao3-preface blockquote { margin-left: 1em; }
  ${S} .ffs-ao3-meta { grid-template-columns: 1fr; }
  ${S} .ffs-ao3-meta dt { margin: 0; font-weight: 700; }
}

/* ---------- Chapters ---------- */
${S} .ffs-ao3-ch { margin: 1.5em 0 1.6em; padding-top: 1.1em; border-top: 1px solid var(--ffs-text); text-align: center; }
${S} .ffs-ao3-ch h3 { margin: 0; font: 400 calc(1.25em) var(--ffs-heading-font); color: var(--ffs-heading); }
${S} .ffs-ao3-ch h3 span { border-bottom: 1px solid currentColor; }
${S} .ffs-ao3-ch .ffs-ch-title { display: block; margin-top: .3em; font-size: .85em; color: var(--ffs-text-muted); }

/* ---------- Your turns, as AO3 comments ---------- */
${S} ${USER} { padding: 0 var(--ffs-gutter) !important; margin: 1.2em 0 1.4em !important; }
${S} ${USER} > [class*="_bubble_"] {
  border: 1px solid var(--ffs-border-strong) !important;
  background: var(--ffs-page) !important;
  position: relative !important;
  padding: 0 0 .2em !important;
}
${S} ${USER} > [class*="_bubble_"] > [class*="_header_"] {
  display: flex !important; align-items: center; gap: .5em; flex-wrap: wrap;
  background: var(--ffs-comment-bg) !important; padding: .35em .75em .35em 76px !important; margin: 0 !important;
  font-family: var(--ffs-ui-font) !important; font-size: 13px !important; color: var(--ffs-text) !important; min-height: 24px;
}
${S} ${USER} [class*="_name_"] { font-weight: 700 !important; color: ${mode === "dark" ? "#ff8f8f" : "#990000"} !important; font-size: 13px !important; }
${S} ${USER} [class*="_metaPill_"] { order: 2; margin-left: auto !important; background: transparent !important; border: 0 !important; color: var(--ffs-text-muted) !important; font-size: 11px !important; }
${S} ${USER} [data-spindle-mount="message_header"] { order: 1; }
${S} ${USER} .ffs-ao3-on { color: var(--ffs-text-muted); font-size: 12px; }
${S} ${USER} [data-component="MessageContent"] { font-family: var(--ffs-ui-font) !important; font-size: calc(var(--ffs-prose-size) * .95) !important; padding: .75em .9em .2em 76px !important; min-height: 3.3em; }
${S} ${USER} > [class*="_avatar_"] {
  display: block !important; position: absolute !important; left: calc(var(--ffs-gutter) + 8px) !important; top: -8px !important; z-index: 2;
  width: 56px !important; height: 56px !important; margin: 0 !important; border-radius: 0 !important;
  border-bottom: 5px solid var(--ffs-comment-bg) !important; background: var(--ffs-panel-alt);
}
${S} ${USER} > [class*="_avatar_"] * { width: 100% !important; height: 100% !important; border-radius: 0 !important; }
${S} ${USER} > [class*="_avatar_"] img { object-fit: cover !important; }
${S} ${USER} .ffs-ao3-on { color: var(--ffs-text); font-weight: 400; }
${S} [data-component="BubbleMessage"][data-part="user"] [class*="_headerLeft_"] [class*="_avatar_"] { width: 28px !important; height: 28px !important; border-radius: 0 !important; }

/* ---------- End of work ---------- */
${S} .ffs-ao3-end { width: min(100%, var(--ffs-measure)); margin: 0 auto; padding: 1.2em var(--ffs-gutter) 2.4em; box-sizing: border-box; background: var(--ffs-page); font-family: var(--ffs-ui-font); font-size: 13px; color: var(--ffs-text); }
${S} .ffs-ao3-end .actions { display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; margin: 0 0 1em; padding: 0; list-style: none; }
${S} .ffs-ao3-kudos { display: flex; gap: .6em; align-items: flex-start; padding: .75em .25em; border-top: 1px solid var(--ffs-border); }
${S} .ffs-ao3-kudos .heart { flex: 0 0 auto; width: 26px; height: 22px; color: ${mode === "dark" ? "#ff8f8f" : "#990000"}; }
${S} .ffs-ao3-kudos .heart svg { width: 100%; height: 100%; }
${S} .ffs-ao3-kudos a { color: var(--ffs-link); border-bottom: 1px dotted var(--ffs-tag-underline); }
${S} .ffs-ao3-kudos.pop .heart { animation: ffs-pop .5s ease; }
@keyframes ffs-pop { 0% { transform: scale(1); } 40% { transform: scale(1.5); } 100% { transform: scale(1); } }
${S} .ffs-ao3-colophon { margin-top: 1.4em; text-align: center; font-size: 11px; color: var(--ffs-text-dim); }

/* ---------- Composer, as the comment form ---------- */
${S} [data-component="InputArea"] {
  background: var(--ffs-comment-bg) !important;
  border: 1px solid var(--ffs-border-strong) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  width: min(calc(100% - 16px), var(--ffs-measure)) !important;
  margin-left: auto !important; margin-right: auto !important;
  box-sizing: border-box;
}
${S} [data-component="InputArea"] [class*="_inputWrapper_"],
${S} [data-component="InputArea"] textarea {
  background: var(--ffs-input) !important;
  border-radius: 0 !important;
}
${S} [data-component="InputArea"] [class*="_inputWrapper_"] { box-shadow: inset 0 1px 2px ${mode === "dark" ? "#000" : "#ccc"} !important; border: 1px solid var(--ffs-border-strong) !important; }
${S} [data-component="InputArea"] [class*="_inputWrapper_"]:focus-within { background: var(--ffs-input-focus) !important; }
${S} [data-component="InputArea"] textarea { font-family: var(--ffs-ui-font) !important; color: var(--ffs-text) !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"] { background: var(--ffs-bevel) !important; color: var(--ffs-btn-text) !important; border: 1px solid var(--ffs-btn-border) !important; border-radius: .25em !important; box-shadow: none !important; }
${S} [data-component="InputArea"] [class*="_sendBtn_"]:hover { color: var(--ffs-accent-text) !important; }

/* ---------- Drawer, as the dashboard ---------- */
${S} [data-spindle-mount="sidebar"] { background: var(--ffs-panel) !important; border-top: 8px solid var(--ffs-nav) !important; border-bottom: 5px solid var(--ffs-nav) !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id] { border-radius: 0 !important; color: var(--ffs-text-muted) !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id]:hover { color: var(--ffs-accent-text) !important; background: var(--ffs-hover) !important; }
${S} [data-spindle-mount="sidebar"] [data-tab-id][class*="_tabBtnActive_"] { color: var(--ffs-accent-text) !important; background: var(--ffs-panel-alt) !important; box-shadow: inset 3px 0 0 var(--ffs-nav) !important; }
${S} [class*="_panelHeader_"]:has([class*="_panelTitle_"]) { border-bottom: 2px solid var(--ffs-border-strong) !important; background: var(--ffs-panel) !important; }
${S} [class*="_panelTitle_"] { font-weight: 400 !important; }

/* ---------- Home ---------- */
${S} [data-component="LandingPage"] { background: var(--ffs-shell) !important; }
${S} [data-component="LandingPage"] :is([class*="_bgGlow_"], [data-landing-background-glow], [data-landing-background-grid]) { display: none !important; }
${S}[data-ffs-home] [data-component="LandingPageHeader"] { background: transparent !important; border: 0 !important; box-shadow: none !important; padding-top: 10px !important; padding-bottom: 6px !important; }
${S}[data-ffs-home] [data-component="LandingPageHeader"] > [class*="_logo_"] { visibility: hidden; width: 0; overflow: hidden; }
${S} [data-component="LandingPageHeader"] [class*="_accountBtn_"] { background: var(--ffs-bevel) !important; color: var(--ffs-btn-text) !important; border: 1px solid var(--ffs-btn-border) !important; border-radius: .25em !important; box-shadow: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardTilt_"] { transform: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_card_"]:has(> [class*="_cardBtn_"]) {
  border-radius: 0 !important; border: 1px solid var(--ffs-border) !important; background: var(--ffs-page) !important; box-shadow: none !important; overflow: hidden;
}
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_card_"]:has(> [class*="_cardBtn_"]):hover { border-color: var(--ffs-border-strong) !important; box-shadow: ${mode === "dark" ? "0 0 0 1px #5c5c5c" : "1px 1px 5px #aaa"} !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardShine_"] { display: none !important; }
/* Each card becomes a work blurb: picture above, heading and stats below, same footprint. */
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_card_"]:has(> [class*="_cardBtn_"]) { aspect-ratio: 3 / 4; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardBtn_"] { height: 100% !important; display: flex !important; flex-direction: column !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; outline: none !important; padding: 0 !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardImage_"] { border-radius: 0 !important; aspect-ratio: auto !important; flex: 1 1 auto !important; min-height: 0 !important; height: auto !important; border-bottom: 1px solid var(--ffs-border) !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardImageOverlay_"] { display: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardContent_"] {
  position: static !important; inset: auto !important; flex: 0 0 auto !important;
  padding: 7px 9px 8px !important; background: var(--ffs-page) !important; text-align: left !important;
  border-left: 4px solid var(--ffs-accent) !important;
}
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardName_"] { font: 400 calc(15px * var(--lumiverse-font-scale, 1))/1.25 Georgia, serif !important; color: ${mode === "dark" ? "#ff8f8f" : "#990000"} !important; text-shadow: none !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardName_"] span { border-bottom: 1px solid transparent; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardBtn_"]:hover [class*="_cardName_"] span { border-bottom-color: currentColor; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] [class*="_cardName_"] svg { color: ${mode === "dark" ? "#ff8f8f" : "#990000"} !important; fill: currentColor !important; }
${S}[data-ffs-home-cards] [data-component="LandingPage"] :is([class*="_cardTime_"], [class*="_cardMeta_"]) { color: var(--ffs-text-muted) !important; text-shadow: none !important; }
${S} [data-component="LandingPageTabs"] button { border-radius: .25em !important; }
${S} [data-component="HomepageCharacterLibrary"] { border-radius: 0 !important; background: var(--ffs-page) !important; border-color: var(--ffs-border) !important; }
${S} [data-component="HomepageCharacterLibrary"] h2, ${S} [data-component="LandingPageChats"] h2 { font: 400 calc(22px * var(--lumiverse-font-scale, 1))/1.3 Georgia, serif !important; }
${S} .ffs-ao3-welcome { width: 100%; margin: 14px 0 8px; padding: 0; box-sizing: border-box; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; color: var(--ffs-text); font-size: 13px; }
${S} .ffs-ao3-welcome h2 { margin: 0; font: 400 calc(26px * var(--lumiverse-font-scale, 1))/1.2 Georgia, serif; color: var(--ffs-heading); }
${S} .ffs-ao3-welcome p { margin: .3em 0 0; color: var(--ffs-text-muted); }

/* ---------- AO3 required tags in menus ---------- */
${S} [role="option"][aria-selected="true"] { box-shadow: inset 3px 0 0 var(--ffs-nav) !important; }
${S} :where(button, a, [role="button"]):focus-visible { outline: 2px solid var(--ffs-accent) !important; outline-offset: 2px; }

@media (max-width: 760px) {
  ${S} .ffs-ao3-wordmark { font-size: 19px; }
  ${S} .ffs-ao3-logo { height: 34px; }
  ${S} .ffs-ao3-search input { width: 90px; }
  ${S} .ffs-ao3-user .ffs-ao3-greet { display: none; }
  ${S} ${USER} [data-component="MessageContent"] { padding-left: .9em !important; }
  ${S} ${USER} > [class*="_bubble_"] > [class*="_header_"] { padding-left: 52px !important; }
  ${S} ${USER} > [class*="_avatar_"] { width: 36px !important; height: 36px !important; top: -4px !important; }
}
${S} ${MSG} [data-spindle-mount="message_body_before"] { display: block; }
${S} ${CHAR} [data-component="MessageContent"] { margin-bottom: .4em !important; }
`;
}
