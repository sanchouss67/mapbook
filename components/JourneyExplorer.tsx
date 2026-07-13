"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import BookSelector from "@/components/BookSelector";
import PlaceCard from "@/components/PlaceCard";
import RouteTimeline from "@/components/RouteTimeline";
import type { BookRoute, RoutePoint } from "@/types/book";

const JourneyMap = dynamic(() => import("@/components/JourneyMap"), {
  ssr: false,
  loading: () => <div className="mapLoading">Карта загружается...</div>
});

type JourneyExplorerProps = {
  books: BookRoute[];
};

export default function JourneyExplorer({ books }: JourneyExplorerProps) {
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id ?? "");
  const selectedBook = books.find((book) => book.id === selectedBookId) ?? books[0];

  const orderedRoute = useMemo(
    () => [...selectedBook.route].sort((first, second) => first.order - second.order),
    [selectedBook]
  );

  const [selectedPoint, setSelectedPoint] = useState<RoutePoint>(orderedRoute[0]);

  const selectBook = (bookId: string) => {
    const nextBook = books.find((book) => book.id === bookId);
    if (!nextBook) {
      return;
    }

    const firstPoint = [...nextBook.route].sort((first, second) => first.order - second.order)[0];
    setSelectedBookId(bookId);
    setSelectedPoint(firstPoint);
  };

  const selectPoint = (point: RoutePoint) => {
    setSelectedPoint(point);
  };

  return (
    <main className="pageShell">
      <header className="hero">
        <p className="eyebrow">Литературный атлас приключений</p>
        <h1>Карта книжных путешествий</h1>
        <p className="intro">
          Выбирайте книгу, следуйте за героями по карте и открывайте места, где история
          превращается в настоящее путешествие.
        </p>
      </header>

      <BookSelector books={books} selectedBookId={selectedBook.id} onSelectBook={selectBook} />

      <section className="bookSummary" aria-label="Описание выбранной книги">
        <div>
          <p className="eyebrow">Маршрут</p>
          <h2>
            {selectedBook.author} — «{selectedBook.title}»
          </h2>
        </div>
        <p>{selectedBook.description}</p>
      </section>

      <section className="journeyLayout" aria-label="Карта и точки маршрута">
        <RouteTimeline route={orderedRoute} selectedPoint={selectedPoint} onSelectPoint={selectPoint} />
        <JourneyMap route={orderedRoute} selectedPoint={selectedPoint} onSelectPoint={selectPoint} />
        <PlaceCard point={selectedPoint} />
      </section>
    </main>
  );
}
