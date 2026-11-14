import type { BookSummary } from "@/types/book";

type BookSelectorProps = {
  books: BookSummary[];
  selectedBookId: string;
  onSelectBook: (bookId: string) => void;
};

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  return (
    <section className="bookSelector" aria-label="Выбор книги">
      <label htmlFor="book-select">Книга</label>
      <select
        id="book-select"
        value={selectedBookId}
        onChange={(event) => onSelectBook(event.target.value)}
      >
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.author} — {book.title} ({book.pointCount})
          </option>
        ))}
      </select>
    </section>
  );
}
