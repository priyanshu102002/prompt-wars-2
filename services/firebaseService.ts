
import { UserProfile, ChessMatch, Color, BoardState } from '../types';
import { INITIAL_BOARD } from './chessEngine';

class FirebaseService {
  async signInWithGoogle(): Promise<UserProfile> {
    return {
      uid: 'uid_' + Math.random().toString(36).substr(2, 9),
      displayName: 'Commander_' + Math.floor(Math.random() * 1000),
      rating: 1200,
      matchesPlayed: 0
    };
  }

  async findMatch(user: UserProfile): Promise<ChessMatch> {
    // Simulate finding an opponent
    const opponent: UserProfile = {
      uid: 'opponent_1',
      displayName: 'GhostStrategist',
      rating: 1250,
      matchesPlayed: 45
    };

    return {
      id: 'match_' + Date.now(),
      white: user,
      black: opponent,
      board: INITIAL_BOARD,
      turn: 'w',
      history: [],
      status: 'active'
    };
  }

  async submitMove(matchId: string, board: BoardState, nextTurn: Color) {
    console.log(`Syncing match ${matchId}: Turn is now ${nextTurn}`);
    // In prod: update Firestore doc
  }

  onMatchUpdate(matchId: string, callback: (match: ChessMatch) => void) {
    // Simulated listener
    const interval = setInterval(() => {
      // Logic for opponent moves would go here
    }, 5000);
    return () => clearInterval(interval);
  }

  async getLeaderboard(): Promise<UserProfile[]> {
    return [
      { uid: '1', displayName: 'GrandmasterFog', rating: 2100, matchesPlayed: 200 },
      { uid: '2', displayName: 'BlindStriker', rating: 1950, matchesPlayed: 150 },
      { uid: '3', displayName: 'InvisibleKing', rating: 1800, matchesPlayed: 90 },
    ];
  }
}

export const firebaseService = new FirebaseService();
