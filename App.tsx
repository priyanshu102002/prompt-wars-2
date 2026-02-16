
import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from './components/ChessBoard';
import UIOverlay from './components/UIOverlay';
import { GameStatus, GameState, UserProfile, ChessMatch, Color, BoardState } from './types';
import { firebaseService } from './services/firebaseService';
import { getTacticalWhisper } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.LOBBY,
    score: 0,
    highScore: 0,
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [match, setMatch] = useState<ChessMatch | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [whisper, setWhisper] = useState<string>('');
  const [userColor, setUserColor] = useState<Color>('w');

  useEffect(() => {
    firebaseService.getLeaderboard().then(setLeaderboard);
  }, []);

  const handleLogin = async () => {
    const profile = await firebaseService.signInWithGoogle();
    setUser(profile);
  };

  const handleMatchmake = async () => {
    if (!user) return;
    setGameState(prev => ({ ...prev, status: GameStatus.MATCHMAKING }));
    
    // Artificial delay for tension
    setTimeout(async () => {
      const newMatch = await firebaseService.findMatch(user);
      setMatch(newMatch);
      setUserColor(Math.random() > 0.5 ? 'w' : 'b');
      setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
      
      const advice = await getTacticalWhisper('w', newMatch.board);
      setWhisper(advice);
    }, 2000);
  };

  const handleMove = useCallback(async (from: [number, number], to: [number, number]) => {
    if (!match) return;

    const newBoard = [...match.board.map(r => [...r])];
    const piece = newBoard[from[0]][from[1]];
    
    // Check for King capture (End Game)
    const target = newBoard[to[0]][to[1]];
    if (target?.type === 'k') {
      setGameState(prev => ({ ...prev, status: GameStatus.GAMEOVER }));
    }

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;

    const nextTurn = match.turn === 'w' ? 'b' : 'w';
    const updatedMatch = { ...match, board: newBoard, turn: nextTurn };
    
    setMatch(updatedMatch);
    firebaseService.submitMove(match.id, newBoard, nextTurn);

    // Update AI whisper for the new turn
    const advice = await getTacticalWhisper(nextTurn, newBoard);
    setWhisper(advice);
  }, [match]);

  return (
    <div className="relative w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.05)_0%,transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>

      {match && (
        <div className="animate-in fade-in zoom-in duration-1000">
          <ChessBoard 
            board={match.board}
            turn={match.turn}
            userColor={userColor}
            status={gameState.status}
            onMove={handleMove}
          />
        </div>
      )}

      <UIOverlay 
        status={gameState.status}
        user={user}
        opponent={match?.black || null}
        turn={match?.turn || 'w'}
        userColor={userColor}
        whisper={whisper}
        leaderboard={leaderboard}
        onLogin={handleLogin}
        onMatchmake={handleMatchmake}
      />

      {/* Atmospheric Scanning Line */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default App;
