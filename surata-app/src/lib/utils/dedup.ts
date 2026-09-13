export function dedupByTitle<T extends { title: string }>(
  items: T[],
  keyLength = 60
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, keyLength);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function dedupByCompositeKey<T>(
  items: T[],
  compositeFn: (item: T) => string
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = compositeFn(item).toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function dedupByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
