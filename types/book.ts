export type PlaceCertainty = "exact" | "approximate" | "fictional";

export type RoutePoint = {
  order: number;
  place: string;
  displayName: string;
  country?: string;
  lat: number;
  lng: number;
  chapter?: number;
  certainty: PlaceCertainty;
  transport?: string;
  summary: string;
  bookText?: string;
  quote?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  note?: string;
};

export type BookRoute = {
  id: string;
  title: string;
  author: string;
  originalTitle?: string;
  year?: number;
  description: string;
  route: RoutePoint[];
};
