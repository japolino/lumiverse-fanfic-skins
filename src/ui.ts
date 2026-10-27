import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { AO3_LOGO, wattpadMark } from "./brand";
import { icon } from "./icons";
import type { Category, Rating, Store, Warning, WorkMeta } from "./prefs";
import type { SkinId } from "./tokens";
import { formatCount, formatDate, readingMinutes, type WorkInfo, type WorkTracker } from "./work";

export const RATING_LABEL: Record<Rating, string> = {
  notrated: "Not Rated",
  general: "General Audiences",
  teen: "Teen And Up Audiences",
  mature: "Mature",
  explicit: "Explicit",
};
export const WARNING_LABEL: Record<Warning, string> = {
  choosenotto: "Creator Chose Not To Use Archive Warnings",
  none: "No Archive Warnings Apply",
  yes: "Graphic Depictions Of Violence",
};
export const CATEGORY_LABEL: Record<Category, string> = {
  none: "No Category",
  fm: "F/M",
  mm: "M/M",
  ff: "F/F",
  gen: "Gen",
  multi: "Multi",
  other: "Other",
};

export function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const ONES = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
/** Wattpad authors title parts "Chapter One", so spell numbers out up to 99. */
export function spellNumber(n: number): string {
  if (n < 20) return ONES[n] ?? String(n);
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  return String(n);
}

