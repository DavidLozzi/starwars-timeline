import React from 'react';
import { hasLocalStorage } from '../utils';
import config from '../site';

// One news stream serves every AurebeshFiles app; it lives in starwars-guide and is
// fetched at runtime so new items appear without a release here. Contract:
// ../starwars-guide/NEWS-FEED.md
// A pack that doesn't declare a feed URL (e.g. Marvel) gets an always-empty,
// never-fetching feed -- see the early return below.
const FEED_URL = config.menu.newsFeedUrl;
const CACHE_KEY = `${config.storagePrefix}_news_cache`;

const readCache = () => {
  if (!hasLocalStorage()) return null;
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // a full or unavailable store just means no offline copy, never an error
  }
};

// The feed names the kit to load rather than us hardcoding the id, so the whole brand
// stays on one Font Awesome version. Only needed for the per-product chips, so it's
// injected after the fetch resolves - the header icon is a local SVG and never waits.
const loadIconKit = (kit) => {
  if (!kit || document.querySelector(`script[src="${kit}"]`)) return;
  const script = document.createElement('script');
  script.src = kit;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

// Items dated in the future are staged announcements, hidden until their day.
const visibleItems = (items) => {
  if (!Array.isArray(items)) return [];
  const today = new Date();
  return items.filter((item) => new Date(item.date) <= today);
};

/**
 * Reads the shared AurebeshFiles news feed. Failure is silent by design - news is
 * never blocking, so a dead fetch just leaves the list empty (or on the last good
 * cached copy).
 * @returns {{items: Array, products: Object, loading: boolean}}
 */
const useNewsFeed = () => {
  const [feed, setFeed] = React.useState(() => (FEED_URL ? readCache() : null));
  const [loading, setLoading] = React.useState(Boolean(FEED_URL));

  React.useEffect(() => {
    if (!FEED_URL) return undefined;

    let active = true;

    // a cached feed can render its chips before (or without) a successful fetch
    loadIconKit(readCache()?.icons?.kit);

    const load = async () => {
      try {
        const res = await fetch(FEED_URL);
        if (!res.ok) throw new Error(`news feed ${res.status}`);
        const data = await res.json();
        writeCache(data);
        loadIconKit(data?.icons?.kit);
        if (active) setFeed(data);
      } catch {
        // keep whatever the cache gave us
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const items = React.useMemo(() => visibleItems(feed?.items), [feed]);

  return { items, products: feed?.products ?? {}, loading };
};

export default useNewsFeed;
