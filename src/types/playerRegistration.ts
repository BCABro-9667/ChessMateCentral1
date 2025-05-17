// src/types/playerRegistration.ts
export interface PlayerRegistration {
  id: string;
  tournamentId: string;
  tournamentName: string; // For easier display
  playerName: string;
  playerEmail?: string;
  registrationDate: string; // ISO string
  feePaid: boolean; // Simple mock status
}
