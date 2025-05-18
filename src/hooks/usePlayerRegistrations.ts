// src/hooks/usePlayerRegistrations.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { PlayerRegistration } from '@/types/playerRegistration';

export function usePlayerRegistrations() {
  const [registrationsByTournament, setRegistrationsByTournament] = useState<Record<string, PlayerRegistration[]>>({});
  const [isLoading, setIsLoading] = useState(false); // General loading for any operation
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrationsByTournamentId = useCallback(async (tournamentId: string) => {
    if (!tournamentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/by-tournament/${tournamentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch registrations for tournament ${tournamentId}`);
      }
      const data: PlayerRegistration[] = await response.json();
      setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: data }));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setRegistrationsByTournament(prev => ({ ...prev, [tournamentId]: [] })); // Set empty on error for this tournament
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getRegistrationsByTournamentId = useCallback((tournamentId: string): PlayerRegistration[] => {
    return registrationsByTournament[tournamentId] || [];
  }, [registrationsByTournament]);


  const addRegistration = useCallback(async (registrationData: Omit<PlayerRegistration, 'id' | 'registrationDate'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add registration');
      }
      const newRegistration: PlayerRegistration = await response.json();
      // Re-fetch registrations for the specific tournament to update the list
      await fetchRegistrationsByTournamentId(newRegistration.tournamentId);
      return newRegistration;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err; // Re-throw for form handling
    } finally {
      setIsLoading(false);
    }
  }, [fetchRegistrationsByTournamentId]);

  const updateRegistration = useCallback(async (registrationId: string, updates: Partial<PlayerRegistration>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update registration');
      }
      const updatedRegistration: PlayerRegistration = await response.json();
      // Re-fetch registrations for the specific tournament
      if (updatedRegistration.tournamentId) {
        await fetchRegistrationsByTournamentId(updatedRegistration.tournamentId);
      }
      return updatedRegistration;
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRegistrationsByTournamentId]);

  const deleteRegistration = useCallback(async (registrationId: string, tournamentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete registration');
      }
      // Re-fetch registrations for the specific tournament
      if (tournamentId) {
         await fetchRegistrationsByTournamentId(tournamentId);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRegistrationsByTournamentId]);
  
  // Note: getRegistrationById is less critical now as data is fetched per tournament
  // If needed, it would require knowing the tournamentId or fetching from a global list (not implemented)

  return {
    registrationsByTournament, // This now holds fetched data per tournament ID
    getRegistrationsByTournamentId,
    fetchRegistrationsByTournamentId, // Expose this for pages to call when tournamentId is known
    addRegistration,
    updateRegistration,
    deleteRegistration,
    isLoadingRegistrations: isLoading,
    errorRegistrations: error,
  };
}
