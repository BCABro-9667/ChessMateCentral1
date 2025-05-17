// src/types/playerRegistration.ts
export interface PlayerRegistration {
  id: string;
  tournamentId: string;
  tournamentName: string; // For easier display
  playerName: string;
  playerEmail?: string;
  registrationDate: string; // ISO string
  feePaid: boolean; // Simple mock status

  // New fields
  gender?: string;
  dob?: string; // Store as string (YYYY-MM-DD from date input)
  organization?: string; // For School/College/Club
  mobile?: string;
  fideRating: number; // Will default to 0 if not provided
  fideId: string;     // Will default to '-' if not provided
}
