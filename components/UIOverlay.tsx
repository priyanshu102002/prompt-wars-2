
import React from 'react';
import { GameStatus } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  deathReason?: string;
  lore?: string;
  onStart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  status, 
  score, 
  highScore, 
  deathReason, 
  lore,
  onStart 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8 text-white">
      {/* HUD */}
      <div className="w-full flex justify-between items-start">
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Score</p>
          <p className="text-4xl font-black tabular-nums">{score}</p>
        </div>
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">High Score</p>
          <p className="text-2xl font-black tabular-nums">{highScore}</p>
        </div>
      </div>

      {/* Dynamic Lore */}
      {status === GameStatus.PLAYING && lore && (
        <div className="mb-12 animate-pulse transition-all duration-1000">
          <p className="text-xl italic font-serif text-white/70 text-center max-w-lg">
            "{lore}"
          </p>
        </div>
      )}

      {/* Start Screen */}
      {status === GameStatus.START && (
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
          <h1 className="text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 italic">
            TEMPLE RUNNER
          </h1>
          <p className="text-white/60 mb-12 text-center max-w-sm">
            Escape the ancient guardians. Jump with Space/W, move with Arrows/AD.
          </p>
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 transition-all rounded-full font-bold text-xl overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fa-solid fa-play"></i> START RUNNING
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {status === GameStatus.GAMEOVER && (
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-lg w-full max-w-2xl p-12 rounded-3xl border border-red-500/30">
          <h2 className="text-5xl font-black text-red-500 mb-2">YOU FELL</h2>
          <p className="text-2xl text-white/80 mb-8 italic text-center">
            {deathReason || "The temple claimed its due."}
          </p>
          
          <div className="grid grid-cols-2 gap-8 w-full mb-12">
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-sm uppercase text-white/40 mb-1">Final Score</p>
              <p className="text-4xl font-bold">{score}</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-sm uppercase text-white/40 mb-1">Best</p>
              <p className="text-4xl font-bold">{highScore}</p>
            </div>
          </div>

          <button 
            onClick={onStart}
            className="group relative px-12 py-6 bg-white text-black transition-all rounded-full font-bold text-2xl"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* Bottom Controls Legend */}
      {status === GameStatus.PLAYING && (
        <div className="flex gap-4 text-white/40 text-sm uppercase font-bold tracking-widest">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded">
            <kbd className="bg-white/10 px-2 py-0.5 rounded text-white">←→</kbd> Move
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded">
            <kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Space</kbd> Jump
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
