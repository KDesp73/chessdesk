"use client";

import { useState, useEffect, useCallback } from "react";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess, PieceSymbol } from "chess.js";

interface BoardProps {
  fen: string;
  orientation: "w" | "b";
  started: boolean;
  onFenChange: (fen: string) => void;
}

export default function Board({
  fen,
  orientation,
  started,
  onFenChange,
}: BoardProps) {
  const [game, setGame] = useState(new Chess());
  const [result, setResult] = useState<string | null>(null);

  // Function to check game result
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
    }
  }, []);

  // Sync game state with fen prop
  useEffect(() => {
    if (fen === "start") {
      const newGame = new Chess();
      setGame(newGame);
      onFenChange(newGame.fen());
    } else {
      const newGame = new Chess();
      newGame.load(fen);
      setGame(newGame);
    }
  }, [fen, onFenChange]);

  // Run updateResult whenever the game state changes
  useEffect(() => {
    updateResult(game);
  }, [game, updateResult]);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!started) return false;
      if (targetSquare == null) return false;

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (move === null) return false;
      } catch (err) {
        console.error(err);
        return false;
      }

      const newGame = new Chess(game.fen());
      setGame(newGame);
      onFenChange(newGame.fen());
      // No need to call updateResult here explicitly, it's handled by useEffect on game change
      return true;
    },
    [game, onFenChange, started]
  );

  const onPieceDropFree = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (started) return false;
      if (targetSquare == null) return false;

      const position = { ...game.board().reduce<Record<string, { type: string; color: string }>>((acc, row, rankIndex) => {
        row.forEach((square, fileIndex) => {
          if (square) {
            const file = "abcdefgh"[fileIndex];
            const rank = 8 - rankIndex;
            acc[file + rank] = { type: square.type, color: square.color };
          }
        });
        return acc;
      }, {})};

      if (!(sourceSquare in position)) return false;
      position[targetSquare] = position[sourceSquare];
      delete position[sourceSquare];

      const ranksFen = [];
      for (let rank = 8; rank >= 1; rank--) {
        let fenRow = "";
        let emptyCount = 0;
        for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
          const square = "abcdefgh"[fileIdx] + rank;
          if (position[square]) {
            if (emptyCount) {
              fenRow += emptyCount;
              emptyCount = 0;
            }
            const p = position[square];
            const letter = p.color === "w" ? p.type.toUpperCase() : p.type.toLowerCase();
            fenRow += letter;
          } else {
            emptyCount++;
          }
        }
        if (emptyCount) fenRow += emptyCount;
        ranksFen.push(fenRow);
      }
      const newFen = ranksFen.join("/") + " w - - 0 1";

      const newGame = new Chess();
      newGame.load(newFen);
      setGame(newGame);
      onFenChange(newFen);

      return true;
    },
    [game, onFenChange, started]
  );

  const palette = [
    "P", "R", "N", "B", "Q", "K",
    "p", "r", "n", "b", "q", "k",
  ];

  const addPiece = (piece: string) => {
    if (started) return;

    const position = { ...game.board().reduce<Record<string, { type: string; color: string }>>((acc, row, rankIndex) => {
      row.forEach((square, fileIndex) => {
        if (square) {
          const file = "abcdefgh"[fileIndex];
          const rank = 8 - rankIndex;
          acc[file + rank] = { type: square.type, color: square.color };
        }
      });
      return acc;
    }, {})};

    for (let rank = 8; rank >= 1; rank--) {
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const square = "abcdefgh"[fileIdx] + rank;
        if (!(square in position)) {
          const color = piece === piece.toUpperCase() ? "w" : "b";
          const type = piece.toLowerCase() as PieceSymbol;
          position[square] = { type, color };
          const ranksFen = [];
          for (let r = 8; r >= 1; r--) {
            let fenRow = "";
            let emptyCount = 0;
            for (let f = 0; f < 8; f++) {
              const sq = "abcdefgh"[f] + r;
              if (position[sq]) {
                if (emptyCount) {
                  fenRow += emptyCount;
                  emptyCount = 0;
                }
                const p = position[sq];
                const letter = p.color === "w" ? p.type.toUpperCase() : p.type.toLowerCase();
                fenRow += letter;
              } else {
                emptyCount++;
              }
            }
            if (emptyCount) fenRow += emptyCount;
            ranksFen.push(fenRow);
          }
          const newFen = ranksFen.join("/") + " w - - 0 1";

          const newGame = new Chess();
          newGame.load(newFen);
          setGame(newGame);
          onFenChange(newFen);
          return;
        }
      }
    }
  };

  const onSquareClick = ({ square }: SquareHandlerArgs) => {
    if (started) return;

    const position = { ...game.board().reduce<Record<string, { type: string; color: string }>>((acc, row, rankIndex) => {
      row.forEach((square, fileIndex) => {
        if (square) {
          const file = "abcdefgh"[fileIndex];
          const rank = 8 - rankIndex;
          acc[file + rank] = { type: square.type, color: square.color };
        }
      });
      return acc;
    }, {})};

    if (!(square in position)) return;

    delete position[square];

    const ranksFen = [];
    for (let r = 8; r >= 1; r--) {
      let fenRow = "";
      let emptyCount = 0;
      for (let f = 0; f < 8; f++) {
        const sq = "abcdefgh"[f] + r;
        if (position[sq]) {
          if (emptyCount) {
            fenRow += emptyCount;
            emptyCount = 0;
          }
          const p = position[sq];
          const letter = p.color === "w" ? p.type.toUpperCase() : p.type.toLowerCase();
          fenRow += letter;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount) fenRow += emptyCount;
      ranksFen.push(fenRow);
    }
    const newFen = ranksFen.join("/") + " w - - 0 1";

    const newGame = new Chess();
    newGame.load(newFen);
    setGame(newGame);
    onFenChange(newFen);
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
          boardStyle: {
            width: 700,
          },
          boardOrientation: orientation === "w" ? "white" : "black",
          onPieceDrop: started ? onDrop : onPieceDropFree,
          onSquareClick: onSquareClick,
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
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  userSelect: "none",
                  lineHeight: 1,
                }}
              >
                {pieceUnicode(p)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Show result message if game ended */}
      {result && (
        <div className="mt-4 p-3 rounded bg-yellow-200 text-center font-semibold text-lg">
          {result}
        </div>
      )}
    </div>
  );
}

function pieceUnicode(piece: string) {
  const map: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟︎",
  };
  return map[piece] || piece;
}
