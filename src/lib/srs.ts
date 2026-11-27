import { ALL_MUTOON } from "@/data/mutoon";
import { ALL_SURAHS, TOTAL_QURAN_PAGES } from "@/data/quran";
import { AppState, MasteryRating, ReciterId } from "@/types";

export const RECITERS: Record<
  ReciterId,
  { name: string; style: string; serverBase: string; recommended?: boolean }
> = {
  husary_murattal: {
    name: "الشيخ محمود خليل الحصري",
    style: "المصحف المرتّل (أضبط مخارج وأحكام)",
    serverBase: "https://server13.mp3quran.net/husr",
    recommended: true,
  },
  husary_muallim: {
    name: "الشيخ محمود خليل الحصري (المعلّم)",
    style: "مصحف المعلّم للتلقين والترديد",
    serverBase: "https://server13.mp3quran.net/husr/Almusshaf-Al-Mo-lim",
  },
  minshawi: {
    name: "الشيخ محمد صديق المنشاوي",
    style: "المصحف المرتّل",
    serverBase: "https://server10.mp3quran.net/minsh",
  },
  ayman_suwaid: {
    name: "الشيخ د. أيمن رشدي سويد",
    style: "المصحف التعليمي المتقن",
    serverBase: "https://server6.mp3quran.net/akdr",
  },
};

export function getReciterAudioUrl(reciter: ReciterId, surahId: number): string {
  const padded = String(surahId).padStart(3, "0");
  return `${RECITERS[reciter].serverBase}/${padded}.mp3`;
}

export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function calculateNextReview(
  currentInterval: number,
  currentEase: number,
  rating: MasteryRating
): { intervalDays: number; easeFactor: number; nextReview: string } {
  const today = getTodayStr();
  let interval = currentInterval || 1;
  let ease = currentEase || 2.3;

  if (rating === "hard") {
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else if (rating === "good") {
    if (interval <= 1) interval = 3;
    else if (interval <= 3) interval = 7;
    else interval = Math.min(30, Math.round(interval * ease));
  } else {
    if (interval <= 1) interval = 5;
    else interval = Math.min(45, Math.round(interval * (ease + 0.35)));
    ease = Math.min(2.8, ease + 0.15);
  }

  return {
    intervalDays: interval,
    easeFactor: Number(ease.toFixed(2)),
    nextReview: addDays(today, interval),
  };
}

export function computeStats(state: AppState) {
  const today = getTodayStr();

  // Quran progress
  let memorizedPages = 0;
  let memorizedAyahs = 0;
  let completedSurahs = 0;
  let dueQuranCount = 0;

  for (const surah of ALL_SURAHS) {
    const p = state.quran[surah.id];
    if (!p || p.memorizedAyahs <= 0) continue;
    const ratio = Math.min(1, p.memorizedAyahs / surah.ayahs);
    memorizedPages += ratio * surah.pages;
    memorizedAyahs += p.memorizedAyahs;
    if (p.memorizedAyahs >= surah.ayahs) completedSurahs++;
    if (p.nextReview && p.nextReview <= today) dueQuranCount++;
  }

  // Mutoon progress
  let totalMutoonUnits = 0;
  let memorizedMutoonUnits = 0;
  let completedMutoon = 0;
  let dueMutoonCount = 0;

  for (const m of ALL_MUTOON) {
    totalMutoonUnits += m.totalUnits;
    const p = state.mutoon[m.id];
    if (!p) continue;
    memorizedMutoonUnits += Math.min(m.totalUnits, p.memorizedUnits);
    if (p.memorizedUnits >= m.totalUnits) completedMutoon++;
    if (p.memorizedUnits > 0 && p.nextReview && p.nextReview <= today) {
      dueMutoonCount++;
    }
  }

  // Streak calculation
  let streak = 0;
  let cursor = today;
  const hasToday = (state.logs[today]?.minutes || 0) > 0;
  if (!hasToday) {
    cursor = addDays(today, -1);
  }
  while ((state.logs[cursor]?.minutes || 0) > 0) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  // Maintenance Ceiling estimation:
  // ~1.5 min daily maintenance per memorized Juz (20 pages) + 0.04 min per memorized matn unit
  const quranMaintenanceMins = Math.round((memorizedPages / 20) * 1.5 * 10) / 10;
  const mutoonMaintenanceMins = Math.round(memorizedMutoonUnits * 0.03 * 10) / 10;
  const totalMaintenanceMins = Math.round(quranMaintenanceMins + mutoonMaintenanceMins);
  const ceilingPercent = Math.min(
    100,
    Math.round((totalMaintenanceMins / Math.max(10, state.settings.dailyMinutes)) * 100)
  );

  // Rolling 30-day average pages/day for realistic Quran ETA
  let recentAyahs = 0;
  let activeDaysLast30 = 0;
  let totalMinutesLogged = 0;
  for (const log of Object.values(state.logs)) {
    totalMinutesLogged += log.minutes;
  }
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i);
    const log = state.logs[d];
    if (log && log.minutes > 0) {
      activeDaysLast30++;
      recentAyahs += log.ayahsAdded;
    }
  }

  // Fallback pace based on daily minutes if user just started (~0.33 page/day per 30 mins)
  const theoreticalPagesPerDay = (state.settings.dailyMinutes / 30) * 0.3;
  const actualPagesPerDay = recentAyahs > 0 ? recentAyahs / 15 / 30 : theoreticalPagesPerDay;
  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - memorizedPages);
  const estimatedDaysToFinishQuran =
    actualPagesPerDay > 0 ? Math.ceil(remainingPages / actualPagesPerDay) : 0;

  return {
    memorizedPages: Number(memorizedPages.toFixed(1)),
    quranPercent: Number(((memorizedPages / TOTAL_QURAN_PAGES) * 100).toFixed(1)),
    memorizedAyahs,
    completedSurahs,
    dueQuranCount,
    totalMutoonUnits,
    memorizedMutoonUnits,
    mutoonPercent:
      totalMutoonUnits > 0
        ? Number(((memorizedMutoonUnits / totalMutoonUnits) * 100).toFixed(2))
        : 0,
    completedMutoon,
    dueMutoonCount,
    streak,
    totalMinutesLogged,
    activeDaysLast30,
    totalMaintenanceMins,
    ceilingPercent,
    estimatedYearsToFinishQuran: Number((estimatedDaysToFinishQuran / 365).toFixed(1)),
  };
}
