
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameStatus, GameState } from './types';
import { generateLore, generateDeathReason } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START,
    score: 0,
    highScore: parseInt(localStorage.getItem('temple_runner_highscore') || '0'),
    speed: 0.5,
    distance: 0,
  });

  const [currentLore, setCurrentLore] = useState<string>('');
  const [deathReason, setDeathReason] = useState<string>('');
  const lastLoreScoreRef = useRef(0);

  const handleStart = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      distance: 0,
      deathReason: undefined,
    }));
    setCurrentLore('');
    lastLoreScoreRef.current = 0;
  }, []);

  const handleGameOver = useCallback(async () => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.highScore, prev.score);
      localStorage.setItem('temple_runner_highscore', newHighScore.toString());
      return {
        ...prev,
        status: GameStatus.GAMEOVER,
        highScore: newHighScore
      };
    });

    const reason = await generateDeathReason(gameState.score);
    setDeathReason(reason);
  }, [gameState.score]);

  const handleScoreUpdate = useCallback((score: number) => {
    setGameState(prev => ({ ...prev, score }));
    
    // Generate new lore every 500 points
    if (score > 0 && score % 500 === 0 && score !== lastLoreScoreRef.current) {
      lastLoreScoreRef.current = score;
      generateLore(score).then(setCurrentLore);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <GameCanvas 
        status={gameState.status} 
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
      />
      
      <UIOverlay 
        status={gameState.status}
        score={gameState.score}
        highScore={gameState.highScore}
        deathReason={deathReason}
        lore={currentLore}
        onStart={handleStart}
      />

      {/* Visual FX overlay */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/80" />
      
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-orange-500/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-orange-500/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-orange-500/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-orange-500/40 pointer-events-none" />
    </div>
  );
};

export default App;
