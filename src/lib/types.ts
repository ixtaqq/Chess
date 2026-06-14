import type { Square, PieceSymbol, Color } from "chess.js";
import type { AIDifficulty } from "./chess-ai";

export interface ChessMove {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  capture?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  lan?: string;
  before: string;
  after: string;
}

export interface CapturedPieces {
  w: PieceSymbol[];
  b: PieceSymbol[];
}

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "insufficient"
  | "threefold"
  | "fifty-move";

export type GameMode = "2player" | "ai";

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  status: GameStatus;
  moveHistory: string[];
  capturedPieces: CapturedPieces;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiColor: Color;
  isAIThinking: boolean;
}
