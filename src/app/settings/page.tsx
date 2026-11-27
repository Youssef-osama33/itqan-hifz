"use client";

import React, { useState } from "react";
import { Save, Download, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { ALL_SURAHS } from "@/data/quran";
import { ALL_MUTOON } from "@/data/mutoon";
import { RECITERS } from "@/lib/srs";
import { ReciterId } from "@/types";

export default function SettingsPage() {
  const { state, isHydrated, updateSettings, exportJson, importJson, resetAll } = useHifz();
  const [savedMsg, setSavedMsg] = useState("");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");

  if (!isHydrated) return <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse" />;

  const flashSaved = () => {
    setSavedMsg("تم حفظ الإعدادات بنجاح");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itqan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importJson(importText);
    setImportStatus(ok ? "تم استرجاع النسخة الاحتياطية بنجاح." : "ملف JSON غير صالح.");
    if (ok) setImportText("");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">الإعدادات والنسخ الاحتياطي</h1>
        <p className="text-sm text-zinc-400 mt-1">
          خصّص ميزانيتك اليومية، نقطة بداية الحفظ، القارئ المعتمد، وروابط التطبيقات الخارجية.
        </p>
      </div>

      {/* Core Preferences */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              الميزانية اليومية الصافية (دقيقة)
            </label>
            <input
              type="number"
              min={15}
              max={360}
              step={5}
              value={state.settings.dailyMinutes}
              onChange={(e) => {
                updateSettings({ dailyMinutes: Math.max(15, Number(e.target.value) || 30) });
                flashSaved();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              سورة البداية في المسار
            </label>
            <select
              value={state.settings.startSurahId}
              onChange={(e) => {
                updateSettings({ startSurahId: Number(e.target.value) });
                flashSaved();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {ALL_SURAHS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. سورة {s.name} (الجزء {s.juz})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Single Reciter Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            القارئ المعتمد (اثبت على شيخ واحد فقط أثناء الحفظ)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(RECITERS) as ReciterId[]).map((id) => {
              const r = RECITERS[id];
              const selected = state.settings.reciter === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    updateSettings({ reciter: id });
                    flashSaved();
                  }}
                  className={`text-right p-3.5 rounded-xl border transition ${
                    selected
                      ? "bg-emerald-500/15 border-emerald-500/40 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{r.name}</span>
                    {r.recommended && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        موصى به
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{r.style}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Matn */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            المتن النشط على الصفحة الرئيسية
          </label>
          <select
            value={state.settings.activeMatnId}
            onChange={(e) => {
              updateSettings({ activeMatnId: e.target.value });
              flashSaved();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {ALL_MUTOON.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.levelLabel}] {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* External Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              رابط تطبيق / موقع ترتيل
            </label>
            <input
              type="url"
              dir="ltr"
              value={state.settings.tarteelUrl}
              onChange={(e) => updateSettings({ tarteelUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              رابط لوحة شرح المتون
            </label>
            <input
              type="url"
              dir="ltr"
              value={state.settings.sharhDashboardUrl}
              onChange={(e) => updateSettings({ sharhDashboardUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {savedMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {savedMsg}
          </div>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="rounded-2xl bg-[#111114] border border-zinc-800 p-5 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Save className="w-4 h-4 text-blue-400" />
          النسخ الاحتياطي ونقل البيانات (JSON)
        </h2>
        <p className="text-xs text-zinc-400">
          بياناتك محفوظة محلياً في المتصفح. نزّل نسخة احتياطية أسبوعياً أو انقلها بين اللابتوب والموبايل.
        </p>

        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          تحميل نسخة احتياطية JSON
        </button>

        <div className="space-y-2 pt-2">
          <textarea
            rows={4}
            dir="ltr"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='الصق محتوى ملف النسخة الاحتياطية JSON هنا للاسترجاع...'
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            استرجاع البيانات
          </button>
          {importStatus && <p className="text-xs text-amber-400">{importStatus}</p>}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">مسح كل السجلات والبدء من الصفر</span>
          <button
            onClick={() => {
              if (window.confirm("هل أنت متأكد من مسح كل سجلات الحفظ والإعدادات؟")) {
                resetAll();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            تصفير بالكامل
          </button>
        </div>
      </div>
    </div>
  );
}
