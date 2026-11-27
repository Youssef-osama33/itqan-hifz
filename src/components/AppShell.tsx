"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ScrollText,
  BarChart3,
  Settings,
  ExternalLink,
  Flame,
  Mic,
} from "lucide-react";
import { useHifz } from "@/context/HifzContext";
import { computeStats } from "@/lib/srs";

const NAV_ITEMS = [
  { href: "/", label: "لوحة اليوم", icon: LayoutDashboard },
  { href: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { href: "/mutoon", label: "متون طالب العلم", icon: ScrollText },
  { href: "/stats", label: "الإحصائيات", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, isHydrated } = useHifz();
  const stats = computeStats(state);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (RTL Right) */}
      <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-l border-zinc-800/80 bg-[#0D0D10] p-5 sticky top-0 h-screen justify-between">
        <div>
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-zinc-800/80">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                إتقان
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">هندسة حفظ القرآن والمتون</p>
            </div>
            {isHydrated && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                <Flame className="w-3.5 h-3.5" />
                {stats.streak}
              </div>
            )}
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/90 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* External Quick Integrations */}
        <div className="space-y-2 pt-5 border-t border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-500 px-1">روابط التسميع والشرح</p>
          <a
            href={state.settings.tarteelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition"
          >
            <span className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              تسميع على ترتيل
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
          <a
            href={state.settings.sharhDashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition"
          >
            <span className="flex items-center gap-2">
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              منصة شرح المتون
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0D0D10]/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-bold text-lg text-white">إتقان</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={state.settings.tarteelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1"
          >
            <Mic className="w-3 h-3" />
            ترتيل
          </a>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-xs font-mono font-bold">
            <Flame className="w-3 h-3" />
            {isHydrated ? stats.streak : 0}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0D0D10]/95 backdrop-blur border-t border-zinc-800 px-2 py-1.5 grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium transition ${
                active ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
