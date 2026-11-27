"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SHARH_DASHBOARD_URL } from "@/data/mutoon";
import { addDays, calculateNextReview, getTodayStr } from "@/lib/srs";
import { AppState, MasteryRating, UserSettings } from "@/types";

const STORAGE_KEY = "itqan_hifz_state_v1";

const DEFAULT_STATE: AppState = {
  quran: {},
  mutoon: {},
  logs: {},
  settings: {
    dailyMinutes: 30,
    startSurahId: 50, // سورة ق
    reciter: "husary_murattal",
    activeMatnId: "tuhfat_alatfal",
    tarteelUrl: "https://app.tarteel.ai/",
    sharhDashboardUrl: SHARH_DASHBOARD_URL,
  },
};

interface HifzContextValue {
  state: AppState;
  isHydrated: boolean;
  updateSurahAyahs: (surahId: number, newAyahs: number, maxAyahs: number) => void;
  reviewSurah: (surahId: number, rating: MasteryRating) => void;
  updateMatnUnits: (matnId: number | string, newUnits: number, maxUnits: number) => void;
  updateMatnSharh: (matnId: string, newLessons: number, maxLessons: number) => void;
  reviewMatn: (matnId: string, rating: MasteryRating) => void;
  logSessionMinutes: (minutes: number) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  exportJson: () => string;
  importJson: (raw: string) => boolean;
  resetAll: () => void;
}

const HifzContext = createContext<HifzContextValue | null>(null);

