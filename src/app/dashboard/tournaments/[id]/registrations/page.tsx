// src/app/dashboard/tournaments/[id]/registrations/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft, PlusCircle, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function ViewRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { toast } = useToast();

  const { getTournamentById, isLoadingTournaments } = useTournaments();
  const { getRegistrationsByTournamentId, isLoadingRegistrations, deleteRegistration, updateRegistration } = usePlayerRegistrations();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  
  useEffect(() => {
    if (!isLoadingTournaments && tournamentId) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournaments, tournamentId, getTournamentById]);

  useEffect(() => {
    if (tournamentId && !isLoadingRegistrations) {
      const fetchedRegistrations = getRegistrationsByTournamentId(tournamentId);
      setRegistrations(fetchedRegistrations);
    }
  }, [tournamentId, isLoadingRegistrations, getRegistrationsByTournamentId, registrations]); // Added registrations to dep array to re-fetch if modified

  const handleDeleteRegistration = (regId: string, playerName: string) => {
    deleteRegistration(regId);
    toast({
      title: "Registration Deleted",
      description: `Registration for ${playerName} has been deleted.`,
    });
    // The useEffect for registrations will update the list
  };

  const toggleFeePaidStatus = (regId: string, currentStatus: boolean) => {
    updateRegistration(regId, { feePaid: !currentStatus });
     toast({
      title: "Payment Status Updated",
      description: `Fee payment status for the player has been updated.`,
    });
    // The useEffect for registrations will update the list
  };

  if (isLoadingTournaments || tournament === undefined || isLoadingRegistrations) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tournament === null) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Users className="w-8 h-8 mr-3 text-primary" />
          Registered Players: {tournament?.name}
        </h1>
        <div className="flex gap-2">
           {(tournament?.status === 'Active' || tournament?.status === 'Upcoming') && (
            <Button asChild>
                <Link href={`/dashboard/tournaments/${tournamentId}/register`}>
                <PlusCircle className="mr-2 h-4 w-4" /> Register New Player
                </Link>
            </Button>
            )}
          <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player List ({registrations.length})</CardTitle>
          <CardDescription>
            Manage and view players registered for &quot;{tournament?.name}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No players registered for this tournament yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead className="text-center">Fee Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.playerName}</TableCell>
                      <TableCell>{reg.playerEmail || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(reg.registrationDate), 'PPp')}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleFeePaidStatus(reg.id, reg.feePaid)}
                          className={reg.feePaid ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                        >
                          {reg.feePaid ? 
                            <CheckCircle className="w-5 h-5 mr-1" /> : 
                            <XCircle className="w-5 h-5 mr-1" />
                          }
                          {reg.feePaid ? 'Paid' : 'Unpaid'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* <Button variant="ghost" size="icon" className="mr-2" title="Edit Registration (coming soon)" disabled>
                          <Edit3 className="h-4 w-4" />
                        </Button> */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Registration" className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the registration for {reg.playerName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRegistration(reg.id, reg.playerName)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