export function splitTags(text: string | undefined): string[] {
  return (text ?? "")
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** The work as shown: chat data with the reader's own tagging on top. */
export interface ShownWork {
  info: WorkInfo;
  meta: WorkMeta;
  title: string;
  rating: Rating;
  warning: Warning;
  category: Category;
  complete: boolean;
  fandom: string;
  relationships: string[];
  characters: string[];
  tags: string[];
  summary: string;
  hits: number;
  votes: number;
}

export function shownWork(info: WorkInfo, meta: WorkMeta): ShownWork {
  return {
    info,
    meta,
    title: meta.title?.trim() || info.characterName,
    rating: meta.rating ?? "notrated",
    warning: meta.warning ?? "choosenotto",
    category: meta.category ?? "none",
    complete: meta.complete ?? false,
    fandom: meta.fandom?.trim() || "Original Work",
    relationships: meta.relationships !== undefined ? splitTags(meta.relationships) : [`${info.characterName}/${info.personaName}`],
    characters: [info.characterName, info.personaName].filter((v, i, a) => v && a.indexOf(v) === i),
    tags: meta.additionalTags !== undefined ? splitTags(meta.additionalTags) : info.characterTags,
    summary: meta.summary?.trim() || info.defaultSummary,
    hits: meta.hits ?? 1,
    votes: meta.votes?.length ?? 0,
  };
}

interface DecoratedRoot {
  messageId: string | null;
  role: "user" | "character" | "streaming" | null;
}

type DecoratorRegister = (options: {
  mount: string;
  render?: (root: HTMLElement, c: { node: Element; scope: string }) => void | (() => void);
  update?: (root: HTMLElement, c: { node: Element; scope: string }) => void;
  priority?: number;
}) => () => void;

/**
 * Everything the skins add to the page: the site header, the work preface,
 * chapter headings, the end-of-work actions and the reading progress bar.
 */
export class Chrome {
  private header: Element | null = null;
  private headerKey = "";
  private mounts: Partial<Record<"before" | "after" | "dock" | "hero", HTMLElement>> = {};
  private decorated = new Map<HTMLElement, DecoratedRoot>();
  private stops: Array<() => void> = [];
  private observer: MutationObserver | null = null;
  private frame = 0;
  private scroller: Element | null = null;
  private progressIdle: ReturnType<typeof setTimeout> | null = null;
  private notice: { text: string; until: number } | null = null;

  constructor(
    private ctx: SpindleFrontendContext,
    private store: Store,
    private work: WorkTracker,
    private actions: {
      openPanel(): void;
      exportWork(): void;
      editWork(): void;
    },
  ) {}

  get skin(): SkinId | "off" {
    return this.store.prefs.skin;
  }

  start(): void {
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(document.body, { childList: true, subtree: true });
    const onClick = (event: MouseEvent) => this.onClick(event);
    document.addEventListener("click", onClick);
    this.stops.push(() => document.removeEventListener("click", onClick));
    this.registerDecorators();
    this.schedule();
  }

  stop(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    for (const stop of this.stops.splice(0)) stop();
    this.detachScroller();
    this.removeHeader();
    for (const root of Object.values(this.mounts)) root?.replaceChildren();
    for (const root of this.decorated.keys()) root.replaceChildren();
    this.decorated.clear();
    document.documentElement.removeAttribute("data-ffs-home");
    document.documentElement.style.removeProperty("--ffs-persona-avatar");
  }

  /** Re-render everything, e.g. after a preference or chat change. */
  refresh(): void {
    this.headerKey = "";
    this.schedule();
    this.renderMounts();
    this.renderDecorated();
  }

  private schedule(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.ensureHeader();
      this.ensureScroller();
    });
  }

  // ---------- site header ----------

  private removeHeader(): void {
    if (this.header) {
      this.ctx.dom.uninject(this.header);
      this.header.remove();
    }
    this.header = null;
    this.headerKey = "";
  }

  private ensureHeader(): void {
    const prefs = this.store.prefs;
    const chat = document.querySelector('[data-component="ChatView"]');
    const home = chat ? null : document.querySelector('[data-component="LandingPage"]');
    const target = chat ?? home;
    const wanted = prefs.skin !== "off" && prefs.siteHeader && target;
    document.documentElement.toggleAttribute("data-ffs-home", Boolean(wanted && home));

    if (!wanted) {
      if (this.header) this.removeHeader();
      return;
    }
    const info = this.work.info;
    const key = [prefs.skin, chat ? "chat" : "home", info?.personaName ?? "", this.personaAvatar() ?? ""].join("|");
    if (this.header?.isConnected && this.header.parentElement === target && key === this.headerKey) return;

    this.removeHeader();
    this.header = this.ctx.dom.inject(target, '<div class="ffs-root ffs-site-slot"></div>', "afterbegin");
    this.header.classList.add("ffs-root");
    (this.header as HTMLElement).style.flex = "0 0 auto";
    this.headerKey = key;
    const slot = this.header.querySelector(".ffs-site-slot") ?? this.header;
    slot.innerHTML = prefs.skin === "ao3" ? this.ao3Header() : this.wattpadHeader();
  }

  private personaAvatar(): string | null {
    const id = this.ctx.state?.get<string | null>("persona.activeId");
    return id ? `/api/v1/personas/${id}/avatar?size=sm` : null;
  }

  private ao3Header(): string {
    const persona = this.work.info?.personaName;
    return `
<header class="ffs-ao3-header">
  <div class="ffs-ao3-masthead">
    <button class="ffs-ao3-brand" data-ffs-act="home" title="Home">
      <img class="ffs-ao3-logo" src="${AO3_LOGO}" alt="">
      <span class="ffs-ao3-wordmark">Archive of Our Own</span>
    </button>
    <div class="ffs-ao3-user">
      ${persona ? `<span class="ffs-ao3-greet">Hi, ${esc(persona)}!</span>` : ""}
      <button data-ffs-act="skins">Skins</button>
      <button data-ffs-act="settings">Preferences</button>
    </div>
  </div>
  <nav class="ffs-ao3-nav" aria-label="Site">
    <button class="ffs-ao3-navlink" data-ffs-act="characters">Fandoms</button>
    <button class="ffs-ao3-navlink" data-ffs-act="home">Browse</button>
    <button class="ffs-ao3-navlink" data-ffs-act="search">Search</button>
    <button class="ffs-ao3-navlink" data-ffs-act="personas">People</button>
    <div class="ffs-ao3-search">
      <input type="text" readonly data-ffs-act="search" aria-label="Search the archive">
      <button data-ffs-act="search">Search</button>
    </div>
  </nav>
</header>`;
  }

  private wattpadHeader(): string {
    const avatar = this.personaAvatar();
    return `
<header class="ffs-wp-header">
  <button class="ffs-wp-brand" data-ffs-act="home" title="Home"><b>wattpad</b>${wattpadMark()}</button>
  <button class="ffs-wp-link" data-ffs-act="characters">Browse ${icon.chevronDown(14)}</button>
  <button class="ffs-wp-link ffs-wp-hide-sm" data-ffs-act="personas">Community ${icon.chevronDown(14)}</button>
  <div class="ffs-wp-search" data-ffs-act="search">${icon.search(18)}<input type="text" readonly placeholder="Search" data-ffs-act="search"></div>
  <div class="ffs-wp-right">
    <button class="ffs-wp-link ffs-wp-hide-sm" data-ffs-act="lore">Write ${icon.chevronDown(14)}</button>
    <button class="ffs-wp-premium" data-ffs-act="skins" title="Fanfic Skins">${icon.bolt(14)} Skins</button>
    ${avatar ? `<img class="ffs-wp-avatar" src="${esc(avatar)}" alt="" data-ffs-act="settings">` : ""}
  </div>
</header>`;
  }

  // ---------- mount points ----------

  private mount(key: "before" | "after" | "dock" | "hero"): HTMLElement | null {
    if (!this.mounts[key]) {
      const point = { before: "chat_stream_before", after: "chat_stream_after", dock: "chat_top_dock", hero: "landing_hero" }[key];
      try {
        const root = this.ctx.ui.mount(point as never) as HTMLElement;
        root.classList.add("ffs-root");
        if (key === "dock") root.style.display = "contents";
        if (key === "after") root.classList.add("ffs-stream-after");
        this.mounts[key] = root;
      } catch (err) {
        console.warn(`[fanfic-skins] mount ${point} unavailable`, err);
        return null;
      }
    }
    return this.mounts[key] ?? null;
  }

  renderMounts(): void {
    const prefs = this.store.prefs;
    const on = prefs.skin !== "off";
    const info = this.work.info;
    const shown = info ? shownWork(info, this.store.work(info.chatId)) : null;

    const before = this.mount("before");
    if (before) before.innerHTML = on && prefs.workHeader && shown ? (prefs.skin === "ao3" ? this.ao3Preface(shown) : this.wattpadHero(shown)) : "";

    const after = this.mount("after");
    if (after) after.innerHTML = on && shown ? (prefs.skin === "ao3" ? this.ao3End(shown) : this.wattpadEnd(shown)) : "";

    const dock = this.mount("dock");
    if (dock) dock.innerHTML = on && shown ? (prefs.skin === "ao3" ? this.ao3WorkNav(shown) : this.wattpadStoryBar(shown)) : "";

    const hero = this.mount("hero");
    if (hero) hero.innerHTML = on && prefs.restyleHome ? this.homeWelcome() : "";

    document.documentElement.toggleAttribute("data-ffs-home-cards", on && prefs.restyleHome);
    // The Wattpad comment bar shows your persona beside the field.
    const avatar = this.personaAvatar();
    document.documentElement.style.setProperty("--ffs-persona-avatar", avatar ? `url("${avatar}")` : "none");
    this.updateProgress();
  }

  private ao3Preface(w: ShownWork): string {
    const tagList = (items: string[], strong = false) =>
      `<ul>${items.map((t) => `<li><a class="ffs-ao3-tag${strong ? " strong" : ""}">${esc(t)}</a></li>`).join("")}</ul>`;
    const lang = languageName();
    const chapters = `${w.info.chapters}/${w.complete ? w.info.chapters : "?"}`;
    const approx = w.info.estimated ? "~" : "";
    return `
<div class="ffs-ao3-work">
  <dl class="ffs-ao3-meta has-req">
    <ul class="ffs-req" aria-hidden="true">
      <li><span class="rating-${w.rating}" title="${esc(RATING_LABEL[w.rating])}"></span></li>
      <li><span class="category-${w.category}" title="${esc(CATEGORY_LABEL[w.category])}"></span></li>
      <li><span class="warning-${w.warning}" title="${esc(WARNING_LABEL[w.warning])}"></span></li>
      <li><span class="complete-${w.complete ? "yes" : "no"}" title="${w.complete ? "Complete Work" : "Work in Progress"}"></span></li>
    </ul>
    <dt>Rating:</dt><dd>${tagList([RATING_LABEL[w.rating]])}</dd>
    <dt class="warn">Archive Warning:</dt><dd>${tagList([WARNING_LABEL[w.warning]], true)}</dd>
    ${w.category !== "none" ? `<dt>Category:</dt><dd>${tagList([CATEGORY_LABEL[w.category]])}</dd>` : ""}
    <dt>Fandom:</dt><dd>${tagList([w.fandom])}</dd>
    ${w.relationships.length ? `<dt>Relationship:</dt><dd>${tagList(w.relationships)}</dd>` : ""}
    <dt>Characters:</dt><dd>${tagList(w.characters)}</dd>
    ${w.tags.length ? `<dt>Additional Tags:</dt><dd>${tagList(w.tags)}</dd>` : ""}
    <dt>Language:</dt><dd>${esc(lang)}</dd>
    <dt>Stats:</dt>
    <dd><div class="stats">
      <span><b>Published:</b><i>${formatDate(w.info.published)}</i></span>
      ${w.info.updated && w.info.published && formatDate(w.info.updated) !== formatDate(w.info.published) ? `<span><b>${w.complete ? "Completed" : "Updated"}:</b><i>${formatDate(w.info.updated)}</i></span>` : ""}
      <span><b>Words:</b><i>${approx}${w.info.words.toLocaleString()}</i></span>
      <span><b>Chapters:</b><i>${chapters}</i></span>
      <span><b>Comments:</b><i>${w.info.replies.toLocaleString()}</i></span>
      <span><b>Kudos:</b><i>${w.meta.kudos ? 1 : 0}</i></span>
      <span><b>Hits:</b><i>${w.hits.toLocaleString()}</i></span>
    </div></dd>
    <div class="ffs-ao3-edit"><button data-ffs-act="edit">Edit Tags</button></div>
  </dl>
  <div class="ffs-ao3-preface">
    <h2>${esc(w.title)}</h2>
    <h3 class="byline"><a>${esc(w.info.author)}</a></h3>
    ${w.summary ? `<div class="module"><h3>Summary:</h3><blockquote>${esc(w.summary)}</blockquote></div>` : ""}
  </div>
</div>`;
  }

  private wattpadHero(w: ShownWork): string {
    const cover = w.info.coverUrl;
    const tags = w.tags.slice(0, 8);
    return `
<section class="ffs-wp-hero">
  ${cover ? `<div class="bg" style="background-image:url('${esc(cover)}')"></div>` : ""}
  <div class="inner">
    ${cover ? `<img class="cover" src="${esc(cover)}" alt="">` : ""}
    <div>
      <div class="label">You are reading</div>
      <h2>${esc(w.title)}</h2>
      <div class="genre">${esc(w.fandom === "Original Work" ? "Roleplay" : w.fandom)} · by ${esc(w.info.author)}</div>
      <div class="stats">
        <span>${icon.eye(14)} ${formatCount(w.hits)} Reads</span>
        <span>${icon.star(14)} ${formatCount(w.votes)} Votes</span>
        <span>${icon.list(14)} ${w.info.chapters} Parts</span>
      </div>
      ${w.summary ? `<p>${esc(w.summary)}</p>` : ""}
      ${tags.length ? `<div class="tags">${tags.map((t) => `<span>#${esc(t.replace(/\s+/g, "").toLowerCase())}</span>`).join("")}</div>` : ""}
    </div>
  </div>
  <button class="edit" data-ffs-act="edit">Edit story details</button>
</section>`;
  }

  private ao3WorkNav(w: ShownWork): string {
    return `
<span class="ffs-ao3-worknav">
  <button class="ffs-ao3-btn" data-ffs-act="index">Chapter Index ↓</button>
  <button class="ffs-ao3-btn" data-ffs-act="kudos" aria-pressed="${w.meta.kudos ? "true" : "false"}">Kudos ♥</button>
  <button class="ffs-ao3-btn" data-ffs-act="download">Download ↓</button>
</span>`;
  }

  private wattpadStoryBar(w: ShownWork): string {
    const latest = this.latestPartId();
    const voted = latest ? (w.meta.votes ?? []).includes(latest) : false;
    return `
<span class="ffs-wp-storybar">
  <span class="ffs-wp-story">
    ${w.info.coverThumbUrl ? `<img src="${esc(w.info.coverThumbUrl)}" alt="">` : ""}
    <span class="meta"><b>${esc(w.title)}</b><span>by ${esc(w.info.author)}</span></span>
    <button data-ffs-act="index" title="Table of contents">${icon.chevronDown(18)}</button>
  </span>
  <button class="ffs-wp-add" data-ffs-act="library" aria-pressed="${w.meta.inLibrary ? "true" : "false"}" title="${w.meta.inLibrary ? "In your library" : "Add to library"}">${w.meta.inLibrary ? "✓" : icon.plus(16)}</button>
  <button class="ffs-wp-vote" data-ffs-act="vote" aria-pressed="${voted}">${voted ? icon.star(16) : icon.starOutline(16)} Vote</button>
  ${this.store.prefs.progressBar ? `<span class="ffs-wp-progress"><i></i><b></b></span>` : ""}
</span>`;
  }

  private ao3End(w: ShownWork): string {
    const notice = this.notice && this.notice.until > Date.now() ? `<p class="ffs-ao3-kudos" role="status">${esc(this.notice.text)}</p>` : "";
    return `
<div class="ffs-ao3-end">
  <ul class="actions">
    <li><button class="ffs-ao3-btn" data-ffs-act="top">↑ Top</button></li>
    <li><button class="ffs-ao3-btn" data-ffs-act="next">Next Chapter →</button></li>
    <li><button class="ffs-ao3-btn" data-ffs-act="kudos" aria-pressed="${w.meta.kudos ? "true" : "false"}">Kudos ♥</button></li>
    <li><button class="ffs-ao3-btn" data-ffs-act="comment">Comments (${w.info.replies})</button></li>
  </ul>
  ${notice}
  ${w.meta.kudos ? `<p class="ffs-ao3-kudos" data-ffs-kudos><span class="heart">${icon.heart(22)}</span><span><a>${esc(w.info.personaName)}</a> left kudos on this work!</span></p>` : ""}
  <p class="ffs-ao3-colophon">${esc(w.title)} · ${w.info.chapters} chapters · ${(w.info.estimated ? "~" : "") + w.info.words.toLocaleString()} words · about ${readingMinutes(w.info.words)} min read</p>
</div>`;
  }

  private wattpadEnd(w: ShownWork): string {
    const latest = this.latestPartId();
    const voted = latest ? (w.meta.votes ?? []).includes(latest) : false;
    const notice = this.notice && this.notice.until > Date.now() ? `<span class="ffs-wp-copied" role="status">${esc(this.notice.text)}</span>` : "";
    return `
<div class="ffs-wp-end">
  <button class="ffs-wp-next" data-ffs-act="next">Continue to next part</button>
  <div class="ffs-wp-endrow">
    <button data-ffs-act="library" aria-pressed="${w.meta.inLibrary ? "true" : "false"}">${w.meta.inLibrary ? "✓ In library" : `${icon.plus(14)} Add`}</button>
    <button data-ffs-act="vote" aria-pressed="${voted}">${voted ? icon.star(15) : icon.starOutline(15)} Vote</button>
    ${notice}
    <span class="share">
      <button data-ffs-act="copy" title="Copy link">${icon.share(15)}</button>
      <button data-ffs-act="download" title="Download as a book">${icon.download(15)}</button>
    </span>
  </div>
</div>`;
  }

  private homeWelcome(): string {
    if (this.skin === "ao3") {
      return `
<div class="ffs-ao3-welcome">
  <div>
    <h2>Your Works</h2>
    <p>A fan-created, reader-run archive of every story you've told here.</p>
  </div>
</div>`;
    }
    return `
<div class="ffs-wp-welcome">
  <h2>Stories you're reading</h2>
  <p>Pick up where you left off.</p>
</div>`;
  }

  // ---------- chapter headings ----------

  private registerDecorators(): void {
    const register = (this.ctx.ui as unknown as { registerDomDecorator?: DecoratorRegister }).registerDomDecorator;
    if (typeof register !== "function") {
      console.info("[fanfic-skins] host has no DOM decorators; chapter headings are off");
      return;
    }
    for (const mount of ["message_body_before", "message_header"]) {
      const stop = register.call(this.ctx.ui, {
        mount,
        priority: 50,
        render: (root, c) => {
          const node = c.node;
          const card = node.closest("[data-part]");
          const id = node.closest("[data-message-id]")?.getAttribute("data-message-id") ?? null;
          const role = (card?.getAttribute("data-part") as DecoratedRoot["role"]) ?? null;
          root.classList.add("ffs-root");
          root.dataset.ffsMount = mount;
          this.decorated.set(root, { messageId: id, role });
          this.renderDecoration(root);
          return () => {
            this.decorated.delete(root);
            root.replaceChildren();
          };
        },
        update: (root) => this.renderDecoration(root),
      });
      this.stops.push(stop);
    }
  }

  private renderDecorated(): void {
    for (const root of [...this.decorated.keys()]) {
      if (!root.isConnected) {
        this.decorated.delete(root);
        continue;
      }
      this.renderDecoration(root);
    }
  }

  private renderDecoration(root: HTMLElement): void {
    const record = this.decorated.get(root);
    const prefs = this.store.prefs;
    const info = this.work.info;
    if (!record || prefs.skin === "off" || !info) {
      root.replaceChildren();
      return;
    }
    const mount = root.dataset.ffsMount;
    const isChar = record.role === "character" || record.role === "streaming";
    let html = "";

    if (mount === "message_body_before" && isChar && prefs.chapterHeadings) {
      const part = record.messageId ? info.parts.get(record.messageId) : undefined;
      const n = part?.chapter || info.chapters + 1;
      if (prefs.skin === "ao3") {
        html = `<div class="ffs-ao3-ch"><h3><span>Chapter ${n}</span></h3></div>`;
      } else {
        const meta = this.store.work(info.chatId);
        const voted = record.messageId ? (meta.votes ?? []).includes(record.messageId) : false;
        const words = part?.words ?? 0;
        html = `
<div class="ffs-wp-ch">
  <h3>Chapter ${spellNumber(n)}</h3>
  <div class="stats">
    <span title="Reads">${icon.eye(14)} ${formatCount(meta.hits ?? 1)}</span>
    <button data-ffs-act="vote-part" data-ffs-id="${esc(record.messageId ?? "")}" aria-pressed="${voted}" title="Vote">${voted ? icon.star(14) : icon.starOutline(14)} ${voted ? 1 : 0}</button>
    <span title="Reading time">${icon.comment(13)} ${words ? `${readingMinutes(words)} min` : "…"}</span>
  </div>
  <hr>
</div>`;
      }
    } else if (mount === "message_header" && record.role === "user" && prefs.skin === "ao3") {
      const chapter = this.chapterBefore(record.messageId);
      html = chapter ? `<span class="ffs-ao3-on">on Chapter ${chapter}</span>` : "";
    }
    if (root.innerHTML !== html) root.innerHTML = html;
  }

  private chapterBefore(messageId: string | null): number {
    const info = this.work.info;
    if (!info || !messageId) return 0;
    let last = 0;
    for (const part of info.wordsByOrder) {
      if (part.id === messageId) return last;
      if (!part.isUser) last = part.chapter;
    }
    return info.chapters;
  }

  private latestPartId(): string | null {
    const parts = this.work.info?.wordsByOrder ?? [];
    for (let i = parts.length - 1; i >= 0; i--) if (!parts[i]!.isUser) return parts[i]!.id;
    return null;
  }

  // ---------- reading progress ----------

  private ensureScroller(): void {
    const list = document.querySelector('[data-component="MessageList"]');
    if (list === this.scroller) return;
    this.detachScroller();
    if (!list) return;
    this.scroller = list;
    list.addEventListener("scroll", this.onScroll, { passive: true });
    this.updateProgress();
  }

  private detachScroller(): void {
    this.scroller?.removeEventListener("scroll", this.onScroll);
    this.scroller = null;
  }

  private onScroll = (): void => {
    this.updateProgress(true);
  };

  private updateProgress(scrolling = false): void {
    const bar = this.mounts.dock?.querySelector<HTMLElement>(".ffs-wp-progress");
    const list = this.scroller as HTMLElement | null;
    if (!bar || !list) return;
    const max = list.scrollHeight - list.clientHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, list.scrollTop / max)) : 1;
    const pct = `${(progress * 100).toFixed(1)}%`;
    bar.style.setProperty("--ffs-progress", pct);
    const label = bar.querySelector<HTMLElement>("b");
    if (label) {
      const words = (this.work.info?.words ?? 0) * (1 - progress);
      const minutes = Math.round(words / 238);
      label.textContent = minutes < 1 ? "a few seconds left" : `${minutes} min${minutes === 1 ? "" : "s"} left`;
    }
    if (scrolling) {
      bar.classList.add("show");
      if (this.progressIdle) clearTimeout(this.progressIdle);
      this.progressIdle = setTimeout(() => bar.classList.remove("show"), 1400);
    }
  }

  // ---------- actions ----------

  private onClick(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (!target || this.store.prefs.skin === "off") return;

    const actionEl = target.closest<HTMLElement>("[data-ffs-act]");
    if (actionEl && actionEl.closest(".ffs-root")) {
      event.preventDefault();
      event.stopPropagation();
      void this.run(actionEl.dataset.ffsAct ?? "", actionEl, event);
      return;
    }

    // Wattpad paragraph bubbles live in the right margin of each paragraph.
    if (this.store.prefs.skin === "wattpad" && this.store.prefs.paragraphComments) {
      const p = target.closest("p");
      if (!p || !p.closest('[data-part="character"] [data-component="MessageContent"]')) return;
      const rect = p.getBoundingClientRect();
      if (event.clientX > rect.right + 4) {
        event.preventDefault();
        this.quoteParagraph(p.textContent ?? "");
      }
    }
  }

  private quoteParagraph(text: string): void {
    const composer = (this.ctx as unknown as { composer?: { getState(): { mounted: boolean; text: string }; insertText(t: string, o?: { at?: "caret" | "end" }): void; focus(): void } }).composer;
    const line = text.trim().replace(/\s+/g, " ");
    if (!composer || !line) return;
    try {
      if (!composer.getState().mounted) return;
      const quote = `> ${line.length > 220 ? line.slice(0, 217) + "…" : line}\n\n`;
      const current = composer.getState().text;
      composer.insertText((current && !current.endsWith("\n") ? "\n\n" : "") + quote, { at: "end" });
      composer.focus();
    } catch (err) {
      console.warn("[fanfic-skins] could not quote paragraph", err);
    }
  }

  private async run(action: string, el: HTMLElement, event: MouseEvent): Promise<void> {
    const info = this.work.info;
    const chatId = info?.chatId ?? null;
    switch (action) {
      case "home":
        return this.invoke({ kind: "route", id: "/" }, () => location.assign("/"));
      case "characters":
        return this.invoke({ kind: "route", id: "/characters" }, () => this.invokeDrawer(/character/i));
      case "personas":
        return this.invokeDrawer(/persona/i);
      case "lore":
        return this.invokeDrawer(/world|lore/i);
      case "search":
        return this.openPalette();
      case "settings":
        this.ctx.events.emit("open-settings", { view: "general" });
        return;
      case "skins":
        return this.actions.openPanel();
      case "edit":
        return this.actions.editWork();
      case "download":
        return this.actions.exportWork();
      case "top":
        (this.scroller as HTMLElement | null)?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      case "comment":
        return this.focusComposer();
      case "index":
        return this.showIndex(el);
      case "next":
        return this.nextPart();
      case "copy":
        try {
          await navigator.clipboard.writeText(location.href);
          this.flash("Link copied");
        } catch {
          this.flash("Couldn't copy the link");
        }
        return;
      case "kudos":
        if (!chatId) return;
        if (this.store.work(chatId).kudos) {
          this.flash("You have already left kudos here. :)");
          return;
        }
        this.store.setWork(chatId, { kudos: true });
        requestAnimationFrame(() => this.mounts.after?.querySelector("[data-ffs-kudos]")?.classList.add("pop"));
        return;
      case "library":
        if (chatId) this.store.setWork(chatId, { inLibrary: !this.store.work(chatId).inLibrary });
        return;
      case "vote":
      case "vote-part": {
        if (!chatId) return;
        const id = action === "vote" ? this.latestPartId() : el.dataset.ffsId || null;
        if (!id) return;
        const votes = new Set(this.store.work(chatId).votes ?? []);
        if (votes.has(id)) votes.delete(id);
        else votes.add(id);
        this.store.setWork(chatId, { votes: [...votes] });
        return;
      }
    }
    void event;
  }

  private flash(text: string): void {
    this.notice = { text, until: Date.now() + 3000 };
    this.renderMounts();
    setTimeout(() => {
      if (this.notice && this.notice.until <= Date.now()) {
        this.notice = null;
        this.renderMounts();
      }
    }, 3100);
  }

  private invoke(ref: { kind: string; id: string }, fallback: () => void): void {
    const surfaces = this.ctx.host.surfaces;
    try {
      if (!surfaces) throw new Error("no surfaces");
      const result = surfaces.invoke(ref as never) as unknown;
      if (result && typeof (result as Promise<unknown>).catch === "function") (result as Promise<unknown>).catch(fallback);
    } catch {
      fallback();
    }
  }

  private invokeDrawer(match: RegExp): void {
    const surfaces = this.ctx.host.surfaces;
    const tab = surfaces?.list(["drawer_tab"]).find((s) => match.test(s.id) || match.test(s.label));
    if (tab) this.invoke({ kind: "drawer_tab", id: tab.id }, () => {});
  }

  private openPalette(): void {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    const init: KeyboardEventInit = { key: "k", code: "KeyK", ctrlKey: !mac, metaKey: mac, bubbles: true, cancelable: true };
    (document.activeElement as HTMLElement | null)?.blur?.();
    document.dispatchEvent(new KeyboardEvent("keydown", init));
    window.dispatchEvent(new KeyboardEvent("keydown", init));
  }

  private composer() {
    return (this.ctx as unknown as {
      composer?: { getState(): { mounted: boolean; text: string }; focus(): void; send(): Promise<void> };
    }).composer;
  }

  private focusComposer(): void {
    try {
      const composer = this.composer();
      if (composer?.getState().mounted) {
        composer.focus();
        return;
      }
    } catch {
      /* fall through */
    }
    document.querySelector<HTMLTextAreaElement>('[data-component="InputArea"] textarea')?.focus();
  }

  /** The next part is the next reply: send the draft (an empty draft asks for a fresh reply). */
  private async nextPart(): Promise<void> {
    const composer = this.composer();
    if (!composer) return this.focusComposer();
    try {
      await composer.send();
    } catch (err) {
      const message = String((err as Error)?.message ?? err);
      if (message.includes("COMPOSER_BUSY")) this.flash("The next part is already being written…");
      else this.focusComposer();
    }
  }

  private async showIndex(el: HTMLElement): Promise<void> {
    const info = this.work.info;
    if (!info) return;
    const chapters = info.wordsByOrder.filter((p) => !p.isUser);
    if (!chapters.length) return;
    const rect = el.getBoundingClientRect();
    const items = chapters.slice(-40).map((p) => ({
      key: p.id,
      label: this.skin === "wattpad" ? `Chapter ${spellNumber(p.chapter)}` : `${p.chapter}. Chapter ${p.chapter}`,
    }));
    const result = await this.ctx.ui.showContextMenu({ position: { x: rect.left, y: rect.bottom + 4 }, items });
    if (result.selectedKey) this.scrollToMessage(result.selectedKey);
  }

  private scrollToMessage(messageId: string): void {
    const list = this.scroller as HTMLElement | null;
    const find = () => list?.querySelector<HTMLElement>(`[data-item-type="message"][data-message-id="${CSS.escape(messageId)}"]`);
    const row = find();
    if (row) {
      row.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    // Not mounted yet: jump to its estimated position, then settle on it.
    const info = this.work.info;
    if (!list || !info) return;
    const index = info.wordsByOrder.findIndex((p) => p.id === messageId);
    if (index < 0) return;
    list.scrollTop = (index / Math.max(1, info.wordsByOrder.length)) * list.scrollHeight;
    let tries = 0;
    const settle = () => {
      const found = find();
      if (found) found.scrollIntoView({ block: "start" });
      else if (tries++ < 10) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  }
}

function languageName(): string {
  const lang = (navigator.language || "en").split("-")[0] ?? "en";
  try {
    const name = new Intl.DisplayNames([lang], { type: "language" }).of(lang);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : "English";
  } catch {
    return "English";
  }
}
