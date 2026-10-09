const iso = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });

/** 2026-10-02 — articles, meta lines, anything that reads as a record. */
export const isoDate = (d: Date) => iso.format(d);
/** Oct 06 — compact notes lists only. */
export const shortDate = (d: Date) => short.format(d);

export const readingTime = (body: string) => {
  const words = body.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
};
