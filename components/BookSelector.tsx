import type { BookRoute } from "@/types/book";

type BookSelectorProps = {
  books: BookRoute[];
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
            {book.author} — {book.title}
          </option>
        ))}
      </select>
    </section>
  );
}
