"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import TravelLayer from "@/components/TravelLayer";
import type { RoutePoint } from "@/types/book";

type JourneyMapProps = {
  route: RoutePoint[];
  selectedPoint: RoutePoint;
  onSelectPoint: (point: RoutePoint) => void;
  markerColor?: (point: RoutePoint) => string | undefined;
  autoZoom?: boolean;
  fitMaxZoom?: number;
  animateTravel?: boolean;
};

type MapRoutePoint = RoutePoint & {
  mapLng: number;
};

type MapUpdaterProps = {
  route: MapRoutePoint[];
  selectedPoint: MapRoutePoint;
  autoZoom: boolean;
  fitMaxZoom: number;
};

function MapUpdater({ route, selectedPoint, autoZoom, fitMaxZoom }: MapUpdaterProps) {
  const map = useMap();
  const skipNextMove = useRef(true);

  useEffect(() => {
    const bounds = L.latLngBounds(route.map((point) => [point.lat, point.mapLng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: fitMaxZoom });
    skipNextMove.current = true;
  }, [map, route, fitMaxZoom]);

  useEffect(() => {
    if (!autoZoom) {
      if (skipNextMove.current) {
        skipNextMove.current = false;
        return;
      }

      map.panTo([selectedPoint.lat, selectedPoint.mapLng], { animate: true, duration: 0.5 });
      return;
    }

    map.flyTo([selectedPoint.lat, selectedPoint.mapLng], Math.max(map.getZoom(), 5), {
      duration: 0.7
    });
  }, [map, selectedPoint, autoZoom]);

  return null;
}

function createMarkerIcon(point: RoutePoint, isSelected: boolean, color?: string) {
  const dotClass = isSelected ? "routeMarkerDot selected" : "routeMarkerDot";
  const style = color ? ` style="background:${color}"` : "";

  return L.divIcon({
    className: "routeMarker",
    html: `<span class="${dotClass}"${style}>${point.order}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
}

function unwrapRouteAroundAntimeridian(route: RoutePoint[]): MapRoutePoint[] {
  let previousLng = route[0]?.lng ?? 0;

  return route.map((point, index) => {
    let mapLng = point.lng;

    if (index > 0) {
      while (mapLng - previousLng > 180) {
        mapLng -= 360;
      }

      while (mapLng - previousLng < -180) {
        mapLng += 360;
      }
    }

    previousLng = mapLng;

    return {
      ...point,
      mapLng
    };
  });
}

export default function JourneyMap({
  route,
  selectedPoint,
  onSelectPoint,
  markerColor,
  autoZoom = true,
  fitMaxZoom = 5,
  animateTravel = true
}: JourneyMapProps) {
  const mapRoute = useMemo(() => unwrapRouteAroundAntimeridian(route), [route]);
  const selectedMapPoint =
    mapRoute.find((point) => point.order === selectedPoint.order) ?? mapRoute[0];

  const positions = useMemo(
    () => mapRoute.map((point) => [point.lat, point.mapLng] as [number, number]),
    [mapRoute]
  );

  const routeSignature = useMemo(
    () => mapRoute.map((point) => `${point.order}:${point.place}`).join("|"),
    [mapRoute]
  );

  return (
    <section className="mapPanel" aria-label="Интерактивная карта маршрута">
      <MapContainer center={[35, 45]} zoom={2} scrollWheelZoom className="leafletMap">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: "#1746a2", weight: 4, opacity: 0.9 }} />
        {mapRoute.map((point) => {
          const isSelected = point.order === selectedPoint.order;

          return (
            <Marker
              key={`${point.order}-${point.place}`}
              position={[point.lat, point.mapLng]}
              icon={createMarkerIcon(point, isSelected, markerColor?.(point))}
              eventHandlers={{
                click: () => onSelectPoint(point)
              }}
            >
              <Popup>
                <strong>{point.displayName}</strong>
                <p>{point.summary}</p>
              </Popup>
            </Marker>
          );
        })}
        <TravelLayer
          key={routeSignature}
          route={mapRoute}
          selectedPoint={selectedMapPoint}
          enabled={animateTravel}
        />
        <MapUpdater
          route={mapRoute}
          selectedPoint={selectedMapPoint}
          autoZoom={autoZoom}
          fitMaxZoom={fitMaxZoom}
        />
      </MapContainer>
    </section>
  );
}
