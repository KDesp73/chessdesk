"use client";

import { useState } from "react";
import Board from "@/components/Board";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useBoardSize } from "@/hooks/useBoardSize";
import { Chess } from "chess.js";

export default function Home() {
  const [fen, setFen] = useState("start");
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [started, setStarted] = useState(false);

  // New state for game mode and engine
  const [gameMode, setGameMode] = useState<"2player" | "computer">("2player");
  const [engine, setEngine] = useState<string>("stockfish");

  const boardSize = useBoardSize();

  const handleStart = () => setStarted(true);
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-muted p-6 md:p-10 gap-8">
      {/* Sidebar Controls */}
      <Card className="w-full md:w-[30%] flex-shrink-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Button onClick={handleNewGame} className="w-full" size="lg">
            New Game
          </Button>

          {!started && (
            <Button onClick={handleStart} variant="secondary" className="w-full" size="lg">
              Start
            </Button>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="fen" className="font-medium text-sm">
              FEN
            </Label>
            <Input
              id="fen"
              value={fen}
              onChange={(e) => setFen(e.target.value)}
              placeholder="Enter FEN string"
              disabled={started}
              className="text-sm font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="gameMode" className="font-medium text-sm">
              Game Mode
            </Label>
            <Select
              value={gameMode}
              onValueChange={(val) => setGameMode(val as "2player" | "computer")}
              disabled={started}
            >
              <SelectTrigger aria-label="Select Game Mode" className="text-sm">
                {gameMode === "2player" ? "2 Player" : "Play vs Computer"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2player">2 Player</SelectItem>
                <SelectItem value="computer">Play vs Computer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gameMode === "computer" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="engine" className="font-medium text-sm">
                Select Engine
              </Label>
              <Select
                value={engine}
                onValueChange={(val) => setEngine(val)}
                disabled={started}
              >
                <SelectTrigger aria-label="Select Engine" className="text-sm">
                  {engine === "stockfish"
                    ? "Stockfish"
                    : engine === "0.3.0"
                    ? "zig-engine v0.3.0"
                    : engine}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stockfish">Stockfish</SelectItem>
                  <SelectItem value="0.3.0">zig-engine v0.3.0</SelectItem>
                  {/* Add more engines here if needed */}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-row gap-10">
            <div className="flex flex-col gap-2">
              <Label htmlFor="orientation" className="font-medium text-sm">
                Orientation
              </Label>
              <Select
                value={orientation}
                onValueChange={(val: "w" | "b") => setOrientation(val)}
                disabled={started}
              >
                <SelectTrigger aria-label="Select Board Orientation" className="text-sm">
                  {orientation === "w" ? "White" : "Black"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="w">White</SelectItem>
                  <SelectItem value="b">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="turn" className="font-medium text-sm">
                Turn
              </Label>
              <Select
                value={fen.split(" ")[1]}
                onValueChange={(val: "w" | "b") => {
                  const parts = fen.split(" ");
                  if (parts.length >= 2) {
                    parts[1] = val;
                    setFen(parts.join(" "));
                  }
                }}
                disabled={started}
              >
                <SelectTrigger aria-label="Select Turn" className="text-sm">
                  {fen.split(" ")[1] === "w" ? "White" : "Black"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="w">White</SelectItem>
                  <SelectItem value="b">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white rounded-lg shadow-lg">
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
      </main>
    </div>
  );
}
