import { Chess, PieceSymbol, Square } from "chess.js";

export function pieceUnicode(piece: string): string {
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
    p: "♟",
  };
  return map[piece] || piece;
}

export function boardToPosition(game: Chess): Record<string, { type: string; color: string }> {
  return game.board().reduce<Record<string, { type: string; color: string }>>((acc, row, rankIndex) => {
    row.forEach((square, fileIndex) => {
      if (square) {
        const file = "abcdefgh"[fileIndex];
        const rank = 8 - rankIndex;
        acc[file + rank] = { type: square.type, color: square.color };
      }
    });
    return acc;
  }, {});
}

export function positionToFen(position: Record<string, { type: string; color: string }>): string {
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
  return ranksFen.join("/") + " w - - 0 1";
}
