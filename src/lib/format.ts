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
    if (value >= 1)
      return value === 1 ? `1 ${name} ago` : `${value} ${name}s ago`;
  }
  return "just now";
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-NG", { style: "currency", currency });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

/** Format a money string/number from the API into a currency string. */
export function formatMoney(value: number | string, currency = "NGN"): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return currencyFormatter(currency).format(0);
  return currencyFormatter(currency).format(amount);
}

/** Up to two initials from a full name, e.g. "Olivia Martin" → "OM". */
export function initialsOf(name: string | null | undefined): string {
  return (
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "??"
  );
}

/** Short readable id fragment for tables, e.g. first 8 chars of a UUID. */
export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

/** e.g. "Aug 2026" — used for the joined-on date. */
export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
