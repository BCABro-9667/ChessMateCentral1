// src/app/dashboard/tournaments/[id]/results/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { useTournamentResults } from '@/hooks/useTournamentResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import type { PlayerScore } from '@/types/tournamentResult';
import { useToast } from '@/hooks/use-toast';

const scoreOptions = [
  { label: 'Win (1)', value: '1' },
  { label: 'Draw (0.5)', value: '0.5' },
  { label: 'Loss (0)', value: '0' },
  { label: 'Not Played (-)', value: 'null' }, // Use string 'null' for select value
];

export default function ManageResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { toast } = useToast();

  const { getTournamentById, isLoadingTournaments } = useTournaments();
  const { getRegistrationsByTournamentId, isLoadingRegistrations } = usePlayerRegistrations();
  const { 
    isLoadingResults: isLoadingSavedResults, 
    initializeOrUpdateTournamentResults, 
    updatePlayerRoundScore,
    getResultsForTournament
  } = useTournamentResults();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [registeredPlayers, setRegisteredPlayers] = useState<PlayerRegistration[]>([]);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Not currently used as saves are instant

  useEffect(() => {
    if (tournamentId && !isLoadingTournaments) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournaments, tournamentId, getTournamentById]);

  useEffect(() => {
    if (tournamentId && !isLoadingRegistrations) {
      const fetchedRegistrations = getRegistrationsByTournamentId(tournamentId);
      setRegisteredPlayers(fetchedRegistrations);
    }
  }, [isLoadingRegistrations, tournamentId, getRegistrationsByTournamentId]);

  useEffect(() => {
    if (tournament && registeredPlayers.length > 0 && tournament.totalRounds && tournament.totalRounds > 0) {
      const initialScores = initializeOrUpdateTournamentResults(tournament.id, registeredPlayers, tournament.totalRounds);
      setPlayerScores(initialScores);
    } else if (tournament && tournament.totalRounds === 0) {
      setPlayerScores([]); // No rounds, no scores
    }
  }, [tournament, registeredPlayers, initializeOrUpdateTournamentResults]);
  
   // Re-fetch and set player scores if they are updated elsewhere (e.g. by the hook itself)
  useEffect(() => {
    if (tournament && !isLoadingSavedResults) {
      const currentResults = getResultsForTournament(tournament.id);
      if (currentResults) {
        // Sort player scores to match registration order (optional, for consistency)
        const sortedPlayerScores = [...currentResults.playerScores].sort((a, b) => {
            const playerAIndex = registeredPlayers.findIndex(p => p.id === a.playerId);
            const playerBIndex = registeredPlayers.findIndex(p => p.id === b.playerId);
            return playerAIndex - playerBIndex;
        });
        setPlayerScores(sortedPlayerScores);
      }
    }
  }, [isLoadingSavedResults, getResultsForTournament, tournament, registeredPlayers]);


  const handleScoreChange = (playerId: string, roundIndex: number, value: string) => {
    if (!tournament) return;
    const newScore = value === 'null' ? null : parseFloat(value);
    updatePlayerRoundScore(tournament.id, playerId, roundIndex, newScore);
    // playerScores state will update via the useEffect listening to getResultsForTournament
  };
  
  const totalRounds = tournament?.totalRounds || 0;

  if (isLoadingTournaments || tournament === undefined || isLoadingRegistrations || isLoadingSavedResults) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Skeleton className="h-12 w-full mb-2" /> {/* Header row */}
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full mb-1" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tournament === null) {
    notFound();
  }
  
  if (tournament && tournament.status === 'Cancelled') {
     return (
      <div className="space-y-6 text-center">
        <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Results Not Applicable</h1>
        <p className="text-muted-foreground">
          This tournament has been cancelled. Results cannot be managed.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  if (totalRounds === 0) {
    return (
       <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <ClipboardList className="w-8 h-8 mr-3 text-primary" />
            Manage Results: {tournament?.name}
          </h1>
          <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>No Rounds Defined</CardTitle>
                <CardDescription>
                    This tournament has 0 rounds specified. Please edit the tournament to add total rounds to manage results.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <ClipboardList className="w-8 h-8 mr-3 text-primary" />
          Manage Results: {tournament?.name}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Scores</CardTitle>
          <CardDescription>
            Update scores for each player per round. Total rounds: {totalRounds}.
            Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registeredPlayers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No players registered for this tournament yet. Register players first to manage results.</p>
          ) : playerScores.length === 0 && !isLoadingSavedResults ? (
             <p className="text-muted-foreground text-center py-8">Initializing results table... If this persists, ensure the tournament has rounds defined and players are registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 min-w-[150px] md:min-w-[200px]">Player</TableHead>
                    {[...Array(totalRounds)].map((_, i) => (
                      <TableHead key={`round-header-${i + 1}`} className="text-center min-w-[120px]">R{i + 1}</TableHead>
                    ))}
                    <TableHead className="text-center font-semibold min-w-[80px]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerScores.map((ps) => {
                    const playerReg = registeredPlayers.find(p => p.id === ps.playerId);
                    return (
                      <TableRow key={ps.playerId}>
                        <TableCell className="font-medium sticky left-0 bg-card z-10">
                          {ps.playerName}
                          {playerReg?.fideRating && playerReg.fideRating > 0 ? (
                            <span className="text-xs text-muted-foreground ml-1">({playerReg.fideRating})</span>
                          ) : null}
                        </TableCell>
                        {ps.roundScores.map((score, roundIdx) => (
                          <TableCell key={`score-${ps.playerId}-${roundIdx}`} className="text-center">
                            <Select
                              value={score === null ? 'null' : String(score)}
                              onValueChange={(value) => handleScoreChange(ps.playerId, roundIdx, value)}
                              disabled={tournament?.status === 'Completed' || tournament?.status === 'Cancelled'}
                            >
                              <SelectTrigger className="w-[100px] h-9 mx-auto">
                                <SelectValue placeholder="Score" />
                              </SelectTrigger>
                              <SelectContent>
                                {scoreOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">{ps.totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
       {/*
        <div className="flex justify-end mt-6">
            <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Results
            </Button>
        </div>
      */}
    </div>
  );
}
