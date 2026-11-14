"use client";

import { useMemo, useState, type FocusEvent } from "react";
import type { BookSummary } from "@/types/book";

type BookSelectorProps = {
  books: BookSummary[];
  selectedBookId: string;
  onSelectBook: (bookId: string) => void;
};

const collator = new Intl.Collator("ru", { sensitivity: "base", numeric: true });

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sortedBooks = useMemo(
    () => [...books].sort((first, second) => collator.compare(first.title, second.title)),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sortedBooks;

    return sortedBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery)
    );
  }, [sortedBooks, query]);

  const handleSelect = (bookId: string) => {
    setIsOpen(false);
    setQuery("");
    onSelectBook(bookId);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  };

  return (
    <section className="bookSelector" aria-label="Поиск и выбор книги">
      <div className="bookSearch">
        <label htmlFor="book-search">Книга</label>
        <div className="bookSearchField" onBlur={handleBlur}>
          <input
            id="book-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
            }}
            placeholder="Поиск по названию или автору…"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="book-list"
            aria-autocomplete="list"
          />

          {isOpen ? (
            <ul id="book-list" className="bookList" role="listbox" aria-label="Список книг">
              {filteredBooks.map((book) => {
                const isSelected = book.id === selectedBookId;

                return (
                  <li key={book.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={isSelected ? "bookItem active" : "bookItem"}
                      onClick={() => handleSelect(book.id)}
                    >
                      <span className="bookItemTitle">{book.title}</span>
                      <span className="bookItemMeta">
                        {book.author}
                        {book.year ? ` · ${book.year}` : ""} · {book.pointCount}{" "}
                        {book.pointCount === 1 ? "точка" : "точек"}
                      </span>
                    </button>
                  </li>
                );
              })}

              {filteredBooks.length === 0 ? (
                <li className="bookListEmpty">Ничего не найдено</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
