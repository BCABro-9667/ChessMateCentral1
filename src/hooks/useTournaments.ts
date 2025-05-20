// src/hooks/useTournaments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/types/tournament';

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
      setTournaments([]); 
    } finally {
      setIsLoadingTournaments(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const addTournament = useCallback(async (tournamentData: Omit<Tournament, 'id' | 'status'>) => {
    setIsLoadingTournaments(true); 
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
      // setTournaments(prevTournaments => [newTournament, ...prevTournaments].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
      await fetchTournaments(); // Re-fetch to ensure sorted list and single source of truth
      return newTournament;
    } catch (err) {
      console.error("Failed to add tournament via API", err);
      setError((err as Error).message);
      throw err; 
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);
  
  const getTournamentById = useCallback((id: string): Tournament | undefined => {
    return tournaments.find(t => t.id === id);
  }, [tournaments]);

  const updateTournament = useCallback(async (id: string, tournamentData: Omit<Tournament, 'id' | 'status'>) => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update tournament: ${response.statusText}`);
      }
      const updatedTournament: Tournament = await response.json();
      // setTournaments(prev => prev.map(t => (t.id === id ? updatedTournament : t)).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
      await fetchTournaments(); // Re-fetch for consistency
      return updatedTournament;
    } catch (err) {
      console.error(`Failed to update tournament ${id} via API`, err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);

  const updateTournamentStatus = useCallback(async (id: string, status: Tournament['status']) => {
    setError(null);
    const originalTournaments = [...tournaments];
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }), // Only sending status for this specific function
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update tournament status: ${response.statusText}`);
      }
       await fetchTournaments(); 
    } catch (err) {
      console.error("Failed to update tournament status via API", err);
      setError((err as Error).message);
      setTournaments(originalTournaments); 
    }
  }, [tournaments, fetchTournaments]);

  const deleteTournament = useCallback(async (id: string) => {
    setIsLoadingTournaments(true);
    setError(null);
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete tournament: ${response.statusText}`);
      }
      // setTournaments(prev => prev.filter(t => t.id !== id));
      await fetchTournaments(); // Re-fetch
    } catch (err) {
      console.error(`Failed to delete tournament ${id} via API`, err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoadingTournaments(false);
    }
  }, [fetchTournaments]);


  return { 
    tournaments, 
    addTournament, 
    getTournamentById,
    updateTournament,
    updateTournamentStatus, 
    deleteTournament,
    isLoadingTournaments,
    errorLoadingTournaments: error,
    refreshTournaments: fetchTournaments 
  };
}
