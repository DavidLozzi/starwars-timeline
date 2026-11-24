import React from 'react';
import { hasLocalStorage } from '../utils';

// One news stream serves every AurebeshFiles app; it lives in starwars-guide and is
// fetched at runtime so new items appear without a release here. Contract:
// ../starwars-guide/NEWS-FEED.md
const FEED_URL = 'https://starwars.guide/news-feed.json';
const CACHE_KEY = 'starwars_timeline_news_cache';

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

// The per-product chips use Font Awesome class names from the feed. Loaded as the
// same Free 6.7.2 stylesheet the hub uses (starwars-guide/_includes/fontawesome.html),
// not the feed's `icons.kit`: that account kit has returned 403 since 2026-10-12,
// which left every chip icon blank. Injected lazily since only the news modal needs
// it - the header bell is a local SVG and never waits.
const FA_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
const FA_SRI = 'sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==';

const loadIcons = () => {
  if (document.querySelector(`link[href="${FA_CSS}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FA_CSS;
  link.integrity = FA_SRI;
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  document.head.appendChild(link);
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
  const [feed, setFeed] = React.useState(() => readCache());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    loadIcons();

    const load = async () => {
      try {
        const res = await fetch(FEED_URL);
        if (!res.ok) throw new Error(`news feed ${res.status}`);
        const data = await res.json();
        writeCache(data);
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
