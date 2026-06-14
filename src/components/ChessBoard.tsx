"use client";

import { useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";

interface ChessBoardProps {
  fen: string;
  moveSquares: Square[];
  lastMove: { from: Square; to: Square } | null;
  isGameOver: boolean;
  onMove: (source: Square, target: Square) => boolean;
}

export default function ChessBoard({
  fen,
  moveSquares,
  lastMove,
  isGameOver,
  onMove,
}: ChessBoardProps) {
  const BOARD_WIDTH = 560;

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      return onMove(sourceSquare, targetSquare);
    },
    [onMove]
  );

  // Memoize square styles to prevent unnecessary re-renders of react-chessboard
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(155, 199, 0, 0.41)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(155, 199, 0, 0.41)",
      };
    }

    // Highlight legal move squares
    for (const square of moveSquares) {
      if (!styles[square]) {
        styles[square] = {
          background:
            "radial-gradient(circle, rgba(0,0,0,0.1) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      }
    }

    return styles;
  }, [lastMove?.from, lastMove?.to, moveSquares]);

  return (
    <div className="flex items-center justify-center w-full">
      <Chessboard
        id="main-board"
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={BOARD_WIDTH}
        animationDuration={200}
        arePiecesDraggable={!isGameOver}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
        customDarkSquareStyle={{ backgroundColor: "#b58863" }}
        customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
        customNotationStyle={{
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: "500",
        }}
      />
    </div>
  );
}
