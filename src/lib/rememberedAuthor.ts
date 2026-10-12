const storageKey = "rick-memes:author";

export function getRememberedAuthor() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey) ?? "";
}

export function rememberAuthor(author: string) {
  window.localStorage.setItem(storageKey, author.trim());
}