// src/hooks/useTournamentResults.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TournamentResult, PlayerScore } from '@/types/tournamentResult';
import type { PlayerRegistration } from '@/types/playerRegistration';

const RESULTS_KEY_PREFIX = 'chessmateTournamentResults_'; // Prefix to avoid conflicts

export function useTournamentResults() {
  const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all results from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    const loadedResults: TournamentResult[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(RESULTS_KEY_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            loadedResults.push(JSON.parse(item));
          } catch (error) {
            console.error(`Failed to parse tournament result from localStorage key ${key}:`, error);
          }
        }
      }
    }
    setTournamentResults(loadedResults);
    setIsLoading(false);
  }, []);

  const getResultsForTournament = useCallback((tournamentId: string): TournamentResult | undefined => {
    return tournamentResults.find(tr => tr.tournamentId === tournamentId);
  }, [tournamentResults]);

  const calculateTotalScore = (roundScores: (number | null)[]): number => {
    return roundScores.reduce((acc: number, score: number | null) => acc + (score || 0), 0);
  };

  const initializeOrUpdateTournamentResults = useCallback((
    tournamentId: string,
    registeredPlayers: PlayerRegistration[],
    totalRounds: number
  ): void => { // Return type is void
    
    setTournamentResults(prevResults => {
      let existingTournamentResult = prevResults.find(tr => tr.tournamentId === tournamentId);
      let updatedPlayerScores: PlayerScore[];

      if (existingTournamentResult) {
        // Update existing: add new players, remove players no longer registered, ensure roundScores length matches
        const registeredPlayerIds = new Set(registeredPlayers.map(p => p.id));
        
        updatedPlayerScores = existingTournamentResult.playerScores
          .filter(ps => registeredPlayerIds.has(ps.playerId)) // Keep only currently registered players
          .map(ps => { // Ensure existing players have correct number of rounds and updated info
            const playerRegInfo = registeredPlayers.find(p => p.id === ps.playerId);
            const newRoundScores = [...ps.roundScores];
            while (newRoundScores.length < totalRounds) {
              newRoundScores.push(null);
            }
            // Truncate if totalRounds decreased
            const finalRoundScores = newRoundScores.slice(0, totalRounds); 
            return {
              ...ps,
              playerName: playerRegInfo ? playerRegInfo.playerName : ps.playerName, // Update name if changed
              fideRating: playerRegInfo ? playerRegInfo.fideRating : ps.fideRating, // Update rating if changed
              roundScores: finalRoundScores, 
              totalScore: calculateTotalScore(finalRoundScores)
            };
          });

        // Add new players
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
        
        existingTournamentResult = { ...existingTournamentResult, playerScores: updatedPlayerScores };

      } else {
        // Initialize new
        updatedPlayerScores = registeredPlayers.map(player => ({
          playerId: player.id,
          playerName: player.playerName,
          fideRating: player.fideRating,
          roundScores: Array(totalRounds).fill(null),
          totalScore: 0,
        }));
        existingTournamentResult = { tournamentId, playerScores: updatedPlayerScores };
      }
      
      const newResultsList = prevResults.filter(tr => tr.tournamentId !== tournamentId).concat(existingTournamentResult);
      localStorage.setItem(`${RESULTS_KEY_PREFIX}${tournamentId}`, JSON.stringify(existingTournamentResult));
      return newResultsList;
    });
  }, []); // Empty dependency array: function identity is stable


  const updatePlayerRoundScore = useCallback((
    tournamentId: string,
    playerId: string,
    roundIndex: number, // 0-based index
    score: number | null
  ) => {
    setTournamentResults(prevResults => {
      const tournamentResultIndex = prevResults.findIndex(tr => tr.tournamentId === tournamentId);
      if (tournamentResultIndex === -1) {
        console.warn("Tournament result not found for update, should have been initialized.", tournamentId);
        return prevResults;
      }

      const updatedTournamentResult = { ...prevResults[tournamentResultIndex] };
      const playerScoresIndex = updatedTournamentResult.playerScores.findIndex(ps => ps.playerId === playerId);
      
      if (playerScoresIndex === -1) {
        console.warn("Player score not found for update.", playerId, "in tournament", tournamentId);
        return prevResults;
      }

      const updatedPlayerScoreItem = { ...updatedTournamentResult.playerScores[playerScoresIndex] };
      updatedPlayerScoreItem.roundScores = [...updatedPlayerScoreItem.roundScores]; // Ensure new array
      
      if (roundIndex >= 0 && roundIndex < updatedPlayerScoreItem.roundScores.length) {
        updatedPlayerScoreItem.roundScores[roundIndex] = score;
        updatedPlayerScoreItem.totalScore = calculateTotalScore(updatedPlayerScoreItem.roundScores);

        updatedTournamentResult.playerScores = [
          ...updatedTournamentResult.playerScores.slice(0, playerScoresIndex),
          updatedPlayerScoreItem,
          ...updatedTournamentResult.playerScores.slice(playerScoresIndex + 1),
        ];
        
        const newResultsList = [...prevResults];
        newResultsList[tournamentResultIndex] = updatedTournamentResult;
        localStorage.setItem(`${RESULTS_KEY_PREFIX}${tournamentId}`, JSON.stringify(updatedTournamentResult));
        return newResultsList;
      }
      console.warn("Round index out of bounds for update.", roundIndex, "player", playerId);
      return prevResults; // No change if roundIndex is out of bounds
    });
  }, []); // Empty dependency array: function identity is stable
  
  return {
    isLoadingResults: isLoading,
    getResultsForTournament,
    initializeOrUpdateTournamentResults,
    updatePlayerRoundScore,
  };
}
