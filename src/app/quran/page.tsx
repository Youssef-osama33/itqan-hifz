"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Mic,
  Volume2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Minus,
} from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { getOrderedSurahs, TOTAL_QURAN_PAGES } from "@/data/quran";
import { computeStats, getReciterAudioUrl } from "@/lib/srs";

export default function QuranPage() {
  const { state, isHydrated, updateSurahAyahs, reviewSurah } = useHifz();
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<"all" | "phase1" | "phase2" | "in_progress">(
    "phase1"
  );
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);

  const startId = state.settings.startSurahId;
  const ordered = useMemo(() => getOrderedSurahs(startId), [startId]);
  const stats = computeStats(state);

  const filtered = useMemo(() => {
    return ordered.filter((s) => {
      if (search.trim() && !s.name.includes(search.trim()) && String(s.id) !== search.trim()) {
        return false;
      }
      if (phaseFilter === "phase1") return s.id >= startId;
      if (phaseFilter === "phase2") return s.id < startId;
      if (phaseFilter === "in_progress") {
        const m = state.quran[s.id]?.memorizedAyahs || 0;
        return m > 0 && m < s.ayahs;
      }
      return true;
    });
  }, [ordered, search, phaseFilter, startId, state.quran]);

  if (!isHydrated) return <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">مسار حفظ القرآن الكريم</h1>
          <p className="text-sm text-zinc-400 mt-1">
            مرتّب تلقائياً من <span className="text-emerald-400 font-bold">سورة رقم {startId}</span>{" "}
            حتى الناس، ثم استكمال النصف الأول — المحفوظ:{" "}
            <span className="font-mono text-white">
              {stats.memorizedPages} / {TOTAL_QURAN_PAGES}
            </span>{" "}
            صفحة ({stats.quranPercent}%)
          </p>
        </div>

        <a
          href={state.settings.tarteelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 w-fit transition"
        >
          <Mic className="w-4 h-4" />
          التسميع عبر ترتيل
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Search & Phase Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها (مثلاً: ق، الذاريات، 50)..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#111114] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "phase1", label: "المرحلة الأولى (من ق ← الناس)" },
            { id: "phase2", label: "المرحلة الثانية (الفاتحة ← الحجرات)" },
            { id: "in_progress", label: "قيد الحفظ" },
            { id: "all", label: "المصحف كاملًا (114)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPhaseFilter(tab.id as typeof phaseFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                phaseFilter === tab.id
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Audio Bar if a Surah is selected */}
      {playingSurahId && (
        <div className="sticky top-14 md:top-4 z-20 rounded-2xl bg-[#141418]/95 backdrop-blur border border-emerald-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Volume2 className="w-4 h-4" />
            <span>
              تشغيل سورة {ordered.find((x) => x.id === playingSurahId)?.name} بصوت القارئ المختار
            </span>
          </div>
          <audio
            key={`${state.settings.reciter}-${playingSurahId}`}
            controls
            autoPlay
            className="h-9 flex-1 max-w-md"
            src={getReciterAudioUrl(state.settings.reciter, playingSurahId)}
          />
          <button
            onClick={() => setPlayingSurahId(null)}
            className="text-xs text-zinc-400 hover:text-white px-2"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Surah Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const prog = state.quran[s.id];
          const mem = prog?.memorizedAyahs || 0;
          const pct = Math.round((mem / s.ayahs) * 100);
          const done = mem >= s.ayahs;

          return (
            <div
              key={s.id}
              className={`rounded-2xl bg-[#111114] border p-4 flex flex-col justify-between gap-4 transition ${
                done
                  ? "border-emerald-500/40 bg-emerald-950/10"
                  : mem > 0
                  ? "border-zinc-700"
                  : "border-zinc-800/80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-400">
                      {s.id}
                    </span>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-1.5">
                        سورة {s.name}
                        {done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        الجزء {s.juz} • ص {s.startPage} • {s.ayahs} آية
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{pct}%</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden mt-3">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {prog?.nextReview && (
                  <p className="text-[11px] text-zinc-500 mt-2 font-mono">
                    المراجعة القادمة: {prog.nextReview} (كل {prog.intervalDays} يوم)
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-zinc-800/70">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSurahAyahs(s.id, mem - 5, s.ayahs)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
                      title="نقص 5 آيات"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs px-2 text-zinc-200">
                      {mem} / {s.ayahs}
                    </span>
                    <button
                      onClick={() => updateSurahAyahs(s.id, mem + 5, s.ayahs)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300"
                      title="زيادة 5 آيات"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => updateSurahAyahs(s.id, done ? 0 : s.ayahs, s.ayahs)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold"
                  >
                    {done ? "تصفير" : "تمت كاملة"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setPlayingSurahId(s.id)}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    استماع
                  </button>
                  <a
                    href={`https://quran.com/${s.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    المصحف
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                  {mem > 0 && (
                    <button
                      onClick={() => reviewSurah(s.id, "good")}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[11px] font-bold"
                    >
                      تمت المراجعة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
