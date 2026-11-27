"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ScrollText,
  Mic,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { ALL_SURAHS, getOrderedSurahs, TOTAL_QURAN_PAGES } from "@/data/quran";
import { ALL_MUTOON } from "@/data/mutoon";
import { computeStats, getTodayStr } from "@/lib/srs";
import FocusTimer from "@/components/FocusTimer";

export default function DashboardPage() {
  const { state, isHydrated, updateSurahAyahs, reviewSurah, updateMatnUnits, reviewMatn } =
    useHifz();

  if (!isHydrated) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-2xl bg-zinc-900" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-zinc-900" />
          <div className="h-80 rounded-2xl bg-zinc-900" />
        </div>
      </div>
    );
  }

  const today = getTodayStr();
  const stats = computeStats(state);
  const orderedSurahs = getOrderedSurahs(state.settings.startSurahId);

  // First uncompleted Surah in user's chosen sequence (starts at Surah Qaf = 50)
  const activeSurah =
    orderedSurahs.find((s) => (state.quran[s.id]?.memorizedAyahs || 0) < s.ayahs) ||
    orderedSurahs[0];
  const activeSurahProg = state.quran[activeSurah.id];
  const currentAyahs = activeSurahProg?.memorizedAyahs || 0;

  // Active Matn (defaults to Tuhfat Al-Atfal)
  const activeMatn =
    ALL_MUTOON.find((m) => m.id === state.settings.activeMatnId) || ALL_MUTOON[5];
  const activeMatnProg = state.mutoon[activeMatn.id];
  const currentMatnUnits = activeMatnProg?.memorizedUnits || 0;

  // Due Reviews today
  const dueSurahs = ALL_SURAHS.filter((s) => {
    const p = state.quran[s.id];
    return p && p.memorizedAyahs > 0 && p.nextReview && p.nextReview <= today;
  });
  const dueMutoon = ALL_MUTOON.filter((m) => {
    const p = state.mutoon[m.id];
    return p && p.memorizedUnits > 0 && p.nextReview && p.nextReview <= today;
  });

  const todayMinutes = state.logs[today]?.minutes || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-emerald-400 mb-1">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            مهمة اليوم — ورد الحفظ والمراجعة
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            مسارك الحالي يبدأ من{" "}
            <span className="text-emerald-400 font-bold">
              سورة {ALL_SURAHS.find((s) => s.id === state.settings.startSurahId)?.name}
            </span>{" "}
            بميزانية <span className="font-mono text-white">{state.settings.dailyMinutes}</span>{" "}
            دقيقة يومياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={state.settings.tarteelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition"
          >
            <Mic className="w-4 h-4" />
            افتح ترتيل للتسميع
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={state.settings.sharhDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition"
          >
            <ScrollText className="w-4 h-4" />
            شرح المتون
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>إنجاز اليوم</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">{todayMinutes}</span>
            <span className="text-xs text-zinc-500">/ {state.settings.dailyMinutes} دقيقة</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>القرآن المحفوظ</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">{stats.memorizedPages}</span>
            <span className="text-xs text-zinc-500">/ {TOTAL_QURAN_PAGES} صفحة</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>مراجعات مستحقة</span>
            <RefreshCw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">
              {dueSurahs.length + dueMutoon.length}
            </span>
            <span className="text-xs text-zinc-500">عنصر اليوم</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>سقف المراجعة</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                stats.ceilingPercent >= 75 ? "text-red-400" : "text-amber-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">
              {stats.totalMaintenanceMins} د
            </span>
            <span className="text-xs text-zinc-500">({stats.ceilingPercent}% من وقتك)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Column: Timer + Al-Husary Audio */}
        <div className="lg:col-span-6">
          <FocusTimer activeSurah={activeSurah} />
        </div>

        {/* Left Column: Active Quran Card + Active Matn Card */}
        <div className="lg:col-span-6 space-y-5">
          {/* Active Quran Card */}
          <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400">
                  السورة الحالية في المسار • الجزء {activeSurah.juz}
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  سورة {activeSurah.name}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  صفحة {activeSurah.startPage} • {currentAyahs} من {activeSurah.ayahs} آية
                </p>
              </div>
              <Link
                href="/quran"
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
              >
                كل السور
              </Link>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.round((currentAyahs / activeSurah.ayahs) * 100)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => updateSurahAyahs(activeSurah.id, currentAyahs + 5, activeSurah.ayahs)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                حفظت 5 آيات
              </button>
              <button
                onClick={() =>
                  updateSurahAyahs(activeSurah.id, currentAyahs + 10, activeSurah.ayahs)
                }
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                +10 آيات
              </button>
              <button
                onClick={() => updateSurahAyahs(activeSurah.id, activeSurah.ayahs, activeSurah.ayahs)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 text-xs font-semibold transition"
              >
                إتمام السورة
              </button>
            </div>
          </div>

          {/* Active Matn Card */}
          <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-amber-400">
                  المتن النشط حالياً • {activeMatn.levelLabel}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{activeMatn.title}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentMatnUnits} من {activeMatn.totalUnits} {activeMatn.unitLabel} • الشرح:{" "}
                  {activeMatnProg?.completedSharhLessons || 0}/{activeMatn.sharhLessons} درس
                </p>
              </div>
              <Link
                href="/mutoon"
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
              >
                كل المتون
              </Link>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden mb-4">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${Math.round((currentMatnUnits / activeMatn.totalUnits) * 100)}%`,
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  updateMatnUnits(activeMatn.id, currentMatnUnits + 3, activeMatn.totalUnits)
                }
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                +3 {activeMatn.unitLabel}
              </button>
              <a
                href={activeMatn.sharhUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                سماع الشرح
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Due SRS Reviews Queue */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">قائمة المراجعة المستحقة اليوم (SRS)</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              المراجعة مقدّمة على الجديد دائماً — سمّع على ترتيل ثم قيّم إتقانك لجدولة المراجعة القادمة.
            </p>
          </div>
        </div>

        {dueSurahs.length === 0 && dueMutoon.length === 0 ? (
          <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-200">لا توجد مراجعات متأخرة الآن</p>
            <p className="text-xs text-zinc-500 mt-1">
              بمجرد حفظك لآيات جديدة من سورة ق أو أبيات من تحفة الأطفال ستُضاف هنا تلقائياً غداً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueSurahs.map((s) => (
              <div
                key={s.id}
                className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    قرآن كريم
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">سورة {s.name}</h3>
                  <p className="text-xs text-zinc-500">
                    محفوظ: {state.quran[s.id]?.memorizedAyahs}/{s.ayahs} آية
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => reviewSurah(s.id, "hard")}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold"
                  >
                    ضعيف (غداً)
                  </button>
                  <button
                    onClick={() => reviewSurah(s.id, "good")}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-bold"
                  >
                    جيد
                  </button>
                  <button
                    onClick={() => reviewSurah(s.id, "easy")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold"
                  >
                    متقن
                  </button>
                </div>
              </div>
            ))}

            {dueMutoon.map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                    {m.levelLabel}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{m.title}</h3>
                  <p className="text-xs text-zinc-500">
                    محفوظ: {state.mutoon[m.id]?.memorizedUnits}/{m.totalUnits} {m.unitLabel}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => reviewMatn(m.id, "hard")}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold"
                  >
                    ضعيف
                  </button>
                  <button
                    onClick={() => reviewMatn(m.id, "good")}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-bold"
                  >
                    جيد
                  </button>
                  <button
                    onClick={() => reviewMatn(m.id, "easy")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold"
                  >
                    متقن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
