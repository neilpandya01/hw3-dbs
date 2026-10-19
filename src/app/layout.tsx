import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Nav, NavFrame } from "@/components/Nav";
import { StorageBanner } from "@/components/StorageBanner";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dayplan",
  description: "A day-by-day to-do list that remembers you on this device.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <ToastProvider>
          <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-xl flex-col px-4 pt-3">
              <Link href="/" className="self-start text-base font-semibold tracking-tight text-ink">
                Dayplan
              </Link>
              {/* Nav reads the URL, so it needs its own Suspense boundary under Cache Components. */}
              <Suspense fallback={<NavFrame />}>
                <Nav />
              </Suspense>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-6 pb-24">
            <StorageBanner />
            {children}
          </main>
          <footer className="mx-auto w-full max-w-xl px-4 pb-6 text-center text-sm text-muted">
            Saved on this device
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
