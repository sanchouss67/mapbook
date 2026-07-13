import JourneyExplorer from "@/components/JourneyExplorer";
import aroundTheWorld from "@/data/books/around-the-world-in-80-days.json";
import type { BookRoute } from "@/types/book";

const books: BookRoute[] = [aroundTheWorld as BookRoute];

export default function Home() {
  return <JourneyExplorer books={books} />;
}
