import { readFile } from "node:fs/promises";
import path from "node:path";
import catalog from "@/data/books/readtheplaces/catalog.json";

const knownBookIds = new Set(catalog.map((book) => book.id));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!knownBookIds.has(id)) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "data",
    "books",
    "readtheplaces",
    id + ".json"
  );
  const book = JSON.parse(await readFile(filePath, "utf8"));

  return Response.json(book, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
