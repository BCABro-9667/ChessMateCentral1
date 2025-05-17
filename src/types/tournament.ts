// src/types/tournament.ts
export interface Tournament {
  id: string;
  name: string;
  type: 'Swiss' | 'Round Robin' | 'Knockout' | 'Arena' | 'Scheveningen' | 'Other';
  location: string;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  entryFee: number;
  prizeFund: number;
  timeControl: string;
  description: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  totalRounds?: number; // New field for total rounds
  // registeredPlayers?: Player[]; // Future enhancement
  // results?: any; // Future enhancement
}

// Example Player type for future use
// export interface Player {
//   id: string;
//   name: string;
//   rating?: number;
//   federation?: string;
// }

export const tournamentTypes: Tournament['type'][] = ['Swiss', 'Round Robin', 'Knockout', 'Arena', 'Scheveningen', 'Other'];
export const tournamentStatuses: Tournament['status'][] = ['Upcoming', 'Active', 'Completed', 'Cancelled'];
