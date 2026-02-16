
import { Piece, Color, BoardState, PieceType } from '../types';

export const INITIAL_BOARD: BoardState = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill({ type: 'p', color: 'b' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'p', color: 'w' }),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ],
];

export function getPossibleMoves(r: number, c: number, board: BoardState): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const dir = piece.color === 'w' ? -1 : 1;

  const addIfOnBoard = (row: number, col: number) => {
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      const target = board[row][col];
      if (!target || target.color !== piece.color) {
        moves.push([row, col]);
        return !target; // keep going if empty
      }
    }
    return false;
  };

  switch (piece.type) {
    case 'p':
      // Forward
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        // Double move
        if ((piece.color === 'w' && r === 6) || (piece.color === 'b' && r === 1)) {
          if (!board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
        }
      }
      // Captures
      [-1, 1].forEach(dc => {
        const tr = r + dir, tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = board[tr][tc];
          if (target && target.color !== piece.color) moves.push([tr, tc]);
        }
      });
      break;

    case 'n':
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        addIfOnBoard(r + dr, c + dc);
      });
      break;

    case 'r':
    case 'b':
    case 'q':
      const directions = piece.type === 'r' ? [[0, 1], [0, -1], [1, 0], [-1, 0]] :
                         piece.type === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
                         [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      directions.forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc;
        while (addIfOnBoard(nr, nc)) {
          nr += dr; nc += dc;
        }
      });
      break;

    case 'k':
      [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
        addIfOnBoard(r + dr, c + dc);
      });
      break;
  }

  return moves;
}

export function calculateVisibility(color: Color, board: BoardState): Set<string> {
  const visible = new Set<string>();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        visible.add(`${r},${c}`);
        const moves = getPossibleMoves(r, c, board);
        moves.forEach(([mr, mc]) => visible.add(`${mr},${mc}`));
      }
    }
  }
  return visible;
}
