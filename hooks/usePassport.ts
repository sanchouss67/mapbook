"use client";

import { useCallback, useEffect, useState } from "react";

export type PassportStamps = Record<string, number[]>;

const STORAGE_KEY = "mapbook.kids.passport.v1";

function sanitize(value: unknown): PassportStamps {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const result: PassportStamps = {};

  for (const [bookId, orders] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(orders)) continue;

    const clean = orders.filter(
      (order): order is number => typeof order === "number" && Number.isInteger(order) && order > 0
    );

    if (clean.length > 0) result[bookId] = Array.from(new Set(clean)).sort((a, b) => a - b);
  }

  return result;
}

export function usePassport() {
  const [stamps, setStamps] = useState<PassportStamps>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
      if (raw) setStamps(sanitize(JSON.parse(raw)));
    } catch {
      // A broken or unavailable storage must not block the journey.
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));
    } catch {
      // Private mode and full quotas are fine: stamps just stay in memory.
    }
  }, [stamps, isReady]);

  const addStamp = useCallback((bookId: string, order: number) => {
    setStamps((previous) => {
      const orders = previous[bookId] ?? [];
      if (orders.includes(order)) return previous;

      return {
        ...previous,
        [bookId]: [...orders, order].sort((a, b) => a - b)
      };
    });
  }, []);

  const countFor = useCallback(
    (bookId: string) => stamps[bookId]?.length ?? 0,
    [stamps]
  );

  const hasStamp = useCallback(
    (bookId: string, order: number) => (stamps[bookId] ?? []).includes(order),
    [stamps]
  );

  const totalCount = useCallback(
    () => Object.values(stamps).reduce((sum, orders) => sum + orders.length, 0),
    [stamps]
  );

  const resetPassport = useCallback(() => setStamps({}), []);

  return { stamps, isReady, addStamp, hasStamp, countFor, totalCount, resetPassport };
}
