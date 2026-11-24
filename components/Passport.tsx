"use client";

import type { KidsBook } from "@/types/kids";

type PassportProps = {
  books: KidsBook[];
  isReady: boolean;
  countFor: (bookId: string) => number;
  hasStamp: (bookId: string, order: number) => boolean;
  totalCount: () => number;
  onReset: () => void;
};

export default function Passport({
  books,
  isReady,
  countFor,
  hasStamp,
  totalCount,
  onReset
}: PassportProps) {
  const total = books.reduce((sum, book) => sum + book.points.length, 0);
  const done = totalCount();

  const reset = () => {
    if (window.confirm("Сбросить все штампы? Это нельзя отменить.")) onReset();
  };

  return (
    <section className="passport" aria-label="Паспорт путешественника">
      <div className="passportHeader">
        <div>
          <p className="eyebrow">Паспорт путешественника</p>
          <h2>
            {done} из {total} штампов
          </h2>
        </div>
        {done > 0 ? (
          <button type="button" className="passportReset" onClick={reset}>
            Сбросить
          </button>
        ) : null}
      </div>

      <ul className="passportList">
        {books.map((book) => {
          const count = countFor(book.id);

          return (
            <li key={book.id} className="passportRow">
              <span className="passportEmoji" aria-hidden="true">
                {book.emoji}
              </span>
              <span className="passportTitle">{book.title}</span>
              <span className="passportDots" aria-hidden="true">
                {book.points.map((point) => (
                  <span
                    key={point.order}
                    className={hasStamp(book.id, point.order) ? "passportDot filled" : "passportDot"}
                  />
                ))}
              </span>
              <span className="passportCount">
                {count}/{book.points.length}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="passportHint">
        {isReady
          ? "Штампы хранятся только в этом браузере — без регистрации и без отправки данных."
          : "Открываю паспорт…"}
      </p>
    </section>
  );
}
