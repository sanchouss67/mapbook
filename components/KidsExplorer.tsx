"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import KidsPlacePanel from "@/components/KidsPlacePanel";
import Passport from "@/components/Passport";
import { usePassport } from "@/hooks/usePassport";
import { distanceKm, formatKm, scaleHint } from "@/lib/geo";
import { applyKidsOverlay, getKidsQuest } from "@/lib/kids";
import { getTravelMode } from "@/lib/transport";
import type { BookRoute, PlaceCertainty, RoutePoint } from "@/types/book";
import type { KidsBook } from "@/types/kids";

const JourneyMap = dynamic(() => import("@/components/JourneyMap"), {
  ssr: false,
  loading: () => <div className="mapLoading">Карта загружается…</div>
});

const certaintyColors: Record<PlaceCertainty, string> = {
  exact: "#1d7a4f",
  approximate: "#b45309",
  fictional: "#7c3aed"
};

const legend: Array<{ certainty: PlaceCertainty; label: string }> = [
  { certainty: "exact", label: "Тут правда были" },
  { certainty: "approximate", label: "Примерно тут" },
  { certainty: "fictional", label: "Выдуманное место" }
];

type KidsExplorerProps = {
  books: KidsBook[];
  atlasInitialBook: BookRoute;
};

async function loadBookRoute(meta: KidsBook, atlasInitialBook: BookRoute): Promise<BookRoute> {
  if (meta.route) {
    return {
      id: meta.id,
      title: meta.title,
      author: meta.author,
      year: meta.year,
      description: meta.description,
      route: meta.route
    };
  }

  if (meta.id === atlasInitialBook.id) return atlasInitialBook;

  const response = await fetch(`/api/books/${encodeURIComponent(meta.id)}`);

  if (!response.ok) throw new Error("Book route is unavailable");

  return (await response.json()) as BookRoute;
}

