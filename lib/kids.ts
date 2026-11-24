import type { BookRoute, RoutePoint } from "@/types/book";
import type { KidsBook, KidsPoint, KidsQuest } from "@/types/kids";

export function kidsPointsByOrder(meta: KidsBook): Map<number, KidsPoint> {
  return new Map(meta.points.map((point) => [point.order, point]));
}

/**
 * Returns a route with kid-friendly Russian texts on top of the atlas data.
 * Missing fields fall back to the original route point, so an overlay can
 * localise only the parts that need it (for example, quests only).
 */
export function applyKidsOverlay(book: BookRoute, meta: KidsBook): RoutePoint[] {
  const overlay = kidsPointsByOrder(meta);

  return [...book.route]
    .sort((first, second) => first.order - second.order)
    .map((point) => {
      const kidsPoint = overlay.get(point.order);

      if (!kidsPoint) return point;

      return {
        ...point,
        displayName: kidsPoint.displayName ?? point.displayName,
        country: kidsPoint.country ?? point.country,
        summary: kidsPoint.summary ?? point.summary,
        note: kidsPoint.note ?? point.note,
        certainty: kidsPoint.certainty ?? point.certainty,
        transport: kidsPoint.transport ?? point.transport
      };
    });
}

export function getKidsQuest(meta: KidsBook, order: number): KidsQuest | undefined {
  return meta.points.find((point) => point.order === order)?.quest;
}

export function kidsTotalPoints(meta: KidsBook, routeLength: number): number {
  return meta.points.length || routeLength;
}
