"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Volume2, CheckCircle2, ExternalLink } from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { getReciterAudioUrl, RECITERS } from "@/lib/srs";
import { SurahData } from "@/types";

interface FocusTimerProps {
  activeSurah: SurahData;
}

export default function FocusTimer({ activeSurah }: FocusTimerProps) {
  const { state, logSessionMinutes } = useHifz();
  const totalBudget = state.settings.dailyMinutes;

  // Split user's daily budget into the 4 scientific stages (17% / 40% / 27% / 16%)
  const stages = [
    {
      name: "استماع وتصحيح التلاوة",
      hint: `اسمع سورة ${activeSurah.name} بصوت ${RECITERS[state.settings.reciter].name}`,
      seconds: Math.max(60, Math.round(totalBudget * 0.17) * 60),
    },
    {
      name: "الحفظ الجديد والربط",
      hint: "كرر كل سطر 5 مرات نظراً و5 غيباً ثم اربط الأسطر",
      seconds: Math.max(120, Math.round(totalBudget * 0.4) * 60),
    },
    {
      name: "مراجعة القريب (آخر 3 صفحات)",
      hint: "سمّع غيباً على ترتيل لتحويل الحفظ للذاكرة الدائمة",
      seconds: Math.max(60, Math.round(totalBudget * 0.27) * 60),
    },
    {
      name: "التثبيت البعيد / ورد المتن",
      hint: "راجع أقدم سورة أو أبيات المتن المستحقة اليوم",
      seconds: Math.max(60, Math.round(totalBudget * 0.16) * 60),
    },
  ];

  const [stageIdx, setStageIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(stages[0].seconds);
  const [running, setRunning] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioError(false);
  }, [activeSurah.id, state.settings.reciter]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const minsDone = Math.round(stages[stageIdx].seconds / 60);
          logSessionMinutes(minsDone);
          setCompletedMinutes((m) => m + minsDone);
          if (stageIdx < stages.length - 1) {
            const next = stageIdx + 1;
            setStageIdx(next);
            return stages[next].seconds;
          } else {
            setRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, stageIdx]);

  const selectStage = (idx: number) => {
    setRunning(false);
    setStageIdx(idx);
    setSecondsLeft(stages[idx].seconds);
  };

  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(stages[stageIdx].seconds);
  };

  const finishEarlyAndLog = () => {
    const elapsed = Math.max(1, Math.round((stages[stageIdx].seconds - secondsLeft) / 60));
    logSessionMinutes(elapsed);
    setCompletedMinutes((m) => m + elapsed);
    if (stageIdx < stages.length - 1) {
      selectStage(stageIdx + 1);
    } else {
      setRunning(false);
    }
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const audioUrl = getReciterAudioUrl(state.settings.reciter, activeSurah.id);

  return (
    <div className="rounded-2xl bg-[#111114] border border-zinc-800/90 p-5 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
              بروتوكول الـ {totalBudget} دقيقة اليومي
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{stages[stageIdx].name}</h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
            مرحلة {stageIdx + 1} / {stages.length}
          </span>
        </div>

        {/* Stage Pills */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {stages.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => selectStage(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx < stageIdx
                  ? "bg-emerald-500"
                  : idx === stageIdx
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
              title={s.name}
            />
          ))}
        </div>

        {/* Big Timer Display */}
        <div className="bg-[#09090B] border border-zinc-800/80 rounded-xl p-5 text-center">
          <div className="font-mono text-5xl font-bold tracking-wider text-white">
            {mins}:{secs}
          </div>
          <p className="text-xs text-zinc-400 mt-2">{stages[stageIdx].hint}</p>

          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => setRunning((r) => !r)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center gap-2 transition"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "إيقاف مؤقت" : "ابدأ المرحلة"}
            </button>
            <button
              onClick={finishEarlyAndLog}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
              title="تسجيل الوقت والانتقال للتالي"
            >
              <SkipForward className="w-4 h-4 text-emerald-400" />
              التالي
            </button>
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Reciter Player */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>
              سورة {activeSurah.name} — {RECITERS[state.settings.reciter].name}
            </span>
          </div>
          <a
            href={`https://quran.com/${activeSurah.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1"
          >
            المصحف
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {!audioError ? (
          <audio
            ref={audioRef}
            key={audioUrl}
            controls
            preload="none"
            onError={() => setAudioError(true)}
            className="w-full h-9 opacity-90"
            src={audioUrl}
          />
        ) : (
          <div className="flex items-center justify-between text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <span>تعذر تحميل البث المباشر حالياً</span>
            <a
              href={`https://quran.com/${activeSurah.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold"
            >
              استمع عبر Quran.com
            </a>
          </div>
        )}

        {completedMinutes > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم تسجيل {completedMinutes} دقيقة في سجل اليوم بنجاح.
          </div>
        )}
      </div>
    </div>
  );
}
