import QuestCard from "@/components/QuestCard";
import type { PlaceCertainty, RoutePoint } from "@/types/book";
import type { KidsQuest } from "@/types/kids";
import type { TravelMode } from "@/lib/transport";

const certaintyCopy: Record<PlaceCertainty, string> = {
  exact: "Тут правда были",
  approximate: "Примерно тут",
  fictional: "Такого места нет"
};

type KidsPlacePanelProps = {
  point: RoutePoint;
  total: number;
  quest?: KidsQuest;
  distance?: { km: string; hint: string } | null;
  travel?: TravelMode | null;
  isStamped: boolean;
  onStamp: () => void;
};

export default function KidsPlacePanel({
  point,
  total,
  quest,
  distance,
  travel,
  isStamped,
  onStamp
}: KidsPlacePanelProps) {
  return (
    <article className="kidCard" aria-label="Точка маршрута">
      <p className="eyebrow">
        Точка {point.order} из {total}
      </p>
      <h2>{point.displayName}</h2>
      {point.country ? <p className="kidCountry">{point.country}</p> : null}

      <span className={`certaintyBadge ${point.certainty}`}>
        {certaintyCopy[point.certainty]}
      </span>

      <p className="kidSummary">{point.summary}</p>

      {distance ? (
        <p className="kidDistance">
          От прошлой точки — <strong>{distance.km}</strong>
          <span>{distance.hint}</span>
        </p>
      ) : null}

      {travel ? (
        <p className="kidTravel">
          <span className="kidTravelIcon" aria-hidden="true">
            {travel.icon}
          </span>
          Как добирались: {travel.label}
        </p>
      ) : null}

      {point.note ? <p className="kidNote">{point.note}</p> : null}

      {quest ? (
        <QuestCard key={point.order} quest={quest} isSolved={isStamped} onSolved={onStamp} />
      ) : null}

      <button
        type="button"
        className={isStamped ? "stampButton stamped" : "stampButton"}
        onClick={onStamp}
        disabled={isStamped}
      >
        {isStamped ? "✓ Штамп в паспорте" : "Поставить штамп"}
      </button>
    </article>
  );
}