export default function KidsExplorer({ books, atlasInitialBook }: KidsExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const passport = usePassport();

  const activeBook = books.find((book) => book.id === activeId) ?? null;
  const selectedPoint = route.find((point) => point.order === selectedOrder) ?? route[0];
  const selectedIndex = route.findIndex((point) => point.order === selectedPoint?.order);
  const stampedCount = activeBook ? passport.countFor(activeBook.id) : 0;

  const travel = useMemo(() => {
    if (!selectedPoint || selectedIndex <= 0) return null;

    return getTravelMode(selectedPoint, route[selectedIndex - 1]);
  }, [selectedPoint, selectedIndex, route]);

  useEffect(() => {
    if (!isPlaying || route.length === 0) return;

    const index = route.findIndex((point) => point.order === selectedOrder);

    const timer = window.setTimeout(() => {
      if (index < 0 || index >= route.length - 1) {
        setIsPlaying(false);
        return;
      }

      setSelectedOrder(route[index + 1].order);
    }, 4800);

    return () => window.clearTimeout(timer);
  }, [isPlaying, selectedOrder, route]);

  const distance = useMemo(() => {
    if (!selectedPoint || selectedIndex <= 0) return null;

    const previous = route[selectedIndex - 1];
    const km = distanceKm(previous, selectedPoint);

    return { km: formatKm(km), hint: scaleHint(km) };
  }, [route, selectedIndex, selectedPoint]);

  const openBook = async (meta: KidsBook) => {
    setIsPlaying(false);
    setActiveId(meta.id);
    setRoute([]);
    setSelectedOrder(0);
    setStatus("loading");

    try {
      const base = await loadBookRoute(meta, atlasInitialBook);
      const localized = applyKidsOverlay(base, meta);

      setRoute(localized);
      setSelectedOrder(localized[0]?.order ?? 0);
      setStatus("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  };

  const closeBook = () => {
    setIsPlaying(false);
    setActiveId(null);
    setRoute([]);
    setStatus("idle");
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (route.length === 0) return;

    if (selectedOrder === route[route.length - 1].order) {
      setSelectedOrder(route[0].order);
    }

    setIsPlaying(true);
  };

  const selectPoint = (order: number) => {
    setIsPlaying(false);
    setSelectedOrder(order);
  };

  if (!activeBook) {
    return (
      <section className="kids" aria-label="Детский режим">
        <div className="kidsIntro">
          <p className="eyebrow">Детский режим</p>
          <h2>Выбери путешествие</h2>
          <p>
            Каждая точка — место из книги. Отвечай на вопросы или просто ставь штамп: паспорт
            сохранится в этом браузере.
          </p>
        </div>

        <div className="kidGrid">
          {books.map((book) => {
            const count = passport.countFor(book.id);
            const percent = Math.round((count / book.points.length) * 100);

            return (
              <button
                key={book.id}
                type="button"
                className="kidBookCard"
                onClick={() => openBook(book)}
              >
                <span className="kidBookTop">
                  <span className="kidBookEmoji" aria-hidden="true">
                    {book.emoji}
                  </span>
                  <span className="kidBookAge">
                    {book.ageFrom}–{book.ageTo} лет
                  </span>
                </span>
                <strong className="kidBookTitle">{book.title}</strong>
                <span className="kidBookAuthor">{book.author}</span>
                <span className="kidBookTagline">{book.tagline}</span>
                <span className="kidBookMeta">
                  {book.points.length} точек · ≈ {book.minutes} мин
                </span>
                <span className="kidBookTrack" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <span className="kidBookCount">
                  {count > 0 ? `${count} из ${book.points.length} штампов` : "Начать маршрут"}
                </span>
              </button>
            );
          })}
        </div>

        <Passport
          books={books}
          isReady={passport.isReady}
          countFor={passport.countFor}
          hasStamp={passport.hasStamp}
          totalCount={passport.totalCount}
          onReset={passport.resetPassport}
        />
      </section>
    );
  }

  const percent = route.length > 0 ? Math.round((stampedCount / route.length) * 100) : 0;

  return (
    <section className="kids" aria-label="Детский режим">
      <div className="kidsTopbar">
        <button type="button" className="kidsBack" onClick={closeBook}>
          ← Все маршруты
        </button>

        <div className="kidsTopbarTitle">
          <p className="eyebrow">{activeBook.author}</p>
          <h2>{activeBook.title}</h2>
          <p className="kidsTagline">{activeBook.tagline}</p>
        </div>

        <div className="kidsTopbarSide">
          <div className="kidsProgress">
            <span>
              {stampedCount} из {route.length || activeBook.points.length} штампов
            </span>
            <span className="kidsProgressBar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </span>
          </div>
          <button
            type="button"
            className={isPlaying ? "kidsPlay playing" : "kidsPlay"}
            onClick={togglePlay}
            aria-pressed={isPlaying}
            disabled={route.length === 0}
          >
            {isPlaying ? "⏸ Пауза" : "▶ В путь"}
          </button>
        </div>
      </div>

      {status === "loading" ? <p className="bookStatus">Загружаю маршрут…</p> : null}
      {status === "error" ? (
        <p className="bookStatus error">Не получилось загрузить маршрут. Попробуйте ещё раз.</p>
      ) : null}

      {status === "idle" && route.length > 0 && selectedPoint ? (
        <div className="kidsJourney">
          <ol className="kidsTimeline" aria-label="Точки маршрута">
            {route.map((point) => {
              const isStamped = passport.hasStamp(activeBook.id, point.order);
              const isSelected = point.order === selectedPoint.order;

              return (
                <li key={`${point.order}-${point.place}`}>
                  <button
                    type="button"
                    className={[
                      "kidsTimelineItem",
                      isSelected ? "active" : "",
                      isStamped ? "stamped" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selectPoint(point.order)}
                    aria-current={isSelected ? "step" : undefined}
                  >
                    <span className="kidsTimelineNumber">{isStamped ? "✓" : point.order}</span>
                    <span className="kidsTimelineName">{point.displayName}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="kidsMapWrap">
            <JourneyMap
              route={route}
              selectedPoint={selectedPoint}
              onSelectPoint={(point) => selectPoint(point.order)}
              markerColor={(point) => certaintyColors[point.certainty]}
              autoZoom={false}
              fitMaxZoom={13}
            />
            <ul className="kidsLegend" aria-label="Обозначения на карте">
              {legend.map((item) => (
                <li key={item.certainty}>
                  <span
                    className="kidsLegendDot"
                    style={{ background: certaintyColors[item.certainty] }}
                    aria-hidden="true"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <KidsPlacePanel
            point={selectedPoint}
            total={route.length}
            quest={getKidsQuest(activeBook, selectedPoint.order)}
            distance={distance}
            travel={travel}
            isStamped={passport.hasStamp(activeBook.id, selectedPoint.order)}
            onStamp={() => passport.addStamp(activeBook.id, selectedPoint.order)}
          />
        </div>
      ) : null}
    </section>
  );
}
