const EARTH_RADIUS_KM = 6371;
const MOSCOW_SPB_KM = 634;

type LatLng = {
  lat: number;
  lng: number;
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceKm(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function formatKm(km: number): string {
  if (km < 10) return "меньше 10 км";

  const rounded = Math.round(km / 10) * 10;

  return `${rounded.toLocaleString("ru-RU")} км`;
}

function pluralizeTimes(times: number): string {
  const lastTwo = times % 100;
  const last = times % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "раз";
  if (last === 1) return "раз";
  if (last >= 2 && last <= 4) return "раза";

  return "раз";
}

export function scaleHint(km: number): string {
  if (km < 60) return "Это как длинная прогулка через весь город.";

  if (km < 1200) {
    const times = Math.round(km / MOSCOW_SPB_KM);

    if (times <= 1) return "Примерно как от Москвы до Санкт-Петербурга.";
    if (times <= 9) return `Это как ${times} ${pluralizeTimes(times)} путь Москва — Петербург.`;

    return "Это как несколько раз съездить из Москвы в Петербург.";
  }

  if (km < 3500) return "Это уже межконтинентальный перелёт.";

  const hours = Math.round(km / 850);

  return `На самолёте — около ${hours} ч.`;
}
