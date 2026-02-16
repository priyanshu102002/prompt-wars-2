
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  speed: number;
  distance: number;
  deathReason?: string;
}

export interface ObstacleData {
  id: string;
  type: 'hurdle' | 'wall' | 'bridge';
  lane: number; // -1, 0, 1
  z: number;
}
