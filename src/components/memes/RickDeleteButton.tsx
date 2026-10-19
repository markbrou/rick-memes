"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

const positions = [
  { x: 1, y: 1 },
  { x: 0, y: 0.5 },
  { x: 1, y: 0 },
  { x: 0.5, y: 1 },
  { x: 0, y: 0 },
  { x: 1, y: 0.5 },
  { x: 0, y: 1 },
  { x: 0.5, y: 0 },
];

export default function RickDeleteButton({ title }: { title: string }) {
  const [positionIndex, setPositionIndex] = useState(0);
  const position = positions[positionIndex];

  function escape() {
    setPositionIndex((current) => (current + 1 + Math.floor(Math.random() * (positions.length - 1))) % positions.length);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-square">
      <button
        type="button"
        aria-label={`Verwijder ${title}`}
        title="Verwijderen"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) escape();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (event.pointerType !== "mouse") {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          escape();
        }}
        className="pointer-events-auto absolute flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg bg-red-700 text-white shadow-lg hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
        style={{
          left: `calc(${position.x * 100}% + ${12 - position.x * 68}px)`,
          top: `calc(${position.y * 100}% + ${12 - position.y * 68}px)`,
        }}
      >
        <Trash2 size={20} aria-hidden="true" />
      </button>
    </div>
  );
}