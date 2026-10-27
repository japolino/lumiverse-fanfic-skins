import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { AO3_LOGO, wattpadMark } from "./brand";
import { icon } from "./icons";
import type { Category, ModePref, Prefs, Rating, Store, Warning } from "./prefs";
import { CATEGORY_LABEL, RATING_LABEL, WARNING_LABEL, esc, shownWork } from "./ui";
import type { WorkTracker } from "./work";

type DrawerTab = ReturnType<SpindleFrontendContext["ui"]["registerDrawerTab"]>;

const TOGGLES: Array<[keyof Prefs, string, string]> = [
  ["siteHeader", "Site header", "The masthead and navigation above chats and the home page."],
  ["workHeader", "Story header", "AO3's work preface or Wattpad's “You are reading” banner."],
  ["chapterHeadings", "Chapter headings", "Number each character reply as a chapter."],
  ["paragraphComments", "Paragraph comment bubbles", "Wattpad only, decorative. Click one to quote that line into your reply."],
  ["progressBar", "Reading progress", "Wattpad only. A teal bar with the time left to read."],
  ["restyleHome", "Restyle the home page", "Turn chat cards into archive entries or book covers."],
  ["holdScroll", "Keep the page still while a reply streams", "New text appears below where you are reading. Scroll down when you are ready."],
];

export const PANEL_CSS = `
.ffs-panel { padding: 14px 14px 28px; display: flex; flex-direction: column; gap: 18px; color: var(--lumiverse-text); font-size: 13px; }
.ffs-panel h4 { margin: 0 0 8px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--lumiverse-text-muted); font-weight: 700; }
.ffs-panel p.hint { margin: 4px 0 0; color: var(--lumiverse-text-dim); font-size: 12px; line-height: 1.4; }
.ffs-skins { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ffs-skin { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: 6px; padding: 6px; border-radius: 10px; border: 2px solid var(--lumiverse-border); background: var(--lumiverse-bg-elevated); text-align: center; font-weight: 600; font-size: 12px; color: var(--lumiverse-text); }
.ffs-skin:hover { border-color: var(--lumiverse-border-hover); }
.ffs-skin[aria-pressed="true"] { border-color: var(--lumiverse-primary); box-shadow: 0 0 0 2px var(--lumiverse-primary-020); }
.ffs-skin:focus-visible { outline: 2px solid var(--lumiverse-primary); outline-offset: 2px; }
.ffs-thumb { height: 74px; border-radius: 6px; overflow: hidden; position: relative; border: 1px solid rgba(0,0,0,.12); }
.ffs-thumb.off { background: linear-gradient(160deg, #2b2440, #120f1c); }
.ffs-thumb.off::after { content: ""; position: absolute; inset: 18px 14px; border-radius: 6px; background: rgba(255,255,255,.08); box-shadow: 0 12px 0 -6px rgba(255,255,255,.05); }
.ffs-thumb.ao3 { background: #fff; }
.ffs-thumb.ao3 .mast { height: 18px; display: flex; align-items: center; gap: 2px; padding: 0 4px; }
.ffs-thumb.ao3 .mast img { height: 12px; }
.ffs-thumb.ao3 .mast span { font: 9px Georgia, serif; color: #900; white-space: nowrap; }
.ffs-thumb.ao3 .nav { height: 7px; background: linear-gradient(#a50000, #900 55%, #800); }
.ffs-thumb.ao3 .box { margin: 5px 6px 0; height: 16px; border: 1px solid #ccc; }
.ffs-thumb.ao3 .line { margin: 4px 10px 0; height: 3px; background: #ccc; }
.ffs-thumb.ao3 .line.s { width: 50%; margin-left: auto; margin-right: auto; background: #999; }
.ffs-thumb.wattpad { background: #fff; }
.ffs-thumb.wattpad .mast { height: 14px; display: flex; align-items: center; gap: 2px; padding: 0 5px; border-bottom: 1px solid #eee; }
.ffs-thumb.wattpad .mast b { font: 700 9px/1 sans-serif; color: #ff500a; letter-spacing: -.3px; }
.ffs-thumb.wattpad .hero { height: 26px; background: linear-gradient(120deg, #5d4a6e, #b06a4e); display: flex; align-items: center; padding: 0 6px; gap: 5px; }
.ffs-thumb.wattpad .hero i { width: 12px; height: 18px; border-radius: 1px; background: #f2c9b0; }
.ffs-thumb.wattpad .hero span { height: 3px; width: 34px; background: rgba(255,255,255,.75); border-radius: 2px; }
.ffs-thumb.wattpad .line { margin: 5px 12px 0; height: 3px; background: #ddd; border-radius: 2px; }
.ffs-thumb.wattpad .bub { position: absolute; right: 4px; bottom: 9px; width: 7px; height: 6px; border-radius: 1px; background: #6f6f6f; }
.ffs-thumb.dark { filter: invert(.88) hue-rotate(180deg); }
.ffs-seg { display: flex; border: 1px solid var(--lumiverse-border); border-radius: 8px; overflow: hidden; }
.ffs-seg button { all: unset; flex: 1; cursor: pointer; text-align: center; padding: 7px 0; font-weight: 600; color: var(--lumiverse-text-muted); }
.ffs-seg button + button { border-left: 1px solid var(--lumiverse-border); }
.ffs-seg button[aria-pressed="true"] { background: var(--lumiverse-primary-015); color: var(--lumiverse-primary-text); }
.ffs-toggle { display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--lumiverse-border); cursor: pointer; }
.ffs-toggle:last-child { border-bottom: 0; }
.ffs-toggle b { font-weight: 600; }
.ffs-toggle small { grid-column: 1; color: var(--lumiverse-text-dim); font-size: 11.5px; line-height: 1.35; }
.ffs-toggle input { grid-row: 1 / span 2; grid-column: 2; width: 34px; height: 20px; appearance: none; border-radius: 999px; background: var(--lumiverse-fill-strong); position: relative; cursor: pointer; transition: background .15s; margin: 0; }
.ffs-toggle input::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.ffs-toggle input:checked { background: var(--lumiverse-primary); }
.ffs-toggle input:checked::after { transform: translateX(14px); }
.ffs-range { display: flex; align-items: center; gap: 10px; }
.ffs-range input { flex: 1; accent-color: var(--lumiverse-primary); }
.ffs-range output { min-width: 52px; text-align: right; color: var(--lumiverse-text-muted); font-variant-numeric: tabular-nums; }
.ffs-form { display: grid; gap: 10px; }
.ffs-form label { display: grid; gap: 4px; font-weight: 600; font-size: 12px; color: var(--lumiverse-text-muted); }
.ffs-form :is(input[type=text], select, textarea) { font: inherit; font-size: 13px; font-weight: 400; color: var(--lumiverse-text); background: var(--lumiverse-input-bg, var(--lumiverse-bg)); border: 1px solid var(--lumiverse-border); border-radius: 6px; padding: 7px 9px; box-sizing: border-box; width: 100%; }
.ffs-form textarea { min-height: 84px; resize: vertical; line-height: 1.45; }
.ffs-form :is(input, select, textarea):focus { outline: none; border-color: var(--lumiverse-primary); box-shadow: 0 0 0 2px var(--lumiverse-primary-020); }
.ffs-form .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ffs-form .check { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--lumiverse-text); }
.ffs-req-preview { display: grid; grid-template-columns: repeat(2, 25px); gap: 3px; }
.ffs-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.ffs-btn { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--lumiverse-border); background: var(--lumiverse-bg-elevated); font-weight: 600; color: var(--lumiverse-text); }
.ffs-btn:hover { border-color: var(--lumiverse-border-hover); }
.ffs-btn.primary { background: var(--lumiverse-primary); border-color: var(--lumiverse-primary); color: var(--lumiverse-primary-contrast, #fff); }
.ffs-empty { color: var(--lumiverse-text-dim); font-size: 12.5px; line-height: 1.45; padding: 10px; border: 1px dashed var(--lumiverse-border); border-radius: 8px; }
`;

const TAB_ICON = icon.book(20);

/** The "Fanfic" drawer tab: skin picker, options and the current work's tags. */
export class Panel {
  private tab: DrawerTab | null = null;
  private formChat: string | null | undefined = undefined;
  private focusWork = false;

  constructor(
    private ctx: SpindleFrontendContext,
    private store: Store,
    private work: WorkTracker,
    private onExport: () => void,
  ) {}

  start(): void {
    this.tab = this.ctx.ui.registerDrawerTab({
      id: "fanfic-skins",
      title: "Fanfic Skins",
      shortName: "Fanfic",
      headerTitle: "Fanfic Skins",
      description: "Read your chats as an AO3 work or a Wattpad story",
      keywords: ["ao3", "archive of our own", "wattpad", "fanfiction", "theme", "skin", "reader"],
      iconSvg: TAB_ICON,
    });
    this.tab.root.addEventListener("click", (e) => this.onClick(e));
    this.tab.root.addEventListener("input", (e) => this.onInput(e));
    this.tab.root.addEventListener("change", (e) => this.onInput(e));
    this.render();
  }

  stop(): void {
    this.tab?.destroy();
    this.tab = null;
  }

  /**
   * Opened from a click on the page, so wait for that click to finish:
   * the drawer closes on outside clicks and would shut again at once.
   */
  open(): void {
    setTimeout(() => this.tab?.activate(), 0);
  }

  openWork(): void {
    setTimeout(() => {
      this.tab?.activate();
      this.focusWork = true;
      this.render(true);
    }, 0);
  }

  /** Full render on chat change; otherwise only the pressed states. */
  render(force = false): void {
    const root = this.tab?.root;
    if (!root) return;
    const chatId = this.work.info?.chatId ?? null;
    const typing = root.contains(document.activeElement) && document.activeElement?.matches("input[type=text], textarea");
    if (!force && this.formChat === chatId && root.firstChild) {
      this.sync(root);
      return;
    }
    if (typing && !force && this.formChat === chatId) return;
    this.formChat = chatId;
    root.innerHTML = this.html();
    this.sync(root);
    if (this.focusWork) {
      this.focusWork = false;
      requestAnimationFrame(() => root.querySelector("#ffs-work")?.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
  }

  private sync(root: HTMLElement): void {
    const prefs = this.store.prefs;
    root.querySelectorAll<HTMLElement>("[data-skin]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.skin === prefs.skin)));
    root.querySelectorAll<HTMLElement>("[data-mode]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.mode === prefs.mode)));
    root.querySelectorAll<HTMLInputElement>("input[data-pref]").forEach((el) => {
      el.checked = Boolean(prefs[el.dataset.pref as keyof Prefs]);
    });
    const size = root.querySelector<HTMLInputElement>("input[data-size]");
    const out = root.querySelector("output[data-size-out]");
    if (size && document.activeElement !== size) size.value = String(prefs.proseSize || 0);
    if (out) out.textContent = prefs.proseSize ? `${prefs.proseSize}px` : "Default";
    const dark = document.documentElement.getAttribute("data-ffs-mode") === "dark";
    root.querySelectorAll(".ffs-thumb.ao3, .ffs-thumb.wattpad").forEach((el) => el.classList.toggle("dark", dark));
  }

  private html(): string {
    const info = this.work.info;
    const skins = `
<section>
  <h4>Skin</h4>
  <div class="ffs-skins">
    <button class="ffs-skin" data-skin="off"><div class="ffs-thumb off"></div>Lumiverse</button>
    <button class="ffs-skin" data-skin="ao3"><div class="ffs-thumb ao3"><div class="mast"><img src="${AO3_LOGO}" alt=""><span>Archive of Our Own</span></div><div class="nav"></div><div class="box"></div><div class="line s"></div><div class="line"></div><div class="line"></div></div>AO3</button>
    <button class="ffs-skin" data-skin="wattpad"><div class="ffs-thumb wattpad"><div class="mast"><b>wattpad</b>${wattpadMark("#FF500A", 10)}</div><div class="hero"><i></i><span></span></div><div class="line"></div><div class="line"></div><div class="line"></div><span class="bub"></span></div>Wattpad</button>
  </div>
</section>
<section>
  <h4>Light or dark</h4>
  <div class="ffs-seg" role="group" aria-label="Mode">
    <button data-mode="auto">Match Lumiverse</button><button data-mode="light">Light</button><button data-mode="dark">Dark</button>
  </div>
</section>
<section>
  <h4>Text size</h4>
  <div class="ffs-range"><input type="range" min="0" max="26" step="1" data-size aria-label="Prose size"><output data-size-out></output></div>
  <p class="hint">Slide to the far left to use the site's own size.</p>
</section>
<section>
  <h4>Page parts</h4>
  ${TOGGLES.map(([key, label, hint]) => `<label class="ffs-toggle"><b>${esc(label)}</b><small>${esc(hint)}</small><input type="checkbox" data-pref="${key}"></label>`).join("")}
</section>`;

    if (!info) {
      return `<div class="ffs-panel">${skins}<section id="ffs-work"><h4>This work</h4><div class="ffs-empty">Open a chat to tag it like an AO3 work: rating, warnings, fandom, relationships, a summary, and a download.</div></section>
<p class="hint">Tip: if you use a custom lumitheme, switch Lumiverse back to a built-in theme so the two don't fight.</p></div>`;
    }
    const meta = this.store.work(info.chatId);
    const w = shownWork(info, meta);
    const opt = <T extends string>(labels: Record<T, string>, value: T) =>
      (Object.keys(labels) as T[]).map((k) => `<option value="${k}"${k === value ? " selected" : ""}>${esc(labels[k])}</option>`).join("");
    return `<div class="ffs-panel">${skins}
<section id="ffs-work">
  <h4>This work</h4>
  <div class="ffs-form">
    <label>Title<input type="text" data-work="title" value="${esc(meta.title ?? "")}" placeholder="${esc(info.characterName)}"></label>
    <div class="row">
      <label>Rating<select data-work="rating">${opt<Rating>(RATING_LABEL, w.rating)}</select></label>
      <label>Category<select data-work="category">${opt<Category>(CATEGORY_LABEL, w.category)}</select></label>
    </div>
    <label>Archive warning<select data-work="warning">${opt<Warning>(WARNING_LABEL, w.warning)}</select></label>
    <label>Fandom<input type="text" data-work="fandom" value="${esc(meta.fandom ?? "")}" placeholder="Original Work"></label>
    <label>Relationships <small>(comma separated)</small><input type="text" data-work="relationships" value="${esc(meta.relationships ?? "")}" placeholder="${esc(w.relationships.join(", "))}"></label>
    <label>Additional tags <small>(comma separated)</small><input type="text" data-work="additionalTags" value="${esc(meta.additionalTags ?? "")}" placeholder="${esc(info.characterTags.slice(0, 6).join(", ") || "Slow Burn, Fluff, Hurt/Comfort")}"></label>
    <label>Summary<textarea data-work="summary" placeholder="${esc(info.defaultSummary.slice(0, 180))}">${esc(meta.summary ?? "")}</textarea></label>
    <label class="check"><input type="checkbox" data-work="complete"${w.complete ? " checked" : ""}> Mark as complete</label>
  </div>
</section>
<section>
  <div class="ffs-actions">
    <button class="ffs-btn primary" data-act="export">${icon.download(14)} Download as AO3 HTML</button>
    <button class="ffs-btn" data-act="reset-work">Reset tags</button>
  </div>
  <p class="hint">Kudos ${meta.kudos ? "left" : "not left yet"} · ${meta.votes?.length ?? 0} votes · ${meta.hits ?? 1} hits on this work.</p>
</section>
<p class="hint">Tip: if you use a custom lumitheme, switch Lumiverse back to a built-in theme so the two don't fight.</p>
</div>`;
  }

  private onClick(event: Event): void {
    const el = (event.target as Element).closest<HTMLElement>("[data-skin], [data-mode], [data-act]");
    if (!el) return;
    if (el.dataset.skin) this.store.setPrefs({ skin: el.dataset.skin as Prefs["skin"] });
    else if (el.dataset.mode) this.store.setPrefs({ mode: el.dataset.mode as ModePref });
    else if (el.dataset.act === "export") this.onExport();
    else if (el.dataset.act === "reset-work") {
      const chatId = this.work.info?.chatId;
      if (!chatId) return;
      const { kudos, votes, hits, inLibrary } = this.store.work(chatId);
      this.store.works = { ...this.store.works, [chatId]: { kudos, votes, hits, inLibrary } };
      this.store.setWork(chatId, {});
      this.render(true);
    }
  }

  private onInput(event: Event): void {
    const el = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (el instanceof HTMLInputElement && el.dataset.pref) {
      this.store.setPrefs({ [el.dataset.pref]: el.checked } as Partial<Prefs>);
      return;
    }
    if (el instanceof HTMLInputElement && el.hasAttribute("data-size")) {
      const v = Number(el.value);
      this.store.setPrefs({ proseSize: v < 12 ? 0 : v });
      return;
    }
    const key = el.dataset.work;
    const chatId = this.work.info?.chatId;
    if (!key || !chatId) return;
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      this.store.setWork(chatId, { [key]: el.checked });
      return;
    }
    // Text fields save on every keystroke but only re-render on "change".
    this.store.setWork(chatId, { [key]: el.value });
  }
}
