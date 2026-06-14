"use client";

import { useState, useEffect } from "react";
import { Crown, Bot, Users } from "lucide-react";
import ChessBoard from "@/components/ChessBoard";
import GameSidebar from "@/components/GameSidebar";
import { useChessGame } from "@/lib/useChessGame";
import type { GameMode } from "@/lib/types";
import type { Color } from "chess.js";
import type { AIDifficulty } from "@/lib/chess-ai";

export default function ChessPage() {
  const {
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
    isGameOver,
    gameMode,
    aiDifficulty,
    aiColor,
    isAIThinking,
    changeGameMode,
    changeAIDifficulty,
    changeAIColor,
  } = useChessGame();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Crown className="w-12 h-12 text-amber-500 animate-pulse" />
          <span className="text-zinc-500 text-sm">Loading chess board...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Chess</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Selector */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/50">
              <button
                onClick={() => changeGameMode("2player")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  gameMode === "2player"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <Users size={12} />
                2 Player
              </button>
              <button
                onClick={() => changeGameMode("ai")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  gameMode === "ai"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <Bot size={12} />
                vs AI
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-6 items-start">
          {/* Chess Board */}
          <div className="flex-1 flex flex-col items-center w-full gap-3">
            {/* AI Thinking Indicator */}
            {gameMode === "ai" && isAIThinking && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium slide-in">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                AI is thinking...
              </div>
            )}
            <ChessBoard
              fen={fen}
              moveSquares={moveSquares}
              lastMove={lastMove}
              isGameOver={isGameOver || isAIThinking}
              onMove={makeMove}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <GameSidebar
              status={status}
              turn={turn}
              isGameOver={isGameOver}
              moveHistory={moveHistory}
              capturedPieces={capturedPieces}
              fen={fen}
              onReset={resetGame}
              onUndo={undoMove}
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              aiColor={aiColor}
              isAIThinking={isAIThinking}
              onChangeDifficulty={changeAIDifficulty}
              onChangeAIColor={changeAIColor}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            Built with Next.js & chess.js
          </span>
          <span className="text-xs text-zinc-700 font-mono">
            v0.1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
