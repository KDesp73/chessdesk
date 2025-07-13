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
import { SelectLabel } from "@radix-ui/react-select";

export default function Home() {
  const [fen, setFen] = useState("start");
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [started, setStarted] = useState(false);
  const boardSize = useBoardSize();

  const handleStart = () => setStarted(true);
  const handleNewGame = () => {
    setFen("start");
    setOrientation("w");
    setStarted(false);
  };

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
              <SelectTrigger aria-label="Select Board Orientation" className="text-sm" />
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
              <SelectTrigger aria-label="Select Turn" className="text-sm" />
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
          onFenChangeAction={setFen}
        />
      </main>
    </div>
  );
}
