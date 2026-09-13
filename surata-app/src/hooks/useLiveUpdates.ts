"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const STORAGE_KEY = "surata-update-frequency";
const DEFAULT_INTERVAL: UpdateInterval = 60;

export type UpdateInterval = 60 | 300 | 900 | 0;

export interface LiveUpdateOptions<T> {
  url: string;
  interval?: UpdateInterval;
  fallbackData: T;
  transform?: (data: unknown) => T;
}

export interface LiveUpdateResult<T> {
  data: T;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  refresh: () => void;
}

export function getStoredInterval(): UpdateInterval {
  if (typeof window === "undefined") return DEFAULT_INTERVAL;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return DEFAULT_INTERVAL;
  return Number(stored) as UpdateInterval;
}

export function setStoredInterval(interval: UpdateInterval): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(interval));
}

export function useLiveUpdates<T>({
  url,
  interval = DEFAULT_INTERVAL,
  fallbackData,
  transform,
}: LiveUpdateOptions<T>): LiveUpdateResult<T> {
  const [data, setData] = useState<T>(fallbackData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const urlRef = useRef(url);
  const transformRef = useRef(transform);

  useEffect(() => {
    urlRef.current = url;
    transformRef.current = transform;
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  const doFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    try {
      const res = await fetch(urlRef.current);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const t = transformRef.current;
      const newData = t ? t(json) : (json as T);
      if (mountedRef.current) {
        setData(newData);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Fetch failed");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    mountedRef.current = true;

    if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);

    if (interval === 0) return;

    doFetch();

    fetchIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        doFetch();
      }
    }, interval * 1000);

    return () => {
      mountedRef.current = false;
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, [interval, doFetch]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && interval > 0) {
        doFetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [interval, doFetch]);

  const isStale = useMemo(() => {
    return lastUpdated
      ? now - lastUpdated.getTime() > Math.max(interval, 60) * 1000 * 2
      : true;
  }, [lastUpdated, now, interval]);

  return {
    data,
    lastUpdated,
    isLoading,
    error,
    isStale,
    refresh,
  };
}
