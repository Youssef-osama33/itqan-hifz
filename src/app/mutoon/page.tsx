"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  BookMarked,
  Headphones,
  CheckCircle2,
  Plus,
  Minus,
  Pin,
} from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { ALL_MUTOON, MUTOON_LEVELS, QASIM_MUTOON_URL } from "@/data/mutoon";
import { MatnLevel } from "@/types";

export default function MutoonPage() {
  const {
    state,
    isHydrated,
    updateMatnUnits,
    updateMatnSharh,
    reviewMatn,
    updateSettings,
  } = useHifz();
  const [selectedLevel, setSelectedLevel] = useState<MatnLevel | "all">("all");

  if (!isHydrated) return <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse" />;

  const filtered =
    selectedLevel === "all"
      ? ALL_MUTOON
      : ALL_MUTOON.filter((m) => m.level === selectedLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            سلسلة متون طالب العلم
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            كل المستويات (1 إلى 6 + الجامع للصحيحين + الإضافية) مع تتبع مزدوج للحفظ وسماع الشرح.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={state.settings.sharhDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition"
          >
            <Headphones className="w-4 h-4" />
            منصة شرح المتون
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={QASIM_MUTOON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center gap-2 transition"
          >
            <BookMarked className="w-4 h-4 text-emerald-400" />
            ملفات المتون PDF
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedLevel("all")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
            selectedLevel === "all"
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          الكل ({ALL_MUTOON.length})
        </button>
        {MUTOON_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setSelectedLevel(lvl.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              selectedLevel === lvl.id
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {lvl.short}
          </button>
        ))}
      </div>

      {/* Mutoon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => {
          const prog = state.mutoon[m.id];
          const mem = prog?.memorizedUnits || 0;
          const sharh = prog?.completedSharhLessons || 0;
          const memPct = Math.round((mem / m.totalUnits) * 100);
          const sharhPct = Math.round((sharh / m.sharhLessons) * 100);
          const isPinned = state.settings.activeMatnId === m.id;
          const step = m.totalUnits >= 500 ? 10 : m.totalUnits >= 100 ? 5 : 2;

          return (
            <div
              key={m.id}
              className={`rounded-2xl bg-[#111114] border p-5 flex flex-col justify-between gap-4 ${
                isPinned
                  ? "border-amber-500/50 shadow-[0_0_24px_-12px_rgba(245,158,11,0.4)]"
                  : "border-zinc-800/90"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                        {m.levelLabel}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {m.science}
                      </span>
                      <span className="text-[10px] text-zinc-500">{m.recommendedPhase}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-2 flex items-center gap-1.5">
                      {m.title}
                      {mem >= m.totalUnits && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500">{m.author}</p>
                  </div>

                  <button
                    onClick={() => updateSettings({ activeMatnId: m.id })}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition ${
                      isPinned
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                    title="تثبيت كمتن نشط في الصفحة الرئيسية"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress 1: Memorization */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">
                        الحفظ ({mem} / {m.totalUnits} {m.unitLabel})
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{memPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${memPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress 2: Sharh Lessons */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-400">
                        سماع الشرح ({sharh} / {m.sharhLessons} درس)
                      </span>
                      <span className="font-mono text-blue-400">{sharhPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${sharhPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateMatnUnits(m.id, mem - step, m.totalUnits)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateMatnUnits(m.id, mem + step, m.totalUnits)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {step} {m.unitLabel}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateMatnSharh(m.id, sharh + 1, m.sharhLessons)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold"
                    >
                      +1 درس شرح
                    </button>
                    {mem > 0 && (
                      <button
                        onClick={() => reviewMatn(m.id, "good")}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold"
                      >
                        راجعته
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={m.sharhUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    فتح الشرح
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </a>
                  <a
                    href={m.bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    نسخة الحفظ
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
