"use client";

import React from "react";
import { Flame, Clock, BookOpen, ScrollText, AlertTriangle, TrendingUp } from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { ALL_MUTOON, MUTOON_LEVELS } from "@/data/mutoon";
import { TOTAL_QURAN_PAGES } from "@/data/quran";
import { addDays, computeStats, getTodayStr } from "@/lib/srs";

export default function StatsPage() {
  const { state, isHydrated } = useHifz();

  if (!isHydrated) return <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse" />;

  const stats = computeStats(state);
  const today = getTodayStr();

  // Build 84-day (12 weeks) activity heatmap
  const heatmapDays = Array.from({ length: 84 }, (_, idx) => {
    const date = addDays(today, -(83 - idx));
    const mins = state.logs[date]?.minutes || 0;
    return { date, mins };
  });

  const getHeatColor = (mins: number) => {
    if (mins === 0) return "bg-zinc-900 border-zinc-800/80";
    if (mins < 15) return "bg-emerald-950 border-emerald-800";
    if (mins < 30) return "bg-emerald-700 border-emerald-600";
    return "bg-emerald-400 border-emerald-300";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          الإحصائيات والواقع الحسابي
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          أرقام صريحة تقيس التزامك الفعلي، سقف المراجعة، وتوقيت الختم المتوقع بناءً على سرعتك.
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>سلسلة الالتزام</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white mt-2">{stats.streak}</p>
          <p className="text-[11px] text-zinc-500 mt-1">يوم متواصل</p>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>إجمالي وقت الحفظ</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white mt-2">
            {(stats.totalMinutesLogged / 60).toFixed(1)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">ساعة مسجّلة</p>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>القرآن الكريم</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white mt-2">{stats.quranPercent}%</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {stats.completedSurahs} سورة مكتملة • {stats.memorizedPages}/{TOTAL_QURAN_PAGES} ص
          </p>
        </div>

        <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>توقّع ختم القرآن</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-mono font-bold text-white mt-2">
            {stats.estimatedYearsToFinishQuran}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">سنة بمعدلك الحالي</p>
        </div>
      </div>

      {/* Maintenance Ceiling Reality Meter */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle
                className={`w-5 h-5 ${
                  stats.ceilingPercent >= 75 ? "text-red-400" : "text-amber-400"
                }`}
              />
              مؤشر سقف المراجعة اليومي (Maintenance Ceiling)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              الوقت التقريبي اللازم يومياً فقط لمنع تفلّت محفوظك الحالي مقارنة بميزانيتك اليومية (
              {state.settings.dailyMinutes} دقيقة).
            </p>
          </div>
          <span className="font-mono text-xl font-bold text-white">
            {stats.totalMaintenanceMins} / {state.settings.dailyMinutes} د
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden">
          <div
            className={`h-full transition-all ${
              stats.ceilingPercent >= 80
                ? "bg-red-500"
                : stats.ceilingPercent >= 50
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${stats.ceilingPercent}%` }}
          />
        </div>

        <p className="text-xs text-zinc-400 mt-3">
          {stats.ceilingPercent >= 80
            ? "تحذير: المراجعة تستهلك أغلب ميزانيتك اليومية — ارفع وقتك اليومي من الإعدادات قبل فتح متون جديدة."
            : "الوضع متوازن حالياً: لديك مساحة آمنة للاستمرار في الحفظ الجديد مع الالتزام بورد المراجعة."}
        </p>
      </div>

      {/* 84-Day Activity Heatmap */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">خريطة الالتزام (آخر 84 يوماً)</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              نشط في {stats.activeDaysLast30} يوم من آخر 30 يوماً
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span>أقل</span>
            <span className="w-3 h-3 rounded bg-zinc-900 border border-zinc-800" />
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800" />
            <span className="w-3 h-3 rounded bg-emerald-700 border border-emerald-600" />
            <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-300" />
            <span>أكثر</span>
          </div>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-14 md:grid-cols-21 gap-1.5">
          {heatmapDays.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.mins} دقيقة`}
              className={`aspect-square rounded-md border transition ${getHeatColor(d.mins)}`}
            />
          ))}
        </div>
      </div>

      {/* Mutoon Breakdown by Level */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <ScrollText className="w-5 h-5 text-amber-400" />
          تقدّم مستويات متون طالب العلم
        </h2>

        <div className="space-y-3.5">
          {MUTOON_LEVELS.map((lvl) => {
            const items = ALL_MUTOON.filter((m) => m.level === lvl.id);
            const total = items.reduce((acc, m) => acc + m.totalUnits, 0);
            const done = items.reduce(
              (acc, m) => acc + Math.min(m.totalUnits, state.mutoon[m.id]?.memorizedUnits || 0),
              0
            );
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={lvl.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-200 font-semibold">{lvl.label}</span>
                  <span className="font-mono text-zinc-400">
                    {done} / {total} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
