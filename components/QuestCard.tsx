"use client";

import { useState } from "react";
import type { KidsQuest } from "@/types/kids";

type QuestCardProps = {
  quest: KidsQuest;
  isSolved: boolean;
  onSolved: () => void;
};

export default function QuestCard({ quest, isSolved, onSolved }: QuestCardProps) {
  const [choice, setChoice] = useState<number | null>(null);

  const isCorrect = choice !== null && choice === quest.answer;

  const choose = (index: number) => {
    if (isCorrect) return;

    setChoice(index);

    if (index === quest.answer) onSolved();
  };

  return (
    <section className="quest" aria-label="Задание по точке">
      <p className="eyebrow">Задание</p>
      <h3>{quest.question}</h3>
      <div className="questOptions">
        {quest.options.map((option, index) => {
          const isChosen = choice === index;
          const showCorrect = isCorrect && index === quest.answer;
          const showWrong = isChosen && !isCorrect;

          return (
            <button
              key={option}
              type="button"
              className={[
                "questOption",
                showCorrect ? "correct" : "",
                showWrong ? "wrong" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => choose(index)}
              aria-pressed={isChosen}
            >
              <span className="questOptionMark">{showCorrect ? "✓" : showWrong ? "×" : ""}</span>
              {option}
            </button>
          );
        })}
      </div>

      {isCorrect ? (
        <p className="questExplain">
          {quest.explain}
          {isSolved ? " Штамп в паспорте!" : ""}
        </p>
      ) : choice !== null ? (
        <p className="questExplain">Пока не то. Попробуй ещё раз.</p>
      ) : null}
    </section>
  );
}
