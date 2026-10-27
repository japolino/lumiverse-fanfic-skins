import type { SpindleFrontendContext } from "lumiverse-spindle-types";

/** Message fields this extension reads. Host messages carry more. */
export interface StoryMessage {
  id: string;
  index_in_chat: number;
  is_user: boolean;
  name: string;
  content: string;
  send_date: number;
}

interface CharacterLike {
  id?: string;
  name?: string;
  creator?: string;
  creator_notes?: string;
  description?: string;
  scenario?: string;
  first_mes?: string;
  tags?: string[];
  image_id?: string | null;
}

export interface Part {
  id: string;
  isUser: boolean;
  /** Chapter number for character replies, 0 for user turns. */
  chapter: number;
  words: number;
}

export interface WorkInfo {
  chatId: string;
  characterId: string | null;
  characterName: string;
  personaName: string;
  author: string;
  coverUrl: string | null;
  coverThumbUrl: string | null;
  characterTags: string[];
  defaultSummary: string;
  published: Date | null;
  updated: Date | null;
  words: number;
  chapters: number;
  replies: number;
  /** True when the chat is longer than the window the host lets us read. */
  estimated: boolean;
  parts: Map<string, Part>;
  /** Words still below the reader's position, for time-left estimates. */
  wordsByOrder: Part[];
}

const READ_LIMIT = 200;

export function countWords(text: string): number {
  const plain = stripMarkup(text);
  if (!plain) return 0;
  const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Segmenter) {
    let n = 0;
    for (const seg of new Segmenter(undefined, { granularity: "word" }).segment(plain)) {
      if (seg.isWordLike) n++;
    }
    return n;
  }
  return plain.split(/\s+/).filter(Boolean).length;
}

