import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Productivity Dashboard",
  description: "Tasks, habits, focus sessions and notes in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:py-10">
          <aside className="md:w-48 md:shrink-0">
            <div className="mb-4 flex items-center gap-2 px-3 font-semibold">
              <span className="inline-block h-3 w-3 rounded-sm bg-indigo-600" /> Dashboard
            </div>
            <Nav />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
