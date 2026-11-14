import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(projectRoot, "readtheplaces-source", "books");
const outputRoot = path.join(projectRoot, "data", "books", "readtheplaces");

const certaintyMap = {
  explicit: "exact",
  inferred: "approximate",
  inspired_by: "approximate",
  disputed: "approximate"
};

const source = {
  name: "Read the Places",
  url: "https://readtheplaces.com/",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
};

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const entries = await readdir(sourceRoot, { withFileTypes: true });
const catalog = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const directory = path.join(sourceRoot, entry.name);
  const book = JSON.parse(await readFile(path.join(directory, "book.json"), "utf8"));
  const waypoints = JSON.parse(await readFile(path.join(directory, "waypoints.json"), "utf8"));
  const description = book.setting?.note || "Маршрут по книге «" + book.title + "».";

  const route = waypoints
    .sort((first, second) => first.order - second.order)
    .map((waypoint, index) => ({
      order: waypoint.order ?? index + 1,
      place: waypoint.id,
      displayName: waypoint.name,
      country: book.setting?.country,
      lat: waypoint.coords[1],
      lng: waypoint.coords[0],
      reference: waypoint.reference || waypoint.progressLabel,
      certainty: certaintyMap[waypoint.placeCertainty] || "approximate",
      summary: waypoint.note,
      note: waypoint.certaintyNote,
      sourceUrl: waypoint.sources?.[0]?.url
    }));

  const converted = {
    id: book.id,
    title: book.title,
    author: book.author,
    year: book.published,
    description,
    route,
    source
  };

  catalog.push({
    id: converted.id,
    title: converted.title,
    author: converted.author,
    year: converted.year,
    description: converted.description,
    pointCount: route.length,
    source
  });

  await writeFile(
    path.join(outputRoot, entry.name + ".json"),
    JSON.stringify(converted, null, 2) + "\n"
  );
}

catalog.sort(
  (first, second) =>
    first.author.localeCompare(second.author, "en") ||
    first.title.localeCompare(second.title, "en")
);

await writeFile(
  path.join(outputRoot, "catalog.json"),
  JSON.stringify(catalog, null, 2) + "\n"
);

console.log("Imported " + catalog.length + " books from Read the Places.");
