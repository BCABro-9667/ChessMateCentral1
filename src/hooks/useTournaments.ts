// src/hooks/useTournaments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/types/tournament';

// const TOURNAMENTS_KEY = 'chessmateTournaments_localStorage'; // Changed key to avoid conflict if testing both

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const response = await fetch('/api/tournaments');
      if (!response.ok) {
        throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
      }
      const data: Tournament[] = await response.json();
      setTournaments(data);
    } catch (err) {
      console.error("Failed to load tournaments from API", err);
      setError((err as Error).message);
      setTournaments([]); // Fallback to empty array on error
    } finally {
      setIsLoadingTournaments(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const addTournament = useCallback(async (tournamentData: Omit<Tournament, 'id' | 'status'>) => {
    setIsLoadingTournaments(true); // Or a specific loading state for add
    setError(null);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add tournament: ${response.statusText}`);
      }
      const newTournament: Tournament = await response.json();
      setTournaments(prevTournaments => [newTournament, ...prevTournaments]);
      return newTournament;
    } catch (err) {
      console.error("Failed to add tournament via API", err);
      setError((err as Error).message);
      throw err; // Re-throw to be caught by form
    } finally {
       // Re-fetch all tournaments to ensure consistency or rely on optimistic update
      await fetchTournaments(); // Could be more efficient with optimistic updates
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);
  
  const getTournamentById = useCallback((id: string): Tournament | undefined => {
    // This will still work on the client-side fetched data.
    // For a direct fetch, you'd call `/api/tournaments/${id}`
    return tournaments.find(t => t.id === id);
  }, [tournaments]);

  const updateTournamentStatus = useCallback(async (id: string, status: Tournament['status']) => {
    setError(null);
    const originalTournaments = [...tournaments];
    // Optimistic update
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update tournament status: ${response.statusText}`);
      }
      // If successful, data is already optimistically updated.
      // Optionally, re-fetch the single tournament or all to confirm.
      // await fetchTournaments(); 
    } catch (err) {
      console.error("Failed to update tournament status via API", err);
      setError((err as Error).message);
      setTournaments(originalTournaments); // Rollback optimistic update on error
    }
  }, [tournaments, fetchTournaments]);


  return { 
    tournaments, 
    addTournament, 
    getTournamentById, 
    updateTournamentStatus, 
    isLoadingTournaments,
    errorLoadingTournaments: error,
    refreshTournaments: fetchTournaments // Expose a way to manually refresh
  };
}
