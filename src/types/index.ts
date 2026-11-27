export type MasteryRating = "hard" | "good" | "easy";

export type ReciterId = "husary_murattal" | "husary_muallim" | "minshawi" | "ayman_suwaid";

export interface SurahData {
  id: number;
  name: string;
  ayahs: number;
  startPage: number;
  pages: number;
  juz: number;
}

export interface SurahProgress {
  surahId: number;
  memorizedAyahs: number;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lastReviewed: string | null; // YYYY-MM-DD
  nextReview: string | null;   // YYYY-MM-DD
  mastery: MasteryRating | null;
}

export type MatnLevel =
  | "level_1"
  | "level_2"
  | "level_3"
  | "level_4"
  | "level_5"
  | "level_6"
  | "level_7"
  | "extra";

export interface MatnData {
  id: string;
  title: string;
  author: string;
  level: MatnLevel;
  levelLabel: string;
  science: string;
  unitLabel: string;
  totalUnits: number;
  sharhLessons: number;
  sharhUrl: string;
  bookUrl: string;
  recommendedPhase: string;
}

export interface MatnProgress {
  matnId: string;
  memorizedUnits: number;
  completedSharhLessons: number;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lastReviewed: string | null;
  nextReview: string | null;
  mastery: MasteryRating | null;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  minutes: number;
  ayahsAdded: number;
  matnUnitsAdded: number;
  reviewsCompleted: number;
}

export interface UserSettings {
  dailyMinutes: number;
  startSurahId: number;
  reciter: ReciterId;
  activeMatnId: string;
  tarteelUrl: string;
  sharhDashboardUrl: string;
}

export interface AppState {
  quran: Record<number, SurahProgress>;
  mutoon: Record<string, MatnProgress>;
  logs: Record<string, DailyLog>;
  settings: UserSettings;
}
