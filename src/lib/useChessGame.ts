"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, type Square, type PieceSymbol, type Color } from "chess.js";
import type { GameStatus, CapturedPieces, GameMode } from "@/lib/types";
import { getBestMove, type AIDifficulty } from "@/lib/chess-ai";

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({
    w: [],
    b: [],
  });
  const [status, setStatus] = useState<GameStatus>("playing");
  const [turn, setTurn] = useState<Color>("w");
  const [moveSquares, setMoveSquares] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("2player");
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [aiColor, setAiColor] = useState<Color>("b");
  const [isAIThinking, setIsAIThinking] = useState(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs for values that callbacks depend on but shouldn't cause re-renders
  const isAIThinkingRef = useRef(false);
  const gameModeRef = useRef<GameMode>("2player");
  const aiColorRef = useRef<Color>("b");
  const aiDifficultyRef = useRef<AIDifficulty>("medium");

  // Keep refs in sync with state
  useEffect(() => { isAIThinkingRef.current = isAIThinking; }, [isAIThinking]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { aiColorRef.current = aiColor; }, [aiColor]);
  useEffect(() => { aiDifficultyRef.current = aiDifficulty; }, [aiDifficulty]);

  const updateStatus = useCallback(() => {
    if (game.isCheckmate()) {
      setStatus("checkmate");
    } else if (game.isStalemate()) {
      setStatus("stalemate");
    } else if (game.isDraw()) {
      setStatus("draw");
    } else if (game.isInsufficientMaterial()) {
      setStatus("insufficient");
    } else if (game.isThreefoldRepetition()) {
      setStatus("threefold");
    } else if (game.isCheck()) {
      setStatus("check");
    } else {
      setStatus("playing");
    }
    setTurn(game.turn());
  }, [game]);

  const syncGameState = useCallback(() => {
    setFen(game.fen());
    updateStatus();
    setLastMove(null);
    setMoveSquares([]);
  }, [game, updateStatus]);

  // Use a ref to track whether we're already expecting an AI move
  const aiMovePendingRef = useRef(false);

  // Make the AI move
  const makeAIMove = useCallback(() => {
    if (gameModeRef.current !== "ai" || game.isGameOver() || game.turn() !== aiColorRef.current) {
      return;
    }

    if (aiMovePendingRef.current) return;
    aiMovePendingRef.current = true;
    setIsAIThinking(true);

    // Use setTimeout to let the UI update before the AI calculates
    aiTimeoutRef.current = setTimeout(() => {
      const bestMove = getBestMove(game, aiDifficultyRef.current, aiColorRef.current);

      if (bestMove) {
        const move = game.move({
          from: bestMove.from,
          to: bestMove.to,
          promotion: bestMove.promotion || "q",
        });

        if (move) {
          if (move.captured) {
            const capturedBy = move.color === "w" ? "w" : "b";
            setCapturedPieces((prev) => ({
              ...prev,
              [capturedBy]: [...prev[capturedBy], move.captured!].sort(
                (a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]
              ),
            }));
          }

          setMoveHistory((prev) => [...prev, move.san]);
          setFen(game.fen());
          setLastMove({ from: bestMove.from, to: bestMove.to });
          updateStatus();
        }
      }

      aiMovePendingRef.current = false;
      setIsAIThinking(false);
    }, 300); // Small delay so UI shows "thinking" state
  }, [game, updateStatus]);

  // Trigger AI move when it's the AI's turn — use a single stable effect
  useEffect(() => {
    if (
      gameModeRef.current === "ai" &&
      game.turn() === aiColorRef.current &&
      !game.isGameOver() &&
      !isAIThinkingRef.current
    ) {
      makeAIMove();
    }
  }, [fen, game, makeAIMove]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  // Stable makeMove — uses refs instead of state deps
  const makeMove = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      // In AI mode, prevent moves when it's the AI's turn or AI is thinking
      if (gameModeRef.current === "ai" && (game.turn() === aiColorRef.current || isAIThinkingRef.current)) {
        return false;
      }

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // auto-promote to queen
        });

        if (move === null) return false;

        // Track captures
        if (move.captured) {
          const capturedBy = move.color === "w" ? "w" : "b";
          setCapturedPieces((prev) => ({
            ...prev,
            [capturedBy]: [...prev[capturedBy], move.captured!].sort(
              (a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]
            ),
          }));
        }

        setMoveHistory((prev) => [...prev, move.san]);
        setFen(game.fen());
        setLastMove({ from: sourceSquare, to: targetSquare });
        updateStatus();
        setMoveSquares([]);

        return true;
      } catch {
        return false;
      }
    },
    [game, updateStatus]
  );

  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    aiMovePendingRef.current = false;
    game.reset();
    setFen(game.fen());
    setMoveHistory([]);
    setCapturedPieces({ w: [], b: [] });
    setStatus("playing");
    setTurn("w");
    setMoveSquares([]);
    setLastMove(null);
    setIsAIThinking(false);
  }, [game]);

  const undoMove = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    aiMovePendingRef.current = false;

    if (gameModeRef.current === "ai") {
      // In AI mode, undo both the AI move and the player move
      const undone1 = game.undo(); // undo AI move
      const undone2 = game.undo(); // undo player move

      if (undone1 || undone2) {
        // Rebuild move history
        const moves = game.history();
        setMoveHistory(moves);

        // Recalculate captured pieces
        const newCaptured: CapturedPieces = { w: [], b: [] };
        const verboseMoves = game.history({ verbose: true });
        for (const move of verboseMoves) {
          if (move.captured) {
            newCaptured[move.color].push(move.captured);
          }
        }
        setCapturedPieces({
          w: newCaptured.w.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]),
          b: newCaptured.b.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]),
        });

        syncGameState();
        setIsAIThinking(false);
      }
    } else {
      const undone = game.undo();
      if (undone) {
        setMoveHistory((prev) => prev.slice(0, -1));
        setFen(game.fen());
        updateStatus();
        setLastMove(null);
        setMoveSquares([]);

        // Recalculate captured pieces
        const newCaptured: CapturedPieces = { w: [], b: [] };
        const moves = game.history({ verbose: true });
        for (const move of moves) {
          if (move.captured) {
            newCaptured[move.color].push(move.captured);
          }
        }
        setCapturedPieces({
          w: newCaptured.w.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]),
          b: newCaptured.b.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]),
        });
      }
    }
  }, [game, syncGameState, updateStatus]);

  const loadFen = useCallback(
    (newFen: string) => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
      aiMovePendingRef.current = false;
      try {
        game.load(newFen);
        setFen(game.fen());
        setMoveHistory([]);
        setCapturedPieces({ w: [], b: [] });
        updateStatus();
        setLastMove(null);
        setMoveSquares([]);
        setIsAIThinking(false);
      } catch {
        // Invalid FEN
      }
    },
    [game, updateStatus]
  );

  const changeGameMode = useCallback(
    (mode: GameMode) => {
      setGameMode(mode);
      resetGame();
    },
    [resetGame]
  );

  const changeAIDifficulty = useCallback(
    (difficulty: AIDifficulty) => {
      setAiDifficulty(difficulty);
    },
    []
  );

  const changeAIColor = useCallback(
    (color: Color) => {
      setAiColor(color);
      resetGame();
    },
    [resetGame]
  );

  return {
    fen,
    turn,
    status,
    moveHistory,
    capturedPieces,
    moveSquares,
    lastMove,
    makeMove,
    resetGame,
    undoMove,
    loadFen,
    isGameOver: game.isGameOver(),
    // AI-specific
    gameMode,
    aiDifficulty,
    aiColor,
    isAIThinking,
    changeGameMode,
    changeAIDifficulty,
    changeAIColor,
  };
}
