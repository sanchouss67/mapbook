"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { distanceKm } from "@/lib/geo";
import { getTravelMode, travelInterval } from "@/lib/transport";
import type { RoutePoint } from "@/types/book";

type TravelPoint = RoutePoint & {
  mapLng: number;
};

type TravelLayerProps = {
  route: TravelPoint[];
  selectedPoint: TravelPoint;
  enabled: boolean;
};

type Leg = {
  from: TravelPoint;
  to: TravelPoint;
  icon: string | null;
  duration: number;
};

function createTravelIcon(icon: string | null) {
  return L.divIcon({
    className: "travelMarker",
    html: icon
      ? `<span class="travelBubble">${icon}</span>`
      : `<span class="travelPulse"></span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

export default function TravelLayer({ route, selectedPoint, enabled }: TravelLayerProps) {
  const map = useMap();
  const previousOrder = useRef<number | null>(null);

  useEffect(() => {
    const currentIndex = route.findIndex((point) => point.order === selectedPoint.order);
    const previous = previousOrder.current;
    previousOrder.current = selectedPoint.order;

    if (!enabled || previous === null || currentIndex < 0) return;

    const previousIndex = route.findIndex((point) => point.order === previous);

    if (previousIndex < 0 || previousIndex === currentIndex) return;

    const pairs: Array<{ from: TravelPoint; to: TravelPoint }> = [];

    if (currentIndex > previousIndex) {
      for (let index = previousIndex + 1; index <= currentIndex; index += 1) {
        pairs.push({ from: route[index - 1], to: route[index] });
      }
    } else {
      for (let index = previousIndex; index > currentIndex; index -= 1) {
        pairs.push({ from: route[index], to: route[index - 1] });
      }
    }

    const legs: Leg[] = pairs.map(({ from, to }) => {
      const km = distanceKm(
        { lat: from.lat, lng: from.mapLng },
        { lat: to.lat, lng: to.mapLng }
      );

      return {
        from,
        to,
        icon: getTravelMode(to, from)?.icon ?? null,
        duration: travelInterval(km)
      };
    });

    if (legs.length === 0) return;

    let cancelled = false;
    let frameId = 0;
    let legIndex = 0;
    let startedAt: number | null = null;

    const marker = L.marker([legs[0].from.lat, legs[0].from.mapLng], {
      icon: createTravelIcon(legs[0].icon),
      interactive: false,
      keyboard: false,
      zIndexOffset: 1000
    }).addTo(map);

    const frame = (timestamp: number) => {
      if (cancelled) return;

      const leg = legs[legIndex];

      if (startedAt === null) startedAt = timestamp;

      const progress = Math.min((timestamp - startedAt) / leg.duration, 1);
      const eased =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      marker.setLatLng([
        leg.from.lat + (leg.to.lat - leg.from.lat) * eased,
        leg.from.mapLng + (leg.to.mapLng - leg.from.mapLng) * eased
      ]);

      if (progress >= 1) {
        legIndex += 1;

        if (legIndex >= legs.length) {
          cancelled = true;
          marker.remove();
          return;
        }

        startedAt = null;
        marker.setIcon(createTravelIcon(legs[legIndex].icon));
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      marker.remove();
    };
  }, [map, route, selectedPoint, enabled]);

  return null;
}
