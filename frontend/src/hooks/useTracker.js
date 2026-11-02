/**
 * useTracker.js
 *
 * Lightweight frontend event tracking hook.
 *
 * Features:
 *  - In-memory queue that auto-flushes every 5 s or when it hits 20 events
 *  - Flushes immediately on page unload (sendBeacon)
 *  - Reads sessionId from localStorage (created once per browser)
 *  - Attaches current page path and referrer automatically
 *  - Never throws — all errors are swallowed so tracking never breaks the UI
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE      = 'http://localhost:5000/api';
const BATCH_URL     = `${API_BASE}/events/batch`;
const FLUSH_INTERVAL = 5000;   // ms
const FLUSH_SIZE     = 20;     // events

// ── Session ID (stable per browser, survives page reloads) ───────────────────
function getSessionId() {
  let id = localStorage.getItem('_sid');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('_sid', id);
  }
  return id;
}

// ── Shared in-memory queue (module-level so it's shared across hook instances)
const queue = [];
let flushTimer = null;

function flush() {
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);  // drain
  const sessionId = getSessionId();

  // Use sendBeacon if available (works on page unload)
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify({ events: batch })], { type: 'application/json' });
    navigator.sendBeacon(BATCH_URL, blob);
  } else {
    // Fallback to fetch (keepalive for unload scenarios)
    fetch(BATCH_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-session-id':  sessionId,
        ...(localStorage.getItem('userInfo')
          ? { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}` }
          : {}),
      },
      body:      JSON.stringify({ events: batch }),
      keepalive: true,
    }).catch(() => {}); // silent fail
  }
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useTracker() {
  const location   = useLocation();
  const sessionId  = useRef(getSessionId());

  // Start interval flush
  useEffect(() => {
    if (flushTimer) return;
    flushTimer = setInterval(flush, FLUSH_INTERVAL);
    return () => {
      clearInterval(flushTimer);
      flushTimer = null;
    };
  }, []);

  /**
   * track(eventType, payload?)
   * Push one event onto the queue.
   */
  const track = useCallback((eventType, payload = {}) => {
    try {
      queue.push({
        eventType,
        page:       location.pathname,
        referrer:   document.referrer || null,
        occurredAt: new Date().toISOString(),
        payload,
      });

      // Flush immediately if queue is full
      if (queue.length >= FLUSH_SIZE) flush();
    } catch {
      // silent
    }
  }, [location.pathname]);

  // Auto page_view on every route change
  useEffect(() => {
    track('page_view', { page: location.pathname, search: location.search });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return { track, sessionId: sessionId.current };
}