"use client";

import { useMemo } from "react";
import type { PieceSymbol, Color } from "chess.js";

const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    k: "♔",
  },
  b: {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  },
};

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

interface CapturedPiecesProps {
  pieces: PieceSymbol[];
  color: Color;
  materialAdvantage: number;
}

export default function CapturedPieces({
  pieces,
  color,
  materialAdvantage,
}: CapturedPiecesProps) {
  const displayPieces = useMemo(() => {
    return pieces.map((piece, i) => ({
      key: `${piece}-${i}`,
      unicode: PIECE_UNICODE[color === "w" ? "b" : "w"][piece], // captured pieces are opposite color
      name: PIECE_NAMES[piece],
    }));
  }, [pieces, color]);

  if (displayPieces.length === 0 && materialAdvantage === 0) return null;

  return (
    <div className="flex items-center gap-1 min-h-[28px]">
      <div className="flex items-center gap-0.5">
        {displayPieces.map((piece) => (
          <span
            key={piece.key}
            className="text-xl leading-none opacity-90"
            title={piece.name}
          >
            {piece.unicode}
          </span>
        ))}
      </div>
      {materialAdvantage > 0 && (
        <span className="text-xs text-zinc-500 font-medium ml-1">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
}
