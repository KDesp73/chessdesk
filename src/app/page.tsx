// app/page.tsx
"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import TopBar from "@/components/TopBar";
import Board from "@/components/Board";
import { useBoardSize } from "@/hooks/useBoardSize";

export default function Home() {
  const [fen, setFen] = useState("start");
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [started, setStarted] = useState(false);
  const [gameMode, setGameMode] = useState<"2player" | "computer">("2player");
  const [engine, setEngine] = useState<string>("stockfish");

  const handleNewGame = () => {
    setFen("start");
    setOrientation("w");
    setStarted(false);
    setGameMode("2player");
    setEngine("stockfish");
  };

  function onGameEnd(g: Chess) {
    console.log(g.pgn());
  }

  const boardSize = useBoardSize();

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        onNewGame={handleNewGame}
        fen={fen}
        setFen={setFen}
        orientation={orientation}
        setOrientation={setOrientation}
        gameMode={gameMode}
        setGameMode={setGameMode}
        engine={engine}
        setEngine={setEngine}
        started={started}
        onStart={() => setStarted(true)}
      />
      <div className="flex flex-1 items-center justify-center">
        <Board
          fen={fen}
          size={boardSize}
          orientation={orientation}
          started={started}
          gameMode={gameMode}
          engine={engine}
          onFenChangeAction={setFen}
          onGameEndAction={onGameEnd}
        />
      </div>
    </div>
  );
}
