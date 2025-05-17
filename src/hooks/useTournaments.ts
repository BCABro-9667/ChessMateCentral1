// src/hooks/useTournaments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/types/tournament';

const TOURNAMENTS_KEY = 'chessmateTournaments';

const initialExampleTournament: Tournament = {
  id: 'example-public-tournament',
  name: 'Grand Annual Chess Championship',
  type: 'Swiss',
  location: 'Community Hall, Downtown',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
  endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // Nine days from now
  entryFee: 25,
  prizeFund: 1000,
  timeControl: '90+30 (90 minutes per player, 30 second increment per move)',
  totalRounds: 5, // Example total rounds
  description: 'Join us for the most anticipated chess event of the year! The Grand Annual Chess Championship brings together players of all levels for a thrilling Swiss-system tournament. Compete for glory and a share of the $1000 prize fund. Held in the spacious Community Hall, this tournament promises excellent playing conditions and a memorable experience. Sharpen your strategies and prepare for intense battles over the board!',
  status: 'Upcoming',
};


export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTournaments = localStorage.getItem(TOURNAMENTS_KEY);
      if (storedTournaments) {
        const parsedTournaments: Tournament[] = JSON.parse(storedTournaments);
        // Ensure the example tournament is always present if no other tournaments are stored or if it's missing
        if (!parsedTournaments.find(t => t.id === initialExampleTournament.id)) {
           setTournaments([initialExampleTournament, ...parsedTournaments.filter(t => t.id !== initialExampleTournament.id)]);
        } else {
            // Ensure existing example tournament has totalRounds if it's from an older version
            const exampleIndex = parsedTournaments.findIndex(t => t.id === initialExampleTournament.id);
            if (exampleIndex !== -1 && parsedTournaments[exampleIndex].totalRounds === undefined) {
                parsedTournaments[exampleIndex].totalRounds = initialExampleTournament.totalRounds;
            }
            setTournaments(parsedTournaments);
        }
      } else {
        // If nothing is stored, initialize with the example tournament
        setTournaments([initialExampleTournament]);
        localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify([initialExampleTournament]));
      }
    } catch (error) {
      console.error("Failed to load tournaments from localStorage", error);
      setTournaments([initialExampleTournament]); // Fallback to example tournament
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTournament = useCallback((tournamentData: Omit<Tournament, 'id' | 'status'>) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tourn_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Upcoming', // Default status for new tournaments
    };
    setTournaments(prevTournaments => {
      const updatedTournaments = [newTournament, ...prevTournaments];
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(updatedTournaments));
      return updatedTournaments;
    });
    return newTournament;
  }, []);
  
  const getTournamentById = useCallback((id: string): Tournament | undefined => {
    return tournaments.find(t => t.id === id);
  }, [tournaments]);

  const updateTournamentStatus = useCallback((id: string, status: Tournament['status']) => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status } : t);
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);


  return { tournaments, addTournament, getTournamentById, updateTournamentStatus, isLoadingTournaments: isLoading };
}
