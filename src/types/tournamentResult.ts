// src/types/tournamentResult.ts

// Represents the scores for a single player in a tournament
export interface PlayerScore {
  playerId: string; // Corresponds to PlayerRegistration.id
  playerName: string; // For display convenience, taken from PlayerRegistration
  fideRating?: number; // For display convenience
  // Array where index = round number - 1. Value can be 0, 0.5, 1, or null.
  roundScores: (number | null)[]; 
  totalScore: number;
}

// Represents all results for a single tournament
export interface TournamentResult {
  tournamentId: string;
  playerScores: PlayerScore[];
}
