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
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [fen, setFen] = useState("start");
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  const handleNewGame = () => {
    setFen("start");
    setOrientation("w");
    setStarted(false);
  };

  return (
    <div className="flex h-screen bg-muted p-4 gap-6">
      {/* Menu */}
      <Card className="w-[30%] h-fit">
        <CardHeader>
          <CardTitle>Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleNewGame}>New Game</Button>

          {!started && (
            <Button onClick={handleStart} variant="secondary">
              Start
            </Button>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="fen">FEN</Label>
            <Input
              id="fen"
              value={fen}
              onChange={(e) => setFen(e.target.value)}
              placeholder="Enter FEN"
              disabled={started}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="orientation">Orientation</Label>
            <Select
              value={orientation}
              onValueChange={(val: "w" | "b") => setOrientation(val)}
              disabled={started}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w">White</SelectItem>
                <SelectItem value="b">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center">
        <Board fen={fen} orientation={orientation} started={started} onFenChange={setFen} />
      </div>
    </div>
  );
}
