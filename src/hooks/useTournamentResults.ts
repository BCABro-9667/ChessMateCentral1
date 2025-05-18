// src/hooks/useTournamentResults.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TournamentResult, PlayerScore } from '@/types/tournamentResult';
import type { PlayerRegistration } from '@/types/playerRegistration';

export function useTournamentResults() {
  const [currentTournamentResult, setCurrentTournamentResult] = useState<TournamentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResultsForTournament = useCallback(async (tournamentId: string) => {
    if (!tournamentId) {
      setCurrentTournamentResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/results/${tournamentId}`);
      if (!response.ok) {
        if (response.status === 404) { // Or if API returns specific structure for no results
             setCurrentTournamentResult({ tournamentId, playerScores: [] }); // Treat as empty results
             return;
        }
        throw new Error(`Failed to fetch results for tournament ${tournamentId}`);
      }
      const data: TournamentResult = await response.json();
      setCurrentTournamentResult(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setCurrentTournamentResult({ tournamentId, playerScores: [] }); // Fallback to empty on error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getResultsForTournament = useCallback((): TournamentResult | undefined => {
    // Returns the currently fetched/managed tournament result.
    // Ensure the tournamentId matches if you are managing multiple results elsewhere,
    // but for this hook's design, it focuses on one tournament's results at a time.
    return currentTournamentResult || undefined;
  }, [currentTournamentResult]);

  const calculateTotalScore = (roundScores: (number | null)[]): number => {
    return roundScores.reduce((acc: number, score: number | null) => acc + (score || 0), 0);
  };

  const saveTournamentResults = useCallback(async (tournamentResultData: TournamentResult) => {
    if (!tournamentResultData.tournamentId) {
      setError("Tournament ID is missing for saving results.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/results/${tournamentResultData.tournamentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentResultData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save tournament results');
      }
      const savedData: TournamentResult = await response.json();
      setCurrentTournamentResult(savedData); // Update local state with saved data (potentially with _id from DB)
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      throw err; // Re-throw for form handling
    } finally {
      setIsLoading(false);
    }
  }, []);


  const initializeOrUpdateTournamentResults = useCallback((
    tournamentId: string,
    registeredPlayers: PlayerRegistration[],
    totalRounds: number
  ): void => {
    
    setCurrentTournamentResult(prevResult => {
      let baseResult = prevResult && prevResult.tournamentId === tournamentId 
                        ? { ...prevResult } 
                        : { tournamentId, playerScores: [] };
      
      let updatedPlayerScores: PlayerScore[];

      const registeredPlayerIds = new Set(registeredPlayers.map(p => p.id));
      
      updatedPlayerScores = baseResult.playerScores
        .filter(ps => registeredPlayerIds.has(ps.playerId))
        .map(ps => {
          const playerRegInfo = registeredPlayers.find(p => p.id === ps.playerId);
          const newRoundScores = [...ps.roundScores];
          while (newRoundScores.length < totalRounds) {
            newRoundScores.push(null);
          }
          const finalRoundScores = newRoundScores.slice(0, totalRounds);
          return {
            ...ps,
            playerName: playerRegInfo ? playerRegInfo.playerName : ps.playerName,
            fideRating: playerRegInfo ? playerRegInfo.fideRating : ps.fideRating,
            roundScores: finalRoundScores,
            totalScore: calculateTotalScore(finalRoundScores)
          };
        });

      registeredPlayers.forEach(player => {
        if (!updatedPlayerScores.find(ps => ps.playerId === player.id)) {
          updatedPlayerScores.push({
            playerId: player.id,
            playerName: player.playerName,
            fideRating: player.fideRating,
            roundScores: Array(totalRounds).fill(null),
            totalScore: 0,
          });
        }
      });
      
      const newTournamentResult = { ...baseResult, playerScores: updatedPlayerScores };
      saveTournamentResults(newTournamentResult); // Automatically save after initializing/updating
      return newTournamentResult;
    });
  }, [saveTournamentResults]);


  const updatePlayerRoundScore = useCallback((
    tournamentId: string,
    playerId: string,
    roundIndex: number, // 0-based index
    score: number | null
  ) => {
    setCurrentTournamentResult(prevResult => {
      if (!prevResult || prevResult.tournamentId !== tournamentId) {
        console.warn("No current result for this tournament ID, or mismatch. Cannot update score.");
        return prevResult;
      }

      const playerScoresIndex = prevResult.playerScores.findIndex(ps => ps.playerId === playerId);
      
      if (playerScoresIndex === -1) {
        console.warn("Player score not found for update.", playerId, "in tournament", tournamentId);
        return prevResult;
      }

      const updatedPlayerScores = [...prevResult.playerScores];
      const updatedPlayerScoreItem = { ...updatedPlayerScores[playerScoresIndex] };
      updatedPlayerScoreItem.roundScores = [...updatedPlayerScoreItem.roundScores]; 
      
      if (roundIndex >= 0 && roundIndex < updatedPlayerScoreItem.roundScores.length) {
        updatedPlayerScoreItem.roundScores[roundIndex] = score;
        updatedPlayerScoreItem.totalScore = calculateTotalScore(updatedPlayerScoreItem.roundScores);
        updatedPlayerScores[playerScoresIndex] = updatedPlayerScoreItem;
        
        const newTournamentResult = { ...prevResult, playerScores: updatedPlayerScores };
        saveTournamentResults(newTournamentResult); // Save the entire updated result set
        return newTournamentResult;
      }
      console.warn("Round index out of bounds for update.", roundIndex, "player", playerId);
      return prevResult;
    });
  }, [saveTournamentResults]);
  
  return {
    isLoadingResults: isLoading,
    currentTournamentResult,
    errorResults: error,
    fetchResultsForTournament,
    getResultsForTournament, // Kept for compatibility if some components expect direct sync return
    initializeOrUpdateTournamentResults,
    updatePlayerRoundScore,
    // saveTournamentResults is used internally by initialize and updatePlayerRoundScore but can be exposed if needed
  };
}
