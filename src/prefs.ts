import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import type { SkinId } from "./tokens";

export type ModePref = "auto" | "light" | "dark";
export type Rating = "notrated" | "general" | "teen" | "mature" | "explicit";
export type Warning = "choosenotto" | "none" | "yes";
export type Category = "none" | "fm" | "mm" | "ff" | "gen" | "multi" | "other";

export interface Prefs {
  skin: SkinId | "off";
  mode: ModePref;
  /** Site masthead and navigation above the chat and the home page. */
  siteHeader: boolean;
  /** AO3 work preface / Wattpad story hero at the top of each chat. */
  workHeader: boolean;
  /** "Chapter N" / "Part N" headings above each character reply. */
  chapterHeadings: boolean;
  /** Wattpad paragraph comment bubbles. */
  paragraphComments: boolean;
  /** Wattpad reading progress bar with time left. */
  progressBar: boolean;
  /** Restyle the home page's chat and character cards. */
  restyleHome: boolean;
  /** Prose size in px before Lumiverse's font scale. 0 = the skin's default. */
  proseSize: number;
}

/** Per-chat AO3 tagging and reader state. */
export interface WorkMeta {
  title?: string;
  rating?: Rating;
  warning?: Warning;
  category?: Category;
  fandom?: string;
  relationships?: string;
  additionalTags?: string;
  summary?: string;
  complete?: boolean;
  kudos?: boolean;
  /** Message ids the reader voted for (Wattpad). */
  votes?: string[];
  hits?: number;
  inLibrary?: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  skin: "ao3",
  mode: "auto",
  siteHeader: true,
  workHeader: true,
  chapterHeadings: true,
  paragraphComments: true,
  progressBar: true,
  restyleHome: true,
  proseSize: 0,
};

const PREFS_KEY = "prefs:main";
const WORKS_KEY = "works:all";
const LOCAL_PREFIX = "fanfic_skins:";

type Listener = () => void;

/**
 * Preferences and per-chat work data. Stored server-side per user through
 * ctx.settings when the host has it, otherwise in localStorage.
 */
export class Store {
  prefs: Prefs = { ...DEFAULT_PREFS };
  works: Record<string, WorkMeta> = {};
  private listeners = new Set<Listener>();
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private edited = new Set<string>();
  private unwatch: Array<() => void> = [];

  constructor(private ctx: SpindleFrontendContext) {}

  /** Last-saved prefs from this browser, so the skin paints before the server answers. */
  loadCached(): void {
    try {
      const raw = localStorage.getItem(LOCAL_PREFIX + PREFS_KEY);
      if (raw) this.prefs = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
    } catch {
      /* storage disabled */
    }
  }

  async load(): Promise<void> {
    const [prefs, works] = await Promise.all([
      this.read<Partial<Prefs>>(PREFS_KEY),
      this.read<Record<string, WorkMeta>>(WORKS_KEY),
    ]);
    // Changes made while the server copy was loading win over it.
    if (!this.edited.has(PREFS_KEY)) this.prefs = { ...DEFAULT_PREFS, ...(prefs ?? {}) };
    const saved = works && typeof works === "object" ? works : {};
    if (this.edited.has(WORKS_KEY)) {
      const merged = { ...saved };
      for (const [id, local] of Object.entries(this.works)) merged[id] = { ...saved[id], ...local };
      this.works = merged;
    } else {
      this.works = saved;
    }
    if (this.edited.size) this.emit();
    try {
      localStorage.setItem(LOCAL_PREFIX + PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      /* storage disabled */
    }

    const settings = this.ctx.settings;
    if (settings) {
      // Keep several open tabs in step.
      this.unwatch.push(
        settings.watch<Partial<Prefs>>(PREFS_KEY, (value) => {
          if (!value || this.saveTimers.has(PREFS_KEY)) return;
          this.prefs = { ...DEFAULT_PREFS, ...value };
          this.emit();
        }),
        settings.watch<Record<string, WorkMeta>>(WORKS_KEY, (value) => {
          if (!value || this.saveTimers.has(WORKS_KEY)) return;
          this.works = value;
          this.emit();
        }),
      );
    }
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setPrefs(patch: Partial<Prefs>): void {
    this.prefs = { ...this.prefs, ...patch };
    this.write(PREFS_KEY, this.prefs);
    this.emit();
  }

  work(chatId: string | null): WorkMeta {
    return (chatId && this.works[chatId]) || {};
  }

  setWork(chatId: string, patch: Partial<WorkMeta>): void {
    const next: WorkMeta = { ...this.work(chatId), ...patch };
    for (const key of Object.keys(next) as Array<keyof WorkMeta>) {
      if (next[key] === undefined || next[key] === "") delete next[key];
    }
    this.works = { ...this.works, [chatId]: next };
    this.write(WORKS_KEY, this.works);
    this.emit();
  }

  dispose(): void {
    for (const stop of this.unwatch) stop();
    for (const [key, timer] of this.saveTimers) {
      clearTimeout(timer);
      void this.persist(key, key === PREFS_KEY ? this.prefs : this.works);
    }
    this.saveTimers.clear();
    this.listeners.clear();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("[fanfic-skins] listener failed", err);
      }
    }
  }

  private async read<T>(key: string): Promise<T | undefined> {
    const settings = this.ctx.settings;
    if (settings) {
      try {
        const value = await settings.get<T>(key);
        if (value !== undefined) return value;
      } catch (err) {
        console.warn("[fanfic-skins] settings read failed, using local storage", err);
      }
    }
    try {
      const raw = localStorage.getItem(LOCAL_PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }

  /** Debounced: kudos clicks and typing in the tag editor batch into one write. */
  private write(key: string, value: unknown): void {
    this.edited.add(key);
    const existing = this.saveTimers.get(key);
    if (existing) clearTimeout(existing);
    this.saveTimers.set(
      key,
      setTimeout(() => {
        this.saveTimers.delete(key);
        void this.persist(key, value);
      }, 400),
    );
  }

  private async persist(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or disabled */
    }
    const settings = this.ctx.settings;
    if (!settings) return;
    try {
      await settings.set(key, value);
    } catch (err) {
      console.warn("[fanfic-skins] settings write failed", err);
    }
  }
}
