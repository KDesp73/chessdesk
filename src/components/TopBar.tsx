"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TopBarProps {
  onNewGame: () => void;
  fen: string;
  setFen: (fen: string) => void;
  orientation: "w" | "b";
  setOrientation: (o: "w" | "b") => void;
  gameMode: "2player" | "computer";
  setGameMode: (m: "2player" | "computer") => void;
  engine: string;
  setEngine: (e: string) => void;
  started: boolean;
  onStart: () => void;
}

export default function TopBar({
  onNewGame,
  fen,
  setFen,
  orientation,
  setOrientation,
  gameMode,
  setGameMode,
  engine,
  setEngine,
  started,
  onStart,
}: TopBarProps) {
  return (
    <div className="w-full h-14 bg-gray-800 text-white flex items-center px-4 gap-4 shadow text-sm">
      <span className="font-semibold cursor-pointer select-none">ChessDesk</span>

      {/* Desktop buttons */}
      <div className="hidden md:flex items-center gap-4">
        <Button onClick={onNewGame} variant="ghost" className="text-sm">
          New Game
        </Button>

        {!started && (
          <Button onClick={onStart} variant="ghost" className="text-sm">
            Start
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white px-2">
              Game Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fenInput" className="font-medium text-white">
                FEN
              </Label>
              <Input
                id="fenInput"
                value={fen}
                onChange={(e) => setFen(e.target.value)}
                disabled={started}
                className="text-black text-xs"
              />
            </div>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuLabel>Game Mode</DropdownMenuLabel>
            <Select
              value={gameMode}
              onValueChange={(val) => setGameMode(val as "2player" | "computer")}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm mb-2">
                {gameMode === "2player" ? "2 Player" : "vs Computer"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2player">2 Player</SelectItem>
                <SelectItem value="computer">vs Computer</SelectItem>
              </SelectContent>
            </Select>

            {gameMode === "computer" && (
              <>
                <DropdownMenuLabel>Engine</DropdownMenuLabel>
                <Select
                  value={engine}
                  onValueChange={setEngine}
                  disabled={started}
                >
                  <SelectTrigger className="w-full text-sm mb-2">{engine}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stockfish">Stockfish</SelectItem>
                    <SelectItem value="0.3.0">v0.3.0</SelectItem>
                    <SelectItem value="0.2.1">v0.2.1</SelectItem>
                    <SelectItem value="0.2.0">v0.2.0</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <DropdownMenuLabel>Orientation</DropdownMenuLabel>
            <Select
              value={orientation}
              onValueChange={(val) => setOrientation(val as "w" | "b")}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm mb-2">
                {orientation === "w" ? "White" : "Black"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w">White</SelectItem>
                <SelectItem value="b">Black</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenuLabel>Turn</DropdownMenuLabel>
            <Select
              value={fen.split(" ")[1]}
              onValueChange={(val) => {
                const parts = fen.split(" ");
                if (parts.length >= 2) {
                  parts[1] = val;
                  setFen(parts.join(" "));
                }
              }}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm">
                {fen.split(" ")[1] === "w" ? "White" : "Black"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w">White</SelectItem>
                <SelectItem value="b">Black</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile hamburger */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white px-2 text-xl">
              &#9776;
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-3 space-y-2">
            <DropdownMenuItem onClick={onNewGame}>New Game</DropdownMenuItem>
            {!started && (
              <DropdownMenuItem onClick={onStart}>Start</DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <div className="flex flex-col gap-2">
              <Label htmlFor="fenInputMobile" className="font-medium text-black">
                FEN
              </Label>
              <Input
                id="fenInputMobile"
                value={fen}
                onChange={(e) => setFen(e.target.value)}
                disabled={started}
                className="text-black text-xs"
              />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Game Mode</DropdownMenuLabel>
            <Select
              value={gameMode}
              onValueChange={(val) => setGameMode(val as "2player" | "computer")}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm mb-2">
                {gameMode === "2player" ? "2 Player" : "vs Computer"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2player">2 Player</SelectItem>
                <SelectItem value="computer">vs Computer</SelectItem>
              </SelectContent>
            </Select>

            {gameMode === "computer" && (
              <>
                <DropdownMenuLabel>Engine</DropdownMenuLabel>
                <Select
                  value={engine}
                  onValueChange={setEngine}
                  disabled={started}
                >
                  <SelectTrigger className="w-full text-sm mb-2">{engine}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stockfish">Stockfish</SelectItem>
                    <SelectItem value="0.3.0">v0.3.0</SelectItem>
                    <SelectItem value="0.2.1">v0.2.1</SelectItem>
                    <SelectItem value="0.2.0">v0.2.0</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <DropdownMenuLabel>Orientation</DropdownMenuLabel>
            <Select
              value={orientation}
              onValueChange={(val) => setOrientation(val as "w" | "b")}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm mb-2">
                {orientation === "w" ? "White" : "Black"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w">White</SelectItem>
                <SelectItem value="b">Black</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenuLabel>Turn</DropdownMenuLabel>
            <Select
              value={fen.split(" ")[1]}
              onValueChange={(val) => {
                const parts = fen.split(" ");
                if (parts.length >= 2) {
                  parts[1] = val;
                  setFen(parts.join(" "));
                }
              }}
              disabled={started}
            >
              <SelectTrigger className="w-full text-sm">
                {fen.split(" ")[1] === "w" ? "White" : "Black"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w">White</SelectItem>
                <SelectItem value="b">Black</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
