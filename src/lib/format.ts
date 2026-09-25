export function timeAgo(iso: string | Date): string {
  const then = typeof iso === "string" ? Date.parse(iso) : iso.getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  const units: [string, number][] = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [name, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return value === 1 ? `1 ${name} ago` : `${value} ${name}s ago`;
  }
  return "just now";
}