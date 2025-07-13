"use client";

import { useState, useEffect, useCallback } from "react";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess, PieceSymbol, Square } from "chess.js";

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
  }, []);

  // Load fen into game state when fen prop changes
  useEffect(() => {
    if (fen === "start") {
      const newGame = new Chess();
      setGame(newGame);
      onFenChangeAction(newGame.fen());
    } else {
      const newGame = new Chess();
      newGame.load(fen);
      setGame(newGame);
    }
  }, [fen, onFenChangeAction]);

  useEffect(() => {
    updateResult(game);
  }, [game, updateResult]);

  const fetchBestMove = useCallback(
      async (currentFen: string) => {
          setIsEngineThinking(true);
          try {
              const response = await fetch("/api/bestmove", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      engine: engine,
                      position: currentFen,
                  }),
              });

              if (!response.ok) {
                  throw new Error(`Engine API error: ${response.statusText}`);
              }

              const data = await response.json();
              return data;
          } catch (error) {
              console.error("Failed to fetch best move:", error);
              return null;
          } finally {
              setIsEngineThinking(false);
          }
      },
      [engine]
  );

  useEffect(() => {
    if (!started) return;
    if (gameMode !== "computer") return;
    if(result != null) return;

    const turn = game.turn(); // 'w' or 'b'
    // Engine moves only when turn !== orientation (opposite color)
    if (turn === orientation) return;
    if (isEngineThinking) return; // avoid multiple parallel calls

    (async () => {
      const response = await fetchBestMove(game.fen());
      if (response) {
        try {
          const move = game.move({
            from: response.from,
            to: response.to,
            promotion: response.promotion
          });
          if (move) {
            const newGame = new Chess(game.fen());
            setGame(newGame);
            onFenChangeAction(newGame.fen());
          }
        } catch (e) {
          console.error("Error applying engine move:", e);
        }
      }
    })();
  }, [started, game, gameMode, orientation, fetchBestMove, onFenChangeAction, isEngineThinking]);

  // Handler for user moves
  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!started) return false;
      if (targetSquare == null) return false;

      // If vs computer, only allow move if it's player's turn
      if (gameMode === "computer" && game.turn() !== orientation) return false;

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
      onFenChangeAction(newGame.fen());
      return true;
    },
    [game, onFenChangeAction, started, gameMode, orientation]
  );

  // Handler for piece drop when game not started (free placement)
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
      onFenChangeAction(newFen);

      return true;
    },
    [game, onFenChangeAction, started]
  );

  // Add a piece to the board when game not started
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
          onFenChangeAction(newFen);
          return;
        }
      }
    }
  };

  // Handle square click (select and move pieces)
  const onSquareClick = ({ square }: SquareHandlerArgs) => {
    if (square == null) return;
    if (!started) {
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
      onFenChangeAction(newFen);
      return;
    }

    if (selectedSquare === null) {
      if (game.get(square as Square)) {
        setSelectedSquare(square);
      }
    } else {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move !== null) {
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
          boardStyle: {
            width: size,
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

      {result && (
        <div className="mt-4 p-3 rounded bg-yellow-200 text-center font-semibold text-lg">
          {result}
        </div>
      )}

      {isEngineThinking && (
        <div className="mt-2 text-center italic text-gray-600">Engine is thinking...</div>
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
