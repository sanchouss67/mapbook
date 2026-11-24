import type { PlaceCertainty, RoutePoint } from "@/types/book";

export type KidsQuest = {
  question: string;
  options: string[];
  answer: number;
  explain?: string;
};

export type KidsPoint = {
  order: number;
  displayName?: string;
  country?: string;
  summary?: string;
  note?: string;
  certainty?: PlaceCertainty;
  transport?: string;
  quest?: KidsQuest;
};

export type KidsBook = {
  id: string;
  title: string;
  author: string;
  year?: number;
  emoji: string;
  ageFrom: number;
  ageTo: number;
  minutes: number;
  tagline: string;
  description: string;
  points: KidsPoint[];
  route?: RoutePoint[];
};
