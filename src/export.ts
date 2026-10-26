import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { AO3_LOGO } from "./brand";
import { CATEGORY_LABEL, RATING_LABEL, WARNING_LABEL, esc, type ShownWork } from "./ui";
import { countWords, formatDate, type StoryMessage } from "./work";

/** Minimal markdown for chat prose: paragraphs, emphasis, quotes, rules. */
export function proseToHtml(text: string): string {
  const blocks = text.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return "<hr>";
      if (/^>\s?/.test(trimmed)) {
        const inner = trimmed.replace(/^>\s?/gm, "");
        return `<blockquote>${inline(inner)}</blockquote>`;
      }
      const heading = /^(#{1,4})\s+(.*)(?:\n([\s\S]*))?$/.exec(trimmed);
      if (heading) {
        const level = heading[1]!.length + 2;
        const rest = heading[3]?.trim();
        return `<h${level}>${inline(heading[2]!)}</h${level}>${rest ? `\n<p>${inline(rest)}</p>` : ""}`;
      }
      return `<p>${inline(trimmed)}</p>`;
    })
    .join("\n");
}

function inline(text: string): string {
  return esc(text.replace(/<[^>]+>/g, ""))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w_])_(?!\s)(.+?)_(?!\w)/g, "$1<em>$2</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\n/g, "<br>\n");
}

async function readAll(ctx: SpindleFrontendContext, chatId: string): Promise<{ messages: StoryMessage[]; partial: boolean }> {
  // The app's own export endpoint returns the whole chat for the signed-in user.
  try {
    const res = await fetch(`/api/v1/chats/${encodeURIComponent(chatId)}/export`, { credentials: "same-origin" });
    if (res.ok) {
      const body = (await res.json()) as { messages?: StoryMessage[] };
      if (Array.isArray(body.messages) && body.messages.length) {
        return { messages: [...body.messages].sort((a, b) => a.index_in_chat - b.index_in_chat), partial: false };
      }
    }
  } catch {
    /* fall back to the extension API */
  }
  const chats = ctx.chats as unknown as {
    getMessages?: (id: string, o?: { limit?: number; tail?: boolean }) => Promise<{ data: StoryMessage[]; total: number }>;
  };
  const page = chats.getMessages ? await chats.getMessages(chatId, { limit: 200, tail: true }) : { data: [], total: 0 };
  const data = [...(page.data ?? [])].sort((a, b) => a.index_in_chat - b.index_in_chat);
  return { messages: data, partial: page.total > data.length };
}

function filename(title: string, author: string): string {
  const slug = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 60);
  return `${slug(title) || "Work"}${author ? `_by_${slug(author)}` : ""}.html`;
}

/** AO3's "Download → HTML" layout, self-contained. */
export async function exportWork(ctx: SpindleFrontendContext, work: ShownWork): Promise<void> {
  const { messages, partial } = await readAll(ctx, work.info.chatId);
  const charMessages = messages.filter((m) => !m.is_user);
  const words = messages.reduce((n, m) => n + countWords(m.content), 0);
  let chapter = 0;
  const body = messages
    .map((m) => {
      if (m.is_user) {
        return `<div class="comment"><h4 class="byline">${esc(m.name || work.info.personaName)}</h4>\n${proseToHtml(m.content)}</div>`;
      }
      chapter++;
      return `<h2 class="toc-heading">Chapter ${chapter}</h2>\n<div class="userstuff">${proseToHtml(m.content)}</div>`;
    })
    .join("\n\n");

  const tags = (label: string, items: string[]) =>
    items.length ? `<dt>${label}:</dt><dd>${items.map((t) => `<a>${esc(t)}</a>`).join(", ")}</dd>` : "";
  const first = messages[0]?.send_date;
  const last = messages[messages.length - 1]?.send_date;
  const toDate = (v?: number) => (v ? new Date(v < 1e12 ? v * 1000 : v) : null);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(work.title)} - ${esc(work.info.author)}</title>
