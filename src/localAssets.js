import { useSyncExternalStore } from 'react';

// Files picked with the "📁" button, keyed by filename -> blob URL.
// Any image whose path ends with the same filename shows the local file instead,
// so the site can be previewed before the files are copied into /public.
let overrides = {};
const listeners = new Set();

export function addLocalFiles(files) {
  const next = { ...overrides };
  for (const f of files) next[f.name] = URL.createObjectURL(f);
  overrides = next;
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useResolvedSrc(src) {
  const map = useSyncExternalStore(subscribe, () => overrides);
  if (!src) return src;
  const name = decodeURIComponent(src.split('/').pop());
  return map[name] || src;
}
