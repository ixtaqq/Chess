"use client";

import { useRef, useEffect } from "react";

interface MoveHistoryProps {
  moves: string[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Group moves into pairs (white + black)
  const movePairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto rounded-lg bg-zinc-900/50 border border-zinc-800 p-2 min-h-0"
    >
      {movePairs.length === 0 ? (
        <div className="text-zinc-600 text-sm text-center py-4 italic">
          No moves yet
        </div>
      ) : (
        <div className="space-y-0.5">
          {movePairs.map((pair) => (
            <div
              key={pair.number}
              className="flex items-center text-sm font-mono hover:bg-zinc-800/50 rounded px-2 py-1 transition-colors"
            >
              <span className="text-zinc-600 w-8 text-right mr-3 select-none">
                {pair.number}.
              </span>
              <span className="text-zinc-200 w-14 font-medium">
                {pair.white}
              </span>
              {pair.black && (
                <span className="text-zinc-400 w-14">{pair.black}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
