import type { RoutePoint } from "@/types/book";

type RouteTimelineProps = {
  route: RoutePoint[];
  selectedPoint: RoutePoint;
  onSelectPoint: (point: RoutePoint) => void;
};

export default function RouteTimeline({ route, selectedPoint, onSelectPoint }: RouteTimelineProps) {
  return (
    <aside className="timelinePanel" aria-label="Таймлайн маршрута">
      <div className="panelHeader">
        <p className="eyebrow">Таймлайн</p>
        <h2>Путь героев</h2>
      </div>
      <ol className="timelineList">
        {route.map((point) => {
          const isSelected = point.order === selectedPoint.order;

          return (
            <li key={`${point.order}-${point.place}`}>
              <button
                className={isSelected ? "timelineItem active" : "timelineItem"}
                type="button"
                onClick={() => onSelectPoint(point)}
                aria-current={isSelected ? "step" : undefined}
              >
                <span className="timelineNumber">{point.order}</span>
                <span>
                  <strong>{point.displayName}</strong>
                  <small>{point.country ?? "Регион не указан"}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
