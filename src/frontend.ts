import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { ao3Css } from "./css/ao3";
import { guard } from "./css/common";
import { wattpadCss } from "./css/wattpad";
import { exportWork } from "./export";
import { StreamHold } from "./hold";
import { PANEL_CSS, Panel } from "./panel";
import { Store } from "./prefs";
import type { Mode } from "./tokens";
import { Chrome, shownWork } from "./ui";
import { WorkTracker } from "./work";

/** Events that can change what the work header, chapters or stats show. */
const REFRESH_EVENTS = [
  "CHAT_CHANGED",
  "MESSAGE_SENT",
  "MESSAGE_EDITED",
  "MESSAGE_DELETED",
  "MESSAGE_SWIPED",
  "GENERATION_ENDED",
  "GENERATION_STOPPED",
  "PERSONA_CHANGED",
  "CHARACTER_EDITED",
];

export function setup(ctx: SpindleFrontendContext) {
  const html = document.documentElement;
  const store = new Store(ctx);
  const work = new WorkTracker(ctx);
  const stops: Array<() => void> = [];
  let removeStyle: (() => void) | null = null;
  let styleKey = "";
  let disposed = false;

  const panel = new Panel(ctx, store, work, () => void download());
  const chrome = new Chrome(ctx, store, work, {
    openPanel: () => panel.open(),
    exportWork: () => void download(),
    editWork: () => panel.openWork(),
  });

  const hold = new StreamHold(ctx, () => store.prefs.skin !== "off" && store.prefs.holdScroll);

  async function download(): Promise<void> {
    const info = work.info;
    if (!info) return;
    try {
      await exportWork(ctx, shownWork(info, store.work(info.chatId)));
    } catch (err) {
      console.error("[fanfic-skins] export failed", err);
    }
  }

  /** Lumiverse marks light/dark on <html>; "auto" follows it. */
  function resolveMode(): Mode {
    const pref = store.prefs.mode;
    if (pref !== "auto") return pref;
    const host = html.getAttribute("data-theme-mode");
    if (host === "light" || host === "dark") return host;
    return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyStyle(): void {
    const prefs = store.prefs;
    const mode = resolveMode();
    const key = [prefs.skin, mode, prefs.proseSize, prefs.paragraphComments].join("|");
    if (prefs.skin === "off") {
      html.removeAttribute("data-ffs-skin");
      html.removeAttribute("data-ffs-mode");
    } else {
      html.setAttribute("data-ffs-skin", prefs.skin);
      html.setAttribute("data-ffs-mode", mode);
    }
    if (key === styleKey) return;
    styleKey = key;
    const css =
      PANEL_CSS +
      (prefs.skin === "ao3" ? ao3Css(mode, prefs.proseSize) : prefs.skin === "wattpad" ? wattpadCss(mode, prefs.proseSize, prefs.paragraphComments) : "");
    const previous = removeStyle;
    removeStyle = ctx.dom.addStyle(guard(css));
    // Swap after the new sheet is in so the page never flashes unstyled.
    previous?.();
  }

  function renderAll(): void {
    if (disposed) return;
    applyStyle();
    chrome.refresh();
    panel.render();
  }

  // Hits count once per visit to a chat.
  let lastChat: string | null = null;
  function onWorkChange(): void {
    const chatId = work.info?.chatId ?? null;
    if (chatId && chatId !== lastChat) {
      lastChat = chatId;
      const hits = store.work(chatId).hits ?? 0;
      store.setWork(chatId, { hits: hits + 1 });
      return; // setWork re-renders through the store listener
    }
    if (!chatId) lastChat = null;
    renderAll();
  }

  // Paint from this browser's cached prefs first; the server copy follows.
  store.loadCached();
  applyStyle();
  panel.start();
  chrome.start();
  chrome.refresh();
  hold.start();
  stops.push(store.onChange(renderAll));
  stops.push(work.onChange(onWorkChange));

  void (async () => {
    await store.load();
    if (disposed) return;
    renderAll();

    const modeObserver = new MutationObserver(() => {
      if (store.prefs.mode === "auto") renderAll();
    });
    modeObserver.observe(html, { attributes: true, attributeFilter: ["data-theme-mode"] });
    stops.push(() => modeObserver.disconnect());

    stops.push(ctx.events.on("CHAT_SWITCHED", () => work.refreshSoon(50)));
    for (const event of REFRESH_EVENTS) stops.push(ctx.events.on(event, () => work.refreshSoon()));
    if (ctx.state?.subscribe) {
      stops.push(ctx.state.subscribe("chat.active", () => work.refreshSoon(50)));
      stops.push(ctx.state.subscribe("persona.activeId", () => renderAll()));
    }
    await work.refresh();
    renderAll();
  })().catch((err) => console.error("[fanfic-skins] setup failed", err));

  return () => {
    disposed = true;
    for (const stop of stops.splice(0)) stop();
    hold.stop();
    chrome.stop();
    panel.stop();
    work.dispose();
    store.dispose();
    removeStyle?.();
    html.removeAttribute("data-ffs-skin");
    html.removeAttribute("data-ffs-mode");
    html.removeAttribute("data-ffs-home-cards");
  };
}
