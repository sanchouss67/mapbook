import HomeTabs from "@/components/HomeTabs";
import aroundTheWorld from "@/data/books/around-the-world-in-80-days.json";
import importedCatalog from "@/data/books/readtheplaces/catalog.json";
import kidsCollection from "@/data/kids/collection.json";
import type { BookRoute, BookSummary } from "@/types/book";
import type { KidsBook } from "@/types/kids";

const initialBook = aroundTheWorld as BookRoute;
const books: BookSummary[] = [
  {
    id: initialBook.id,
    title: initialBook.title,
    author: initialBook.author,
    year: initialBook.year,
    description: initialBook.description,
    pointCount: initialBook.route.length
  },
  ...(importedCatalog as BookSummary[])
];

const kidsBooks = kidsCollection as unknown as KidsBook[];

export default function Home() {
  return <HomeTabs books={books} initialBook={initialBook} kidsBooks={kidsBooks} />;
}
