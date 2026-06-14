"use client";

import { RotateCcw, Undo2, Copy, Download, Bot, Cpu, Zap, Shield } from "lucide-react";
import CapturedPieces from "./CapturedPieces";
import MoveHistory from "./MoveHistory";
import type { GameStatus, CapturedPieces as CapturedPiecesType, GameMode } from "@/lib/types";
import type { Color, PieceSymbol } from "chess.js";
import type { AIDifficulty } from "@/lib/chess-ai";

interface GameSidebarProps {
  status: GameStatus;
  turn: Color;
  isGameOver: boolean;
  moveHistory: string[];
  capturedPieces: CapturedPiecesType;
  fen: string;
  onReset: () => void;
  onUndo: () => void;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiColor: Color;
  isAIThinking: boolean;
  onChangeDifficulty: (d: AIDifficulty) => void;
  onChangeAIColor: (c: Color) => void;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function calculateMaterial(pieces: PieceSymbol[]): number {
  return pieces.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
}

const STATUS_CONFIG: Record<
  GameStatus,
  { text: string; color: string; icon: string }
> = {
  playing: { text: "", color: "", icon: "" },
  check: { text: "Check!", color: "text-yellow-400", icon: "⚡" },
  checkmate: {
    text: "Checkmate!",
    color: "text-red-400",
    icon: "👑",
  },
  stalemate: { text: "Stalemate - Draw", color: "text-blue-400", icon: "🤝" },
  draw: { text: "Draw", color: "text-blue-400", icon: "🤝" },
  insufficient: {
    text: "Insufficient Material",
    color: "text-blue-400",
    icon: "🤝",
  },
  threefold: {
    text: "Threefold Repetition",
    color: "text-blue-400",
    icon: "🤝",
  },
  "fifty-move": { text: "50-Move Rule", color: "text-blue-400", icon: "🤝" },
};

const DIFFICULTY_CONFIG: Record<
  AIDifficulty,
  { label: string; icon: React.ReactNode; color: string; desc: string }
> = {
  easy: {
    label: "Easy",
    icon: <Shield size={12} />,
    color: "text-green-400",
    desc: "Depth 1",
  },
  medium: {
    label: "Medium",
    icon: <Zap size={12} />,
    color: "text-yellow-400",
    desc: "Depth 3",
  },
  hard: {
    label: "Hard",
    icon: <Cpu size={12} />,
    color: "text-red-400",
    desc: "Depth 4",
  },
};

export default function GameSidebar({
  status,
  turn,
  isGameOver,
  moveHistory,
  capturedPieces,
  fen,
  onReset,
  onUndo,
  gameMode,
  aiDifficulty,
  aiColor,
  isAIThinking,
  onChangeDifficulty,
  onChangeAIColor,
}: GameSidebarProps) {
  const whiteMaterial = calculateMaterial(capturedPieces.w);
  const blackMaterial = calculateMaterial(capturedPieces.b);

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(fen);
    } catch {
      // fallback
    }
  };

  const handleExportPGN = () => {
    const pgn = moveHistory
      .map((move, i) => {
        if (i % 2 === 0) return `${Math.floor(i / 2) + 1}. ${move}`;
        return move;
      })
      .join(" ");
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.pgn";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusInfo = STATUS_CONFIG[status];

  const getStatusText = () => {
    if (isGameOver) {
      if (status === "checkmate") {
        if (gameMode === "ai") {
          const winner = turn === "w" ? "Black (AI)" : "White";
          return `${winner} wins!`;
        }
        return `${turn === "w" ? "Black" : "White"} wins!`;
      }
      return "Game Over";
    }
    if (isAIThinking) {
      return "AI thinking...";
    }
    if (gameMode === "ai") {
      return turn === aiColor ? "AI's turn" : "Your turn";
    }
    return `${turn === "w" ? "White" : "Black"} to move`;
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Game Status */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                turn === "w" ? "bg-white border border-zinc-400" : "bg-zinc-800 border border-zinc-600"
              } ${!isGameOver && !isAIThinking ? "animate-pulse-slow" : ""}`}
            />
            <span className="text-sm font-medium text-zinc-300">
              {getStatusText()}
            </span>
          </div>
          {statusInfo.text && (
            <span
              className={`text-sm font-bold ${statusInfo.color} slide-in flex items-center gap-1`}
            >
              <span>{statusInfo.icon}</span>
              {statusInfo.text}
            </span>
          )}
        </div>

        {/* Captured Pieces */}
        <div className="space-y-1">
          <CapturedPieces
            pieces={capturedPieces.b}
            color="b"
            materialAdvantage={Math.max(0, blackMaterial - whiteMaterial)}
          />
          <CapturedPieces
            pieces={capturedPieces.w}
            color="w"
            materialAdvantage={Math.max(0, whiteMaterial - blackMaterial)}
          />
        </div>
      </div>

      {/* AI Settings (only in AI mode) */}
      {gameMode === "ai" && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot size={14} className="text-amber-400" />
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              AI Settings
            </h3>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Difficulty</label>
            <div className="flex gap-1.5">
              {(Object.keys(DIFFICULTY_CONFIG) as AIDifficulty[]).map((d) => {
                const config = DIFFICULTY_CONFIG[d];
                return (
                  <button
                    key={d}
                    onClick={() => onChangeDifficulty(d)}
                    className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      aiDifficulty === d
                        ? "bg-zinc-700 text-white border border-zinc-600"
                        : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent"
                    }`}
                  >
                    <span className={aiDifficulty === d ? config.color : ""}>
                      {config.icon}
                    </span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Play As */}
          <div className="space-y-2 mt-3">
            <label className="text-xs text-zinc-500">Play as</label>
            <div className="flex gap-1.5">
              <button
                onClick={() => onChangeAIColor("w")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  aiColor === "b"
                    ? "bg-zinc-700 text-white border border-zinc-600"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white border border-zinc-400" />
                White
              </button>
              <button
                onClick={() => onChangeAIColor("b")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  aiColor === "w"
                    ? "bg-zinc-700 text-white border border-zinc-600"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-transparent"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-600" />
                Black
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move History */}
      <div className="flex-1 flex flex-col min-h-0 glass rounded-xl p-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Moves ({moveHistory.length})
        </h3>
        <MoveHistory moves={moveHistory} />
      </div>

      {/* Actions */}
      <div className="glass rounded-xl p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw size={14} />
            New Game
          </button>
          <button
            onClick={onUndo}
            disabled={moveHistory.length === 0 || isAIThinking}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Undo2 size={14} />
            Undo
          </button>
          <button
            onClick={handleCopyFen}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Copy size={14} />
            Copy FEN
          </button>
          <button
            onClick={handleExportPGN}
            disabled={moveHistory.length === 0}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Download size={14} />
            Export PGN
          </button>
        </div>
      </div>
    </div>
  );
}