<style>
body { margin: 0 auto; max-width: 46em; padding: 1.5em 1.2em 3em; font: 16px/1.5 "Lucida Grande", "Lucida Sans Unicode", Verdana, Helvetica, sans-serif; color: #2a2a2a; background: #fff; }
a { color: #900; }
#masthead { display: flex; align-items: center; gap: .4em; padding-bottom: .5em; border-bottom: 5px solid #900; margin-bottom: 1.2em; }
#masthead img { height: 42px; }
#masthead span { font: 24px Georgia, serif; color: #900; }
.message { font-size: .85em; color: #555; }
dl.tags { border: 1px solid #ccc; padding: 1em .75em .4em; display: grid; grid-template-columns: minmax(9em, 25%) 1fr; gap: 0 1em; font-size: .85em; }
dl.tags dd { margin: 0 0 .6em; }
dl.tags dd a { color: #111; border-bottom: 1px dotted #111; text-decoration: none; }
h1 { font: 400 2em Georgia, serif; text-align: center; margin: 1em 0 .2em; }
.byline { text-align: center; font: 1.1em Georgia, serif; margin-bottom: 1.5em; }
.summary h3 { font: 400 1.1em Georgia, serif; border-bottom: 1px solid; }
blockquote { margin: .6em 0 .6em 2em; }
h2.toc-heading { font: 400 1.3em Georgia, serif; text-align: center; border-top: 1px solid; padding-top: 1em; margin-top: 2em; }
.userstuff p { margin: 1.286em 0; }
.comment { border: 1px solid #ddd; margin: 1.5em 0; padding: 0 .9em .4em; font-size: .92em; }
.comment h4.byline { background: #ddd; margin: 0 -.9em; padding: .3em .9em; text-align: left; font: 700 .9em "Lucida Grande", Verdana, sans-serif; color: #900; }
#afterword { margin-top: 3em; border-top: 1px solid #ccc; padding-top: 1em; }
@media (prefers-color-scheme: dark) {
  body { background: #262626; color: #e3e3e3; }
  dl.tags { border-color: #4d4d4d; }
  dl.tags dd a { color: #e8e8e8; border-color: #bdbdbd; }
  .comment { border-color: #444; } .comment h4.byline { background: #333; color: #ff8f8f; }
  a, #masthead span { color: #ff8f8f; } #masthead img { filter: brightness(1.75); }
  .message { color: #aaa; }
}
</style>
</head>
<body>
<div id="masthead"><img src="${AO3_LOGO}" alt=""><span>Archive of Our Own</span></div>
<div id="preface">
<p class="message"><b>${esc(work.title)}</b><br>Exported from Lumiverse on ${formatDate(new Date())} with Fanfic Skins.${partial ? " Only the most recent messages could be read." : ""}</p>
<div class="meta"><dl class="tags">
${tags("Rating", [RATING_LABEL[work.rating]])}
${tags("Archive Warning", [WARNING_LABEL[work.warning]])}
${work.category !== "none" ? tags("Category", [CATEGORY_LABEL[work.category]]) : ""}
${tags("Fandom", [work.fandom])}
${tags("Relationship", work.relationships)}
${tags("Characters", work.characters)}
${tags("Additional Tags", work.tags)}
<dt>Stats:</dt><dd>Published: ${formatDate(toDate(first))} &nbsp; ${work.complete ? "Completed" : "Updated"}: ${formatDate(toDate(last))} &nbsp; Words: ${words.toLocaleString()} &nbsp; Chapters: ${charMessages.length}/${work.complete ? charMessages.length : "?"}</dd>
</dl></div>
<h1>${esc(work.title)}</h1>
<div class="byline">by <a>${esc(work.info.author)}</a></div>
${work.summary ? `<div class="summary"><h3>Summary</h3><blockquote>${proseToHtml(work.summary)}</blockquote></div>` : ""}
</div>
<div id="chapters">
${body}
</div>
<div id="afterword"><p class="message">A story told between ${esc(work.info.characterName)} and ${esc(work.info.personaName)}.</p></div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename(work.title, work.info.author);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
