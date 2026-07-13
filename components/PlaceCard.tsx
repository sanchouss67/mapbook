import Image from "next/image";
import type { PlaceCertainty, RoutePoint } from "@/types/book";

const certaintyLabels: Record<PlaceCertainty, string> = {
  exact: "точное место",
  approximate: "примерное место",
  fictional: "вымышленное место"
};

type PlaceCardProps = {
  point: RoutePoint;
};

export default function PlaceCard({ point }: PlaceCardProps) {
  return (
    <aside className="placePanel" aria-label="Карточка точки маршрута">
      {point.imageUrl ? (
        <figure className="placePhoto">
          <Image
            src={point.imageUrl}
            alt={point.imageAlt ?? point.displayName}
            width={640}
            height={400}
            sizes="(max-width: 1180px) 100vw, 340px"
            priority
            unoptimized
          />
          {point.imageCredit ? <figcaption>{point.imageCredit}</figcaption> : null}
        </figure>
      ) : null}

      <div className="panelHeader">
        <p className="eyebrow">Точка {point.order}</p>
        <h2>{point.displayName}</h2>
        <p>{point.country}</p>
      </div>

      <dl className="placeMeta">
        {point.chapter ? (
          <>
            <dt>Глава</dt>
            <dd>{point.chapter}</dd>
          </>
        ) : null}
        <dt>Точность</dt>
        <dd>{certaintyLabels[point.certainty]}</dd>
        {point.transport ? (
          <>
            <dt>Путь</dt>
            <dd>{point.transport}</dd>
          </>
        ) : null}
      </dl>

      <div className="placeText">
        <p>{point.summary}</p>
        {point.bookText ? (
          <section className="bookExcerpt" aria-label="Текст по книге">
            <h3>В книге</h3>
            <p>{point.bookText}</p>
          </section>
        ) : null}
        {point.quote ? <blockquote>{point.quote}</blockquote> : null}
        {point.note ? <p className="note">{point.note}</p> : null}
      </div>
    </aside>
  );
}
