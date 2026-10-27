import type { SpindleFrontendContext } from "lumiverse-spindle-types";

const SCROLL_TOP = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop")!;
const LIST = '[data-component="MessageList"]';

/**
 * Lumiverse keeps a streaming reply in view by scrolling the chat list down
 * as it grows. Reading sites never move the page under you, so once the new
 * part has started we refuse the list's own downward scrolls until the reply
 * is done. Your wheel, touch, keys and scrollbar are native scrolls and keep
 * working; the jump-to-bottom button lets go for the rest of the reply.
 */
export class StreamHold {
  private streaming = false;
  private holding = false;
  private list: HTMLElement | null = null;
  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private stopFirstToken: (() => void) | null = null;
  private stops: Array<() => void> = [];

  constructor(
    private ctx: SpindleFrontendContext,
    private enabled: () => boolean,
  ) {}

  start(): void {
    this.stops.push(
      this.ctx.events.on("GENERATION_STARTED", () => this.begin()),
      this.ctx.events.on("GENERATION_ENDED", () => this.end()),
      this.ctx.events.on("GENERATION_STOPPED", () => this.end()),
    );
    const onPointer = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('[data-component="ScrollToBottom"]')) this.letGo();
    };
    document.addEventListener("pointerdown", onPointer, true);
    this.stops.push(() => document.removeEventListener("pointerdown", onPointer, true));
  }

  stop(): void {
    this.end();
    for (const stop of this.stops.splice(0)) stop();
  }

  private begin(): void {
    this.end();
    this.streaming = true;
    // Let the first words land and come into view, then hold the page there.
    this.stopFirstToken = this.ctx.events.on("STREAM_TOKEN_RECEIVED", () => {
      this.stopFirstToken?.();
      this.stopFirstToken = null;
      this.later(() => this.engage(), 300);
    });
    this.later(() => this.engage(), 2500);
  }

  private end(): void {
    this.streaming = false;
    this.stopFirstToken?.();
    this.stopFirstToken = null;
    for (const timer of this.timers.splice(0)) clearTimeout(timer);
    this.letGo();
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private engage(): void {
    if (!this.streaming || this.holding || !this.enabled()) return;
    const list = document.querySelector<HTMLElement>(LIST);
    if (!list) return;
    this.holding = true;
    this.list = list;
    const hold = this;
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      get(this: HTMLElement) {
        return SCROLL_TOP.get!.call(this) as number;
      },
      set(this: HTMLElement, value: number) {
        if (hold.holding && value > (SCROLL_TOP.get!.call(this) as number) + 1) return;
        SCROLL_TOP.set!.call(this, value);
      },
    });
    // Tell Lumiverse the reader has taken over, as an upward wheel turn does,
    // so it doesn't pull the page to the bottom when the reply finishes.
    list.dispatchEvent(new WheelEvent("wheel", { deltaY: -120, deltaMode: 0, bubbles: true, cancelable: true }));
  }

  private letGo(): void {
    this.holding = false;
    if (this.list) delete (this.list as unknown as Record<string, unknown>).scrollTop;
    this.list = null;
  }
}
