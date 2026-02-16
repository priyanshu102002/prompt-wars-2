
export enum GameStatus {
  LOBBY = 'LOBBY',
  MATCHMAKING = 'MATCHMAKING',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
}

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type BoardState = (Piece | null)[][];

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  rating: number;
  matchesPlayed: number;
}

export interface ChessMatch {
  id: string;
  white: UserProfile;
  black: UserProfile;
  board: BoardState;
  turn: Color;
  history: string[];
  status: 'active' | 'finished';
  winner?: Color | 'draw';
}

export interface GameState {
  status: GameStatus;
  userColor?: Color;
  score: number;
  highScore: number;
}
