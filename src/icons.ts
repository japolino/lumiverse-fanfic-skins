// Inline SVG icons. Paths are drawn on a 24px grid and inherit currentColor.

const svg = (body: string, size = 16, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ${extra}>${body}</svg>`;

export const icon = {
  eye: (s = 14) =>
    svg('<path d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z"/>', s),
  star: (s = 14) =>
    svg('<path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>', s),
  starOutline: (s = 14) =>
    svg('<path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>', s),
  comment: (s = 14) =>
    svg('<path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>', s),
  heart: (s = 14) =>
    svg('<path d="M12 21s-7.5-4.6-9.7-9.2C.8 8.6 2.6 4.5 6.4 4.1c2.2-.2 4 .9 5.6 2.9 1.6-2 3.4-3.1 5.6-2.9 3.8.4 5.6 4.5 4.1 7.7C19.5 16.4 12 21 12 21z"/>', s),
  list: (s = 14) =>
    svg('<path d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zm-4 6h2v2H3zm4 0h14v2H7z"/>', s),
  chevronDown: (s = 14) =>
    svg('<path d="M6.4 8.6 12 14.2l5.6-5.6L19 10l-7 7-7-7z"/>', s),
  search: (s = 16) =>
    svg('<path d="M10.5 3a7.5 7.5 0 0 1 6 12l4.8 4.8-1.5 1.5-4.8-4.8A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/>', s),
  plus: (s = 14) => svg('<path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/>', s),
  bolt: (s = 14) => svg('<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>', s),
  download: (s = 14) =>
    svg('<path d="M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3zM4 18h16v2H4z"/>', s),
  share: (s = 14) =>
    svg('<path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/>', s),
  book: (s = 20) =>
    svg('<path d="M4 4.5C4 3.7 4.7 3 5.5 3H11v16H5.5A1.5 1.5 0 0 0 4 20.5zM13 3h5.5c.8 0 1.5.7 1.5 1.5v16a1.5 1.5 0 0 0-1.5-1.5H13zM4 20.5A1.5 1.5 0 0 1 5.5 19H11v2H5.5A1.5 1.5 0 0 1 4 20.5zM13 19h5.5a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5.5H13z"/>', s),
  arrowUp: (s = 14) => svg('<path d="M11 20V7.8l-5.6 5.6L4 12l8-8 8 8-1.4 1.4L13 7.8V20z"/>', s),
  arrowRight: (s = 14) => svg('<path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z"/>', s),
  quote: (s = 14) =>
    svg('<path d="M4 6h6v6H7c0 2 1 3 3 3v3c-4 0-6-2.5-6-6zm10 0h6v6h-3c0 2 1 3 3 3v3c-4 0-6-2.5-6-6z"/>', s),
  user: (s = 14) => svg('<path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z"/>', s),
};

/** Same glyphs as data URIs for use in CSS `content:` and backgrounds. */
export function iconDataUri(name: keyof typeof icon, color: string, size = 14): string {
  const markup = icon[name](size).replace('fill="currentColor"', `fill="${color}"`).replace(/stroke="currentColor"/g, `stroke="${color}"`);
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(markup)}")`;
}
