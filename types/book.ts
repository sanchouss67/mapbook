export type PlaceCertainty = "exact" | "approximate" | "fictional";

export type RoutePoint = {
  order: number;
  place: string;
  displayName: string;
  country?: string;
  lat: number;
  lng: number;
  chapter?: number;
  reference?: string;
  certainty: PlaceCertainty;
  transport?: string;
  summary: string;
  bookText?: string;
  quote?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  sourceUrl?: string;
  note?: string;
};

export type BookSource = {
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
};

export type BookSummary = {
  id: string;
  title: string;
  author: string;
  year?: number;
  description: string;
  pointCount: number;
  source?: BookSource;
};

export type BookRoute = {
  id: string;
  title: string;
  author: string;
  originalTitle?: string;
  year?: number;
  description: string;
  route: RoutePoint[];
  source?: BookSource;
};
