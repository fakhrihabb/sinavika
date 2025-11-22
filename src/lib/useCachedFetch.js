/**
 * Custom hook for fetching data with automatic caching and revalidation
 * Similar to SWR but lightweight and tailored for our needs
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const cache = new Map();
const subscribers = new Map();

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEDUPE_TIME = 2000; // 2 seconds

function getCacheKey(url, userId) {
  return `${url}?userId=${userId}`;
}

export function useCachedFetch(url, userId = 'demo-user', options = {}) {
  const {
    enabled = true,
    refetchOnMount = false,
    staleTime = 30000, // 30 seconds
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  const cacheKey = getCacheKey(url, userId);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    const cached = cache.get(cacheKey);

    // Return cached data if fresh enough and not forcing
    if (!force && cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      return cached.data;
    }

    // Deduplicate requests within DEDUPE_TIME
    if (!force && (now - lastFetchRef.current) < DEDUPE_TIME) {
      return;
    }

    lastFetchRef.current = now;

    try {
      const fullUrl = `${url}?userId=${userId}`;
      const response = await fetch(fullUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (mountedRef.current) {
        // Update cache
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        setError(null);
        setIsLoading(false);

        // Notify subscribers
        const subs = subscribers.get(cacheKey) || [];
        subs.forEach(cb => cb(result));
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setIsLoading(false);
      }
      throw err;
    }
  }, [url, userId, cacheKey, staleTime]);

  const mutate = useCallback(async (newData) => {
    if (newData) {
      // Optimistic update
      cache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      });
      setData(newData);
    } else {
      // Refetch
      await fetchData(true);
    }
  }, [cacheKey, fetchData]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      return;
    }

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && !refetchOnMount) {
      setData(cached.data);
      setIsLoading(false);

      // Revalidate in background if stale
      const age = Date.now() - cached.timestamp;
      if (age > staleTime) {
        fetchData();
      }
    } else {
      fetchData();
    }

    // Subscribe to updates from other components
    const subscriber = (newData) => {
      if (mountedRef.current) {
        setData(newData);
      }
    };

    if (!subscribers.has(cacheKey)) {
      subscribers.set(cacheKey, []);
    }
    subscribers.get(cacheKey).push(subscriber);

    return () => {
      mountedRef.current = false;
      // Cleanup subscriber
      const subs = subscribers.get(cacheKey) || [];
      const index = subs.indexOf(subscriber);
      if (index > -1) {
        subs.splice(index, 1);
      }
    };
  }, [enabled, url, userId, cacheKey, refetchOnMount, staleTime, fetchData]);

  return {
    data,
    error,
    isLoading,
    mutate,
    refetch: () => fetchData(true),
  };
}

// Utility to preload data
export function prefetch(url, userId = 'demo-user') {
  const cacheKey = getCacheKey(url, userId);
  const cached = cache.get(cacheKey);
  const now = Date.now();

  // Skip if recently fetched
  if (cached && (now - cached.timestamp) < DEDUPE_TIME) {
    return Promise.resolve(cached.data);
  }

  const fullUrl = `${url}?userId=${userId}`;
  return fetch(fullUrl)
    .then(res => res.json())
    .then(data => {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    });
}

// Clear cache for a specific key or all
export function clearCache(url, userId) {
  if (url) {
    const cacheKey = getCacheKey(url, userId);
    cache.delete(cacheKey);
  } else {
    cache.clear();
  }
}
