import type { RoutePoint } from "@/types/book";

export type TravelMode = {
  icon: string;
  label: string;
};

const MODES = {
  plane: { icon: "✈️", label: "на самолёте" },
  train: { icon: "🚂", label: "на поезде" },
  steamship: { icon: "🚢", label: "на пароходе" },
  ship: { icon: "🚢", label: "на корабле" },
  boat: { icon: "⛵", label: "на лодке" },
  ferry: { icon: "⛴️", label: "на пароме" },
  car: { icon: "🚗", label: "на машине" },
  bus: { icon: "🚌", label: "на автобусе" },
  bicycle: { icon: "🚲", label: "на велосипеде" },
  horse: { icon: "🐎", label: "верхом" },
  camel: { icon: "🐪", label: "на верблюде" },
  elephant: { icon: "🐘", label: "на слоне" },
  carriage: { icon: "🛞", label: "в экипаже" },
  walk: { icon: "🚶", label: "пешком" },
  dogsled: { icon: "🛷", label: "на собачьей упряжке" }
} as const;

type TravelModeKey = keyof typeof MODES;

const ALIASES: Record<string, TravelModeKey> = {
  plane: "plane",
  airplane: "plane",
  flight: "plane",
  air: "plane",
  fly: "plane",
  train: "train",
  railway: "train",
  rail: "train",
  steamship: "steamship",
  steamer: "steamship",
  ship: "ship",
  sea: "ship",
  sail: "ship",
  sailing: "ship",
  boat: "boat",
  raft: "boat",
  ferry: "ferry",
  car: "car",
  auto: "car",
  taxi: "car",
  bus: "bus",
  coach: "bus",
  bicycle: "bicycle",
  bike: "bicycle",
  horse: "horse",
  horseback: "horse",
  ride: "horse",
  camel: "camel",
  elephant: "elephant",
  carriage: "carriage",
  wagon: "carriage",
  cart: "carriage",
  walk: "walk",
  foot: "walk",
  hiking: "walk",
  hike: "walk",
  trek: "walk",
  dogsled: "dogsled",
  sled: "dogsled"
};

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function resolve(value: string | undefined): TravelMode | null {
  const key = normalize(value);

  if (!key || key === "start" || key === "finish") return null;

  const alias = ALIASES[key];

  if (alias) return MODES[alias];

  if (key in MODES) return MODES[key as TravelModeKey];

  return null;
}

/**
 * The transport of a route point describes how the heroes arrived there.
 * For the final point the data often says only "finish", so we fall back
 * to the previous point's transport rather than showing no vehicle at all.
 */
export function getTravelMode(point: RoutePoint, previous?: RoutePoint): TravelMode | null {
  return resolve(point.transport) ?? resolve(previous?.transport);
}

export function travelInterval(km: number): number {
  if (km < 30) return 2400;

  return Math.min(4200, 2550 + km / 10);
}
