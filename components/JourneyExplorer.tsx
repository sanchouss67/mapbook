"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import BookSelector from "@/components/BookSelector";
import PlaceCard from "@/components/PlaceCard";
import RouteTimeline from "@/components/RouteTimeline";
import type { BookRoute, BookSummary, RoutePoint } from "@/types/book";

const JourneyMap = dynamic(() => import("@/components/JourneyMap"), {
  ssr: false,
  loading: () => <div className="mapLoading">Карта загружается...</div>
});

type JourneyExplorerProps = {
  books: BookSummary[];
  initialBook: BookRoute;
};

export default function JourneyExplorer({ books, initialBook }: JourneyExplorerProps) {
  const [selectedBook, setSelectedBook] = useState<BookRoute>(initialBook);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [bookError, setBookError] = useState("");

  const orderedRoute = useMemo(
    () => [...selectedBook.route].sort((first, second) => first.order - second.order),
    [selectedBook]
  );

  const [selectedPoint, setSelectedPoint] = useState<RoutePoint>(orderedRoute[0]);

  const selectBook = async (bookId: string) => {
    if (bookId === selectedBook.id) return;

    setIsLoadingBook(true);
    setBookError("");

    try {
      const response = await fetch(`/api/books/` + encodeURIComponent(bookId));
      if (!response.ok) throw new Error("Маршрут не найден");

      const nextBook = (await response.json()) as BookRoute;
      const firstPoint = [...nextBook.route].sort((first, second) => first.order - second.order)[0];
      setSelectedBook(nextBook);
      setSelectedPoint(firstPoint);
    } catch {
      setBookError("Не удалось загрузить маршрут. Попробуйте ещё раз.");
    } finally {
      setIsLoadingBook(false);
    }
  };

  const selectPoint = (point: RoutePoint) => {
    setSelectedPoint(point);
  };

  return (
    <section className="atlas" aria-label="Атлас книжных маршрутов">
      <BookSelector books={books} selectedBookId={selectedBook.id} onSelectBook={selectBook} />
      {isLoadingBook ? <p className="bookStatus">Загружаю маршрут…</p> : null}
      {bookError ? <p className="bookStatus error">{bookError}</p> : null}

      <section className="bookSummary" aria-label="Описание выбранной книги">
        <div>
          <p className="eyebrow">Маршрут</p>
          <h2>
            {selectedBook.author} — «{selectedBook.title}»
          </h2>
        </div>
        <div className="bookDescription">
          <p>{selectedBook.description}</p>
          {selectedBook.source ? (
            <p className="sourceCredit">
              Маршрут:{" "}
              <a href={selectedBook.source.url} target="_blank" rel="noreferrer">
                {selectedBook.source.name}
              </a>{" "}
              ·{" "}
              <a href={selectedBook.source.licenseUrl} target="_blank" rel="noreferrer">
                {selectedBook.source.license}
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <section className="journeyLayout" aria-label="Карта и точки маршрута">
        <RouteTimeline route={orderedRoute} selectedPoint={selectedPoint} onSelectPoint={selectPoint} />
        <JourneyMap route={orderedRoute} selectedPoint={selectedPoint} onSelectPoint={selectPoint} />
        <PlaceCard point={selectedPoint} />
      </section>
    </section>
  );
}