export function HifzProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>;
        setState({
          quran: parsed.quran || {},
          mutoon: parsed.mutoon || {},
          logs: parsed.logs || {},
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        });
      }
    } catch {
      // ignore corrupted local storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota fallback
    }
  }, [state, isHydrated]);

  const updateSurahAyahs = (surahId: number, newAyahs: number, maxAyahs: number) => {
    const clamped = Math.max(0, Math.min(maxAyahs, newAyahs));
    const today = getTodayStr();

    setState((prev) => {
      const existing = prev.quran[surahId];
      const delta = Math.max(0, clamped - (existing?.memorizedAyahs || 0));
      const existingLog = prev.logs[today] || {
        date: today,
        minutes: 0,
        ayahsAdded: 0,
        matnUnitsAdded: 0,
        reviewsCompleted: 0,
      };

      return {
        ...prev,
        quran: {
          ...prev.quran,
          [surahId]: {
            surahId,
            memorizedAyahs: clamped,
            intervalDays: existing?.intervalDays || 1,
            easeFactor: existing?.easeFactor || 2.3,
            reviewCount: existing?.reviewCount || 0,
            lastReviewed: clamped > 0 ? today : null,
            nextReview: clamped > 0 ? existing?.nextReview || addDays(today, 1) : null,
            mastery: existing?.mastery || null,
          },
        },
        logs: {
          ...prev.logs,
          [today]: {
            ...existingLog,
            ayahsAdded: existingLog.ayahsAdded + delta,
            minutes: existingLog.minutes > 0 ? existingLog.minutes : delta > 0 ? 10 : 0,
          },
        },
      };
    });
  };

  const reviewSurah = (surahId: number, rating: MasteryRating) => {
    const today = getTodayStr();
    setState((prev) => {
      const existing = prev.quran[surahId];
      if (!existing) return prev;
      const calc = calculateNextReview(existing.intervalDays, existing.easeFactor, rating);
      const existingLog = prev.logs[today] || {
        date: today,
        minutes: 0,
        ayahsAdded: 0,
        matnUnitsAdded: 0,
        reviewsCompleted: 0,
      };

      return {
        ...prev,
        quran: {
          ...prev.quran,
          [surahId]: {
            ...existing,
            intervalDays: calc.intervalDays,
            easeFactor: calc.easeFactor,
            nextReview: calc.nextReview,
            lastReviewed: today,
            reviewCount: existing.reviewCount + 1,
            mastery: rating,
          },
        },
        logs: {
          ...prev.logs,
          [today]: {
            ...existingLog,
            reviewsCompleted: existingLog.reviewsCompleted + 1,
            minutes: existingLog.minutes > 0 ? existingLog.minutes : 5,
          },
        },
      };
    });
  };

  const updateMatnUnits = (matnId: number | string, newUnits: number, maxUnits: number) => {
    const id = String(matnId);
    const clamped = Math.max(0, Math.min(maxUnits, newUnits));
    const today = getTodayStr();

    setState((prev) => {
      const existing = prev.mutoon[id];
      const delta = Math.max(0, clamped - (existing?.memorizedUnits || 0));
      const existingLog = prev.logs[today] || {
        date: today,
        minutes: 0,
        ayahsAdded: 0,
        matnUnitsAdded: 0,
        reviewsCompleted: 0,
      };

      return {
        ...prev,
        mutoon: {
          ...prev.mutoon,
          [id]: {
            matnId: id,
            memorizedUnits: clamped,
            completedSharhLessons: existing?.completedSharhLessons || 0,
            intervalDays: existing?.intervalDays || 1,
            easeFactor: existing?.easeFactor || 2.3,
            reviewCount: existing?.reviewCount || 0,
            lastReviewed: clamped > 0 ? today : null,
            nextReview: clamped > 0 ? existing?.nextReview || addDays(today, 1) : null,
            mastery: existing?.mastery || null,
          },
        },
        logs: {
          ...prev.logs,
          [today]: {
            ...existingLog,
            matnUnitsAdded: existingLog.matnUnitsAdded + delta,
            minutes: existingLog.minutes > 0 ? existingLog.minutes : delta > 0 ? 10 : 0,
          },
        },
      };
    });
  };

  const updateMatnSharh = (matnId: string, newLessons: number, maxLessons: number) => {
    const clamped = Math.max(0, Math.min(maxLessons, newLessons));
    setState((prev) => {
      const existing = prev.mutoon[matnId];
      return {
        ...prev,
        mutoon: {
          ...prev.mutoon,
          [matnId]: {
            matnId,
            memorizedUnits: existing?.memorizedUnits || 0,
            completedSharhLessons: clamped,
            intervalDays: existing?.intervalDays || 1,
            easeFactor: existing?.easeFactor || 2.3,
            reviewCount: existing?.reviewCount || 0,
            lastReviewed: existing?.lastReviewed || null,
            nextReview: existing?.nextReview || null,
            mastery: existing?.mastery || null,
          },
        },
      };
    });
  };

  const reviewMatn = (matnId: string, rating: MasteryRating) => {
    const today = getTodayStr();
    setState((prev) => {
      const existing = prev.mutoon[matnId];
      if (!existing) return prev;
      const calc = calculateNextReview(existing.intervalDays, existing.easeFactor, rating);
      const existingLog = prev.logs[today] || {
        date: today,
        minutes: 0,
        ayahsAdded: 0,
        matnUnitsAdded: 0,
        reviewsCompleted: 0,
      };

      return {
        ...prev,
        mutoon: {
          ...prev.mutoon,
          [matnId]: {
            ...existing,
            intervalDays: calc.intervalDays,
            easeFactor: calc.easeFactor,
            nextReview: calc.nextReview,
            lastReviewed: today,
            reviewCount: existing.reviewCount + 1,
            mastery: rating,
          },
        },
        logs: {
          ...prev.logs,
          [today]: {
            ...existingLog,
            reviewsCompleted: existingLog.reviewsCompleted + 1,
            minutes: existingLog.minutes > 0 ? existingLog.minutes : 5,
          },
        },
      };
    });
  };

  const logSessionMinutes = (minutes: number) => {
    const today = getTodayStr();
    setState((prev) => {
      const existingLog = prev.logs[today] || {
        date: today,
        minutes: 0,
        ayahsAdded: 0,
        matnUnitsAdded: 0,
        reviewsCompleted: 0,
      };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [today]: {
            ...existingLog,
            minutes: existingLog.minutes + Math.max(1, Math.round(minutes)),
          },
        },
      };
    });
  };

  const updateSettings = (patch: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  };

  const exportJson = () => JSON.stringify(state, null, 2);

  const importJson = (raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed || typeof parsed !== "object" || !parsed.settings) return false;
      setState({
        quran: parsed.quran || {},
        mutoon: parsed.mutoon || {},
        logs: parsed.logs || {},
        settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
      });
      return true;
    } catch {
      return false;
    }
  };

  const resetAll = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <HifzContext.Provider
      value={{
        state,
        isHydrated,
        updateSurahAyahs,
        reviewSurah,
        updateMatnUnits,
        updateMatnSharh,
        reviewMatn,
        logSessionMinutes,
        updateSettings,
        exportJson,
        importJson,
        resetAll,
      }}
    >
      {children}
    </HifzContext.Provider>
  );
}

export function useHifz() {
  const ctx = useContext(HifzContext);
  if (!ctx) throw new Error("useHifz must be used inside HifzProvider");
  return ctx;
}