export function stripMarkup(text: string): string {
  return (text || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_~`#>|]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDate(value: unknown): Date | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n < 1e12 ? n * 1000 : n);
}

function fillMacros(text: string, charName: string, userName: string): string {
  return text
    .replace(/\{\{\s*char\s*\}\}/gi, charName)
    .replace(/\{\{\s*user\s*\}\}/gi, userName)
    .replace(/<\s*(BOT|CHAR)\s*>/g, charName)
    .replace(/<\s*USER\s*>/g, userName);
}

/** Leftover template logic and decorative lines don't belong in a blurb. */
function prose(text: string): string {
  let out = text;
  for (let i = 0; i < 4 && /\{\{/.test(out); i++) out = out.replace(/\{\{[^{}]*\}\}/g, " ");
  return out
    .replace(/\[\[[^\]]*\]\]/g, " ")
    .split("\n")
    .filter((line) => (line.match(/\p{L}/gu)?.length ?? 0) >= 3)
    .join("\n");
}

function excerpt(text: string, max: number): string {
  const plain = stripMarkup(prose(text));
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return (stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "")) + (stop > max * 0.5 ? "" : "…");
}

export function avatarUrls(characterId: string | null, imageId: string | null | undefined) {
  if (imageId) {
    return { full: `/api/v1/images/${imageId}?size=lg`, thumb: `/api/v1/images/${imageId}?size=sm` };
  }
  if (characterId) {
    const base = `/api/v1/characters/${characterId}/avatar`;
    return { full: base, thumb: `${base}?size=sm` };
  }
  return { full: null, thumb: null };
}

type AnyCtx = SpindleFrontendContext & {
  chats: SpindleFrontendContext["chats"] & {
    getMessages?: (chatId: string, options?: { limit?: number; tail?: boolean }) => Promise<{ data: StoryMessage[]; total: number }>;
  };
  messages: SpindleFrontendContext["messages"] & { getRecent?: (limit: number) => StoryMessage[] };
};

export class WorkTracker {
  info: WorkInfo | null = null;
  private character: CharacterLike | null = null;
  private characterFor: string | null = null;
  private loading: Promise<void> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();

  constructor(private ctx: SpindleFrontendContext) {}

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  activeChat(): { chatId: string | null; characterId: string | null; avatarImageId: string | null } {
    const state = this.ctx.state?.get<{ chatId: string | null; characterId: string | null; avatarImageId?: string | null }>("chat.active");
    if (state) return { chatId: state.chatId, characterId: state.characterId, avatarImageId: state.avatarImageId ?? null };
    const fallback = this.ctx.getActiveChat();
    return { ...fallback, avatarImageId: null };
  }

  /** Reload everything for the active chat. Coalesces bursts of events. */
  refreshSoon(delay = 600): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, delay);
  }

  async refresh(): Promise<void> {
    if (this.loading) {
      await this.loading;
    }
    this.loading = this.load().finally(() => {
      this.loading = null;
    });
    await this.loading;
  }

  dispose(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.listeners.clear();
  }

  private async load(): Promise<void> {
    const { chatId, characterId, avatarImageId } = this.activeChat();
    if (!chatId) {
      if (this.info) {
        this.info = null;
        this.emit();
      }
      return;
    }

    if (characterId && this.characterFor !== characterId) {
      try {
        this.character = ((await this.ctx.characters.get(characterId)) as CharacterLike) ?? null;
      } catch {
        this.character = null;
      }
      this.characterFor = characterId;
    } else if (!characterId) {
      this.character = null;
      this.characterFor = null;
    }

    const { messages, total } = await this.readMessages(chatId);
    // The chat may have changed while we were waiting.
    if (this.activeChat().chatId !== chatId) return;

    const char = this.character ?? {};
    const charName = char.name || titleFromDocument() || "Untitled";
    const personaName = [...messages].reverse().find((m) => m.is_user)?.name || "Reader";

    const parts = new Map<string, Part>();
    const ordered: Part[] = [];
    const loaded = messages.length;
    const unloaded = Math.max(0, total - loaded);
    const assistantLoaded = messages.filter((m) => !m.is_user).length;
    const ratio = loaded ? assistantLoaded / loaded : 0.5;
    let chapter = Math.round(unloaded * ratio);
    let words = 0;
    for (const m of messages) {
      const w = countWords(m.content);
      words += w;
      const part: Part = { id: m.id, isUser: m.is_user, chapter: m.is_user ? 0 : ++chapter, words: w };
      parts.set(m.id, part);
      ordered.push(part);
    }
    const avgWords = loaded ? words / loaded : 0;
    const totalWords = Math.round(words + unloaded * avgWords);
    const replies = messages.filter((m) => m.is_user).length + Math.round(unloaded * (1 - ratio));

    const imageId = avatarImageId ?? char.image_id ?? null;
    const urls = avatarUrls(characterId, imageId);
    // Creator notes are often usage rules or a copyright notice, not a blurb.
    const notes = char.creator_notes?.trim() ?? "";
    const usableNotes = /©|copyright|all rights reserved|redistribut|do not (re)?upload|manual|instructions?|how to use/i.test(notes) ? "" : notes;
    const summarySource = char.scenario?.trim() || usableNotes || messages.find((m) => !m.is_user)?.content || char.description || "";

    this.info = {
      chatId,
      characterId,
      characterName: charName,
      personaName,
      author: char.creator?.trim() || charName,
      coverUrl: urls.full,
      coverThumbUrl: urls.thumb,
      characterTags: (char.tags ?? []).filter((t) => typeof t === "string" && t.trim()).slice(0, 24),
      defaultSummary: excerpt(fillMacros(summarySource, charName, personaName), 520),
      published: toDate(messages[0]?.send_date),
      updated: toDate(messages[messages.length - 1]?.send_date),
      words: totalWords,
      chapters: chapter,
      replies,
      estimated: unloaded > 0,
      parts,
      wordsByOrder: ordered,
    };
    this.emit();
  }

  private async readMessages(chatId: string): Promise<{ messages: StoryMessage[]; total: number }> {
    const ctx = this.ctx as AnyCtx;
    if (ctx.chats.getMessages) {
      try {
        const page = await ctx.chats.getMessages(chatId, { limit: READ_LIMIT, tail: true });
        const data = Array.isArray(page?.data) ? page.data : [];
        data.sort((a, b) => a.index_in_chat - b.index_in_chat);
        return { messages: data, total: Math.max(page?.total ?? data.length, data.length) };
      } catch (err) {
        console.warn("[fanfic-skins] could not read messages", err);
      }
    }
    const recent = ctx.messages.getRecent?.(READ_LIMIT) ?? [];
    return { messages: recent, total: recent.length };
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

function titleFromDocument(): string {
  const title = document.title.split(" · ")[0]?.trim();
  return title && title !== "Lumiverse" ? title : "";
}

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 238));
}
