"use client";

import { useState, useEffect, useCallback } from "react";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess, PieceSymbol, Square } from "chess.js";
import { pieceUnicode, boardToPosition, positionToFen } from "@/components/ChessUtils";

interface BoardProps {
  fen: string;
  size: number;
  orientation: "w" | "b";
  started: boolean;
  gameMode: "2player" | "computer";
  engine: string;
  onFenChangeAction: (fen: string) => void;
  onGameEndAction: (g: Chess) => void;
}

export default function Board({
  fen,
  size,
  orientation,
  started,
  gameMode,
  engine,
  onFenChangeAction,
  onGameEndAction
}: BoardProps) {
  const [game, setGame] = useState(new Chess());
  const [result, setResult] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);

  const updateResult = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      setResult(`Checkmate! ${g.turn() === "w" ? "Black" : "White"} wins.`);
    } else if (g.isDraw()) {
      setResult("Draw!");
    } else if (g.isStalemate()) {
      setResult("Stalemate!");
    } else if (g.isThreefoldRepetition()) {
      setResult("Draw by threefold repetition!");
    } else if (g.isInsufficientMaterial()) {
      setResult("Draw by insufficient material!");
    } else {
      setResult(null);
      return;
    }
    onGameEndAction(g);
  }, [onGameEndAction]);

  useEffect(() => {
    const newGame = new Chess();
    if (fen === "start") {
      onFenChangeAction(newGame.fen());
    } else {
      newGame.load(fen);
    }
    setGame(newGame);
  }, [fen, onFenChangeAction]);

  useEffect(() => {
    updateResult(game);
  }, [game, updateResult]);

  const fetchBestMove = useCallback(async (currentFen: string) => {
    setIsEngineThinking(true);
    try {
      const res = await fetch("/api/bestmove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engine, position: currentFen }),
      });
      if (!res.ok) throw new Error(`Engine error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error("Engine error:", err);
      return null;
    } finally {
      setIsEngineThinking(false);
    }
  }, [engine]);

  useEffect(() => {
    if (!started || gameMode !== "computer" || result !== null) return;
    const turn = game.turn();
    if (turn === orientation || isEngineThinking) return;

    (async () => {
      const response = await fetchBestMove(game.fen());
      if (response) {
        const move = game.move({ from: response.from, to: response.to, promotion: response.promotion });
        if (move) {
          const newGame = new Chess(game.fen());
          setGame(newGame);
          onFenChangeAction(newGame.fen());
        }
      }
    })();
  }, [started, gameMode, orientation, result, isEngineThinking, game, fetchBestMove, onFenChangeAction]);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!started || targetSquare == null) return false;
    if (gameMode === "computer" && game.turn() !== orientation) return false;

    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
    } catch (err) {
      console.error(err);
      return false;
    }

    const newGame = new Chess(game.fen());
    setGame(newGame);
    onFenChangeAction(newGame.fen());
    return true;
  }, [game, onFenChangeAction, started, gameMode, orientation]);

  const onPieceDropFree = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (started || !targetSquare) return false;
    const position = boardToPosition(game);
    if (!(sourceSquare in position)) return false;

    position[targetSquare] = position[sourceSquare];
    delete position[sourceSquare];

    const newFen = positionToFen(position);
    const newGame = new Chess();
    newGame.load(newFen);
    setGame(newGame);
    onFenChangeAction(newFen);
    return true;
  }, [game, onFenChangeAction, started]);

  const addPiece = (piece: string) => {
    if (started) return;
    const position = boardToPosition(game);

    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = "abcdefgh"[file] + rank;
        if (!(square in position)) {
          const type = piece.toLowerCase() as PieceSymbol;
          const color = piece === piece.toUpperCase() ? "w" : "b";
          position[square] = { type, color };
          const newFen = positionToFen(position);
          const newGame = new Chess();
          newGame.load(newFen);
          setGame(newGame);
          onFenChangeAction(newFen);
          return;
        }
      }
    }
  };

  const onSquareClick = ({ square }: SquareHandlerArgs) => {
    if (!square) return;

    if (!started) {
      const position = boardToPosition(game);
      if (!(square in position)) return;
      delete position[square];
      const newFen = positionToFen(position);
      const newGame = new Chess();
      newGame.load(newFen);
      setGame(newGame);
      onFenChangeAction(newFen);
      return;
    }

    if (selectedSquare === null) {
      if (game.get(square as Square)) setSelectedSquare(square);
    } else {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        onFenChangeAction(newGame.fen());
      }
      setSelectedSquare(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Chessboard
        options={{
          position: game.fen(),
          showAnimations: true,
          allowDragging: true,
          allowDragOffBoard: true,
          allowDrawingArrows: true,
          showNotation: true,
          boardStyle: { width: size },
          boardOrientation: orientation === "w" ? "white" : "black",
          onPieceDrop: started ? onDrop : onPieceDropFree,
          onSquareClick,
        }}
      />

      {!started && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {palette.map((p) => (
            <button
              key={p}
              onClick={() => addPiece(p)}
              className="w-10 h-10 flex items-center justify-center rounded border bg-white shadow cursor-pointer select-none"
              aria-label={`Add piece ${p}`}
            >
              <span style={{ fontSize: "24px", fontWeight: "bold", userSelect: "none", lineHeight: 1 }}>
                {pieceUnicode(p)}
              </span>
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 rounded bg-yellow-200 text-center font-semibold text-lg">{result}</div>
      )}

      {isEngineThinking && (
        <div className="mt-2 text-center italic text-gray-600">Engine is thinking...</div>
      )}
    </div>
  );
}

const palette = ["P", "R", "N", "B", "Q", "K", "p", "r", "n", "b", "q", "k"];
