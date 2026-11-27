import type { Metadata } from "next";
import "./globals.css";
import { HifzProvider } from "@/context/HifzContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "إتقان | نظام هندسة حفظ القرآن الكريم ومتون طالب العلم",
  description:
    "لوحة تحكم ذكية لحفظ القرآن الكريم بدءاً من سورة ق وسلسلة متون طالب العلم مع التكرار المتباعد ومؤقت التركيز والربط مع ترتيل ومنصة الشروح.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <HifzProvider>
          <AppShell>{children}</AppShell>
        </HifzProvider>
      </body>
    </html>
  );
}
