
import React from 'react';
import { GameStatus, UserProfile, Color } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  user: UserProfile | null;
  opponent: UserProfile | null;
  turn: Color;
  userColor?: Color;
  whisper?: string;
  leaderboard: UserProfile[];
  onLogin: () => void;
  onMatchmake: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  status, user, opponent, turn, userColor, whisper, leaderboard, onLogin, onMatchmake 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 text-white font-sans">
      {/* Header Info */}
      <div className="w-full flex justify-between items-start z-20">
        <div className="flex flex-col gap-3">
          {!user ? (
            <button 
              onClick={onLogin} 
              className="pointer-events-auto bg-white text-black px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-tighter hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              <i className="fa-brands fa-google"></i> Connect Identity
            </button>
          ) : (
            <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg"></div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase leading-none mb-1">Commander</p>
                <p className="text-sm font-black leading-none">{user.displayName}</p>
              </div>
            </div>
          )}

          {status === GameStatus.PLAYING && whisper && (
            <div className="max-w-xs animate-in slide-in-from-left duration-700">
               <div className="bg-cyan-500/10 border-l-4 border-cyan-500 px-4 py-3 backdrop-blur-md italic text-cyan-300 text-sm">
                 "{whisper}"
               </div>
            </div>
          )}
        </div>

        {status === GameStatus.PLAYING && opponent && (
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-right flex flex-row-reverse items-center gap-3">
             <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-ghost text-white/20"></i>
             </div>
             <div>
                <p className="text-[10px] font-bold text-white/40 uppercase leading-none mb-1">Opponent</p>
                <p className="text-sm font-black leading-none">{opponent.displayName}</p>
             </div>
          </div>
        )}
      </div>

      {/* Lobby / Matchmaking */}
      {status === GameStatus.LOBBY && (
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto max-w-2xl w-full">
           <div className="text-center mb-12">
              <h1 className="text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2">FOG CHESS</h1>
              <p className="text-cyan-500 font-bold tracking-[0.4em] text-xs uppercase">Strategic Uncertainty Engine</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[40px] flex flex-col items-center">
                 <h3 className="text-xl font-black mb-6 italic">WAR ROOM</h3>
                 <button 
                   onClick={onMatchmake}
                   disabled={!user}
                   className={`w-full py-5 rounded-full font-black text-xl tracking-tighter transition-all ${user ? 'bg-white text-black hover:bg-cyan-400' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                 >
                   ENTER MATCHMAKING
                 </button>
                 <p className="text-[10px] text-white/20 mt-4 uppercase font-bold">Standard 10min Match</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[40px]">
                 <h3 className="text-sm font-black text-white/40 uppercase mb-4 tracking-widest">Global Ranks</h3>
                 <div className="space-y-4">
                    {leaderboard.map((player, i) => (
                      <div key={player.uid} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-sm font-bold text-white/80">{i+1}. {player.displayName}</span>
                        <span className="text-xs font-black text-cyan-500">{player.rating}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {status === GameStatus.MATCHMAKING && (
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto text-center">
          <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-8"></div>
          <h2 className="text-4xl font-black italic mb-2">SEARCHING...</h2>
          <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Finding a suitable battlefield</p>
        </div>
      )}

      {/* Gameplay HUD Bottom */}
      {status === GameStatus.PLAYING && (
        <div className="w-full flex justify-between items-end mb-4">
           <div className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${turn === userColor ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-white/10 text-white/40'}`}>
              {turn === userColor ? 'Your Deployment' : "Opponent's Move"}
           </div>
           
           <div className="bg-black/40 px-6 py-2 rounded-xl text-[10px] font-bold text-white/30 uppercase tracking-tighter text-right">
              Visible: {userColor === 'w' ? 'North' : 'South'} Quadrants Revealed
           </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
