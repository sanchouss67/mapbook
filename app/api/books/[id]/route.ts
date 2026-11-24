import { readFile } from "node:fs/promises";
import path from "node:path";

const bookIdPattern = /^[a-z0-9-]+$/;
const booksRoot = path.join(process.cwd(), "data", "books");

async function readBookFile(id: string) {
  // Собственные маршруты лежат в data/books, импортированные — в data/books/readtheplaces.
  const candidates = [
    path.join(booksRoot, `${id}.json`),
    path.join(booksRoot, "readtheplaces", `${id}.json`)
  ];

  for (const filePath of candidates) {
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!bookIdPattern.test(id)) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  const book = await readBookFile(id);

  if (!book) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  return Response.json(book, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
