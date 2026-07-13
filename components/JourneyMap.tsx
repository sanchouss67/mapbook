"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { RoutePoint } from "@/types/book";

type JourneyMapProps = {
  route: RoutePoint[];
  selectedPoint: RoutePoint;
  onSelectPoint: (point: RoutePoint) => void;
};

type MapRoutePoint = RoutePoint & {
  mapLng: number;
};

type MapUpdaterProps = {
  route: MapRoutePoint[];
  selectedPoint: MapRoutePoint;
};

function MapUpdater({ route, selectedPoint }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(route.map((point) => [point.lat, point.mapLng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
  }, [map, route]);

  useEffect(() => {
    map.flyTo([selectedPoint.lat, selectedPoint.mapLng], Math.max(map.getZoom(), 5), {
      duration: 0.7
    });
  }, [map, selectedPoint]);

  return null;
}

function createMarkerIcon(point: RoutePoint, isSelected: boolean) {
  return L.divIcon({
    className: "routeMarker",
    html: `<span class="${isSelected ? "routeMarkerDot selected" : "routeMarkerDot"}">${point.order}</span>`,
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

export default function JourneyMap({ route, selectedPoint, onSelectPoint }: JourneyMapProps) {
  const mapRoute = useMemo(() => unwrapRouteAroundAntimeridian(route), [route]);
  const selectedMapPoint =
    mapRoute.find((point) => point.order === selectedPoint.order) ?? mapRoute[0];

  const positions = useMemo(
    () => mapRoute.map((point) => [point.lat, point.mapLng] as [number, number]),
    [mapRoute]
  );

  return (
    <section className="mapPanel" aria-label="Интерактивная карта маршрута">
      <MapContainer center={[35, 45]} zoom={2} scrollWheelZoom className="leafletMap">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.78 }} />
        {mapRoute.map((point) => {
          const isSelected = point.order === selectedPoint.order;

          return (
            <Marker
              key={`${point.order}-${point.place}`}
              position={[point.lat, point.mapLng]}
              icon={createMarkerIcon(point, isSelected)}
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
        <MapUpdater route={mapRoute} selectedPoint={selectedMapPoint} />
      </MapContainer>
    </section>
  );
}
