
import React, { useState, useMemo } from 'react';
import { BoardState, Color, Piece, GameStatus } from '../types';
import { calculateVisibility, getPossibleMoves } from '../services/chessEngine';

interface ChessBoardProps {
  board: BoardState;
  turn: Color;
  userColor: Color;
  onMove: (from: [number, number], to: [number, number]) => void;
  status: GameStatus;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ board, turn, userColor, onMove, status }) => {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  
  const visibility = useMemo(() => calculateVisibility(userColor, board), [board, userColor]);
  
  const possibleMoves = useMemo(() => {
    if (!selected) return [];
    return getPossibleMoves(selected[0], selected[1], board);
  }, [selected, board]);

  const handleSquareClick = (r: number, c: number) => {
    if (status !== GameStatus.PLAYING || turn !== userColor) return;

    if (selected) {
      const move = possibleMoves.find(([mr, mc]) => mr === r && mc === c);
      if (move) {
        onMove(selected, [r, c]);
        setSelected(null);
        return;
      }
    }

    const piece = board[r][c];
    if (piece && piece.color === userColor) {
      setSelected([r, c]);
    } else {
      setSelected(null);
    }
  };

  const renderPiece = (piece: Piece) => {
    const symbols: Record<string, string> = {
      p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
    };
    return (
      <span className={`text-4xl select-none ${piece.color === 'w' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}>
        {symbols[piece.type]}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-8 grid-rows-8 w-[min(90vw,600px)] aspect-square border-4 border-slate-800 bg-slate-900 rounded-lg overflow-hidden shadow-2xl relative">
      {/* Fog Background Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/fog.png')] animate-pulse"></div>
      
      {board.map((row, r) => 
        row.map((piece, c) => {
          const isVisible = visibility.has(`${r},${c}`);
          const isSelected = selected && selected[0] === r && selected[1] === c;
          const isTarget = possibleMoves.some(([mr, mc]) => mr === r && mc === c);
          const isDark = (r + c) % 2 === 1;

          return (
            <div 
              key={`${r}-${c}`}
              onClick={() => handleSquareClick(r, c)}
              className={`
                relative flex items-center justify-center cursor-pointer transition-all duration-300
                ${isDark ? 'bg-slate-800' : 'bg-slate-700'}
                ${isVisible ? '' : 'brightness-[0.15] grayscale'}
                ${isSelected ? 'bg-cyan-900/50' : ''}
              `}
            >
              {/* Visible Indicator */}
              {isVisible && (
                <div className="absolute inset-0 border border-white/5 pointer-events-none"></div>
              )}

              {/* Move Indicator */}
              {isTarget && (
                <div className="w-4 h-4 rounded-full bg-cyan-400/40 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
              )}

              {/* Piece Rendering - ONLY if visible */}
              {isVisible && piece && renderPiece(piece)}

              {/* Coordinates (Edge only) */}
              {(c === 0 || r === 7) && (
                <span className="absolute bottom-0 left-0.5 text-[8px] font-bold text-white/20 uppercase">
                  {c === 0 ? 8 - r : ''}{r === 7 ? String.fromCharCode(97 + c) : ''}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;
