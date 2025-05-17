// src/hooks/usePlayerRegistrations.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { PlayerRegistration } from '@/types/playerRegistration';

const REGISTRATIONS_KEY = 'chessmatePlayerRegistrations';

export function usePlayerRegistrations() {
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRegistrations = localStorage.getItem(REGISTRATIONS_KEY);
      if (storedRegistrations) {
        setRegistrations(JSON.parse(storedRegistrations));
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Failed to load registrations from localStorage", error);
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRegistration = useCallback((registrationData: Omit<PlayerRegistration, 'id' | 'registrationDate'>) => {
    const newRegistration: PlayerRegistration = {
      ...registrationData,
      id: `reg_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      registrationDate: new Date().toISOString(),
    };
    setRegistrations(prevRegistrations => {
      const updatedRegistrations = [newRegistration, ...prevRegistrations];
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updatedRegistrations));
      return updatedRegistrations;
    });
    return newRegistration;
  }, []);

  const getRegistrationsByTournamentId = useCallback((tournamentId: string): PlayerRegistration[] => {
    return registrations.filter(reg => reg.tournamentId === tournamentId).sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
  }, [registrations]);
  
  const getRegistrationById = useCallback((registrationId: string): PlayerRegistration | undefined => {
    return registrations.find(reg => reg.id === registrationId);
  }, [registrations]);

  const updateRegistration = useCallback((registrationId: string, updates: Partial<PlayerRegistration>) => {
    setRegistrations(prev => {
        const updated = prev.map(r => r.id === registrationId ? {...r, ...updates} : r);
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
        return updated;
    });
  }, []);
  
  const deleteRegistration = useCallback((registrationId: string) => {
    setRegistrations(prev => {
        const updated = prev.filter(r => r.id !== registrationId);
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
        return updated;
    });
  }, []);


  return { 
    registrations, 
    addRegistration, 
    getRegistrationsByTournamentId,
    getRegistrationById,
    updateRegistration,
    deleteRegistration,
    isLoadingRegistrations: isLoading 
  };
}
