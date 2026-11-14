import JourneyExplorer from "@/components/JourneyExplorer";
import aroundTheWorld from "@/data/books/around-the-world-in-80-days.json";
import importedCatalog from "@/data/books/readtheplaces/catalog.json";
import type { BookRoute, BookSummary } from "@/types/book";

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

export default function Home() {
  return <JourneyExplorer books={books} initialBook={initialBook} />;
}
