export function isRecentMeme(postedAt: string, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const posted = Date.parse(`${postedAt}T00:00:00Z`);
  return posted <= today && posted >= today - 6 * 24 * 60 * 60 * 1000;
}

export function prioritizeRecentMemes<Item extends { postedAt: string }>(items: Item[], now = new Date()) {
  const recent = items.filter((item) => isRecentMeme(item.postedAt, now));
  const older = items.filter((item) => !isRecentMeme(item.postedAt, now));
  recent.sort((first, second) => second.postedAt.localeCompare(first.postedAt));
  return [...recent, ...older];
}