"use client";

import { useState } from "react";
import JourneyExplorer from "@/components/JourneyExplorer";
import KidsExplorer from "@/components/KidsExplorer";
import type { BookRoute, BookSummary } from "@/types/book";
import type { KidsBook } from "@/types/kids";

type HomeTabsProps = {
  books: BookSummary[];
  initialBook: BookRoute;
  kidsBooks: KidsBook[];
};

export default function HomeTabs({ books, initialBook, kidsBooks }: HomeTabsProps) {
  const [mode, setMode] = useState<"atlas" | "kids">("atlas");

  return (
    <main className={mode === "kids" ? "pageShell kidsShell" : "pageShell"}>
      <header className="hero">
        <p className="eyebrow">Литературный атлас приключений</p>
        <h1>Карта книжных путешествий</h1>
        <p className="intro">
          Выбирайте книгу, следуйте за героями по карте и открывайте места, где история
          превращается в настоящее путешествие.
        </p>
      </header>

      <nav className="modeTabs" aria-label="Режим просмотра">
        <button
          type="button"
          className={mode === "atlas" ? "modeTab active" : "modeTab"}
          aria-pressed={mode === "atlas"}
          onClick={() => setMode("atlas")}
        >
          Атлас книг
        </button>
        <button
          type="button"
          className={mode === "kids" ? "modeTab active" : "modeTab"}
          aria-pressed={mode === "kids"}
          onClick={() => setMode("kids")}
        >
          Детям
        </button>
      </nav>

      {mode === "atlas" ? (
        <JourneyExplorer books={books} initialBook={initialBook} />
      ) : (
        <KidsExplorer books={kidsBooks} atlasInitialBook={initialBook} />
      )}
    </main>
  );
}
