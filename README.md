# Fanfic Skins for Lumiverse

Read your Lumiverse chats the way you read fanfiction: as an **Archive of Our Own** work or a **Wattpad** story. Both skins come in light and dark.

A lumitheme can only recolor what is already on the page. This extension goes further: it adds a site header, a tagged work preface or story banner, chapter headings, and a downloadable copy of the whole story.

The skins borrow each site's look, not its social features. There are no kudos, votes, read counts or other made-up numbers, and nothing on the page moves unless you scroll it.

## What changes

### AO3

- The **Archive of Our Own** masthead with the red navigation bar. The links go to the home page, your characters, your personas and search (the command palette). Skins and Preferences sit at the top right.
- A **work preface** above every chat: the tag box with rating, archive warning, category, fandom, relationships, characters and additional tags, and stats (published, updated, words, chapters). Below it are the title, the byline (the card's creator) and a summary.
- **Chapter headings.** Each character reply is a chapter.
- **Your replies are comments**, with the grey comment header, your persona's square icon and "on Chapter N".
- **Chapter Index** (jump to any chapter) and **Download** in the chat toolbar.
- At the end: ↑ Top and **Next Chapter →** (sends your draft, or asks for the next reply), with a one-line word count.
- The home page becomes **Your Works**, with each chat shown as a work blurb.

### Wattpad

- A slim header: the orange **W**, search, the skin panel and your avatar.
- A **story banner**: the blurred cover, title, author, number of parts and summary.
- A **story bar** with the cover and title. Click it for the table of contents.
- **Part headings** ("Chapter One").
- Your replies appear as reader comments, and **Continue to next part** sits at the end of each chat.
- The message bar becomes Wattpad's **comment box**, docked under the page. It shows your persona's avatar, a rounded field and an orange **Post** pill that turns into **Stop** while a part is being written.
- The home page becomes a library shelf of covers.
- Optional, off by default: a faint **quote marker** beside the paragraph you hover (click it to quote that line into your reply), and a thin **reading-progress line** under the story bar.

### Both

- **Light and dark** for each skin. *Match Lumiverse* follows your Lumiverse light/dark mode, or you can pin one.
- **The page holds still while a reply streams.** New text appears below where you are reading instead of dragging the page down; scroll when you're ready, or use the jump-to-bottom button. You can turn this off.
- A **Fanfic** tab in the drawer: pick a skin, the mode and the text size, and turn each page part on or off.
- **Tag each work** in that tab: title, rating, warning, category, fandom, relationships, additional tags, summary and complete/WIP. The tags are saved per chat on your Lumiverse account.
- **Download as AO3 HTML.** Saves the whole chat, not just the loaded part, as a self-contained page in the layout of AO3's own HTML download, with your tags, chapters and comments.
- The skins override any lumitheme on the elements they add. Still, a built-in Lumiverse theme gives the cleanest result.

## Install

In Lumiverse, open the **Extensions** panel → **Add Extension**, paste this into the GitHub repo URL field and choose **Install from Source**:

```
https://github.com/japolino/lumiverse-fanfic-skins
```

Enable it and grant the **generation** permission. Next Chapter / Continue uses it to ask for the next reply. Then open the **Fanfic** tab in the drawer.

### Manual install

Copy this folder to `data/extensions/fanfic_skins/repo/` in your Lumiverse install, then use **Import Local** in the extensions panel. `dist/frontend.js` is committed, so no build step is needed.

## Develop

```bash
bun install
bun run build
```

`bun run build` regenerates `src/generated/assets.ts` from `assets/`, typechecks, and bundles `src/frontend.ts` into `dist/frontend.js`.

| File | What it does |
| --- | --- |
| `src/frontend.ts` | Entry point: loads prefs, applies the skin CSS, starts everything |
| `src/tokens.ts` | Color and type tokens for AO3 and Wattpad, light and dark |
| `src/css/` | The skins. `common.ts` maps the tokens onto Lumiverse's variables and the reading column |
| `src/ui.ts` | Injected header, preface/banner, chapter headings, toolbar actions, progress line |
| `src/hold.ts` | Keeps the page still while a reply streams |
| `src/work.ts` | Reads the active chat: chapters, word counts, dates, cover, summary |
| `src/panel.ts` | The Fanfic drawer tab |
| `src/export.ts` | AO3-style HTML download |

## Notes

This is a fan project. It is not affiliated with or endorsed by the Organization for Transformative Works / Archive of Our Own or by Wattpad. The AO3 logo and the Wattpad W are their owners' marks and are used here only to evoke each site's look.
