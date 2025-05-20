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
import { Users, ArrowLeft, PlusCircle, CheckCircle, XCircle, Loader2, Trash2, Eye } from 'lucide-react';
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

  const { getTournamentById, isLoadingTournaments: isLoadingTournamentDetails } = useTournaments();
  const { 
    getRegistrationsByTournamentId, 
    fetchRegistrationsByTournamentId,
    isLoadingRegistrations, 
    deleteRegistration, 
    updateRegistration,
    errorRegistrations 
  } = usePlayerRegistrations();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const currentRegistrations = getRegistrationsByTournamentId(tournamentId);
  
  useEffect(() => {
    if (!isLoadingTournamentDetails && tournamentId) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournamentDetails, tournamentId, getTournamentById]);

  useEffect(() => {
    if (tournamentId) {
      fetchRegistrationsByTournamentId(tournamentId);
    }
  }, [tournamentId, fetchRegistrationsByTournamentId]);

  const handleDeleteRegistration = async (regId: string, playerName: string) => {
    try {
      await deleteRegistration(regId, tournamentId);
      toast({
        title: "Registration Deleted",
        description: `Registration for ${playerName} has been deleted.`,
      });
    } catch (e) {
      toast({
        title: "Error Deleting Registration",
        description: (e as Error).message || "Could not delete registration.",
        variant: "destructive",
      });
    }
  };

  const toggleFeePaidStatus = async (registration: PlayerRegistration) => {
    try {
      // Create the update payload, explicitly keeping other fields to avoid accidental removal if API structure expects full objects
      const updates: Partial<PlayerRegistration> = { 
        feePaid: !registration.feePaid,
        // To ensure other fields are not lost if the PUT request expects the full object or if `updates` is used to replace the whole doc:
        playerName: registration.playerName,
        playerEmail: registration.playerEmail,
        gender: registration.gender,
        dob: registration.dob,
        organization: registration.organization,
        mobile: registration.mobile,
        fideRating: registration.fideRating,
        fideId: registration.fideId,
        paymentScreenshotUrl: registration.paymentScreenshotUrl,
      };
      await updateRegistration(registration.id, updates);
      toast({
        title: "Payment Status Updated",
        description: `Fee payment status for ${registration.playerName} has been updated.`,
      });
    } catch (e) {
       toast({
        title: "Error Updating Status",
        description: (e as Error).message || "Could not update payment status.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTournamentDetails || tournament === undefined) {
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
  
  if (errorRegistrations) {
    return (
      <div className="space-y-6 text-center text-destructive">
        <h1 className="text-2xl font-bold">Error Loading Registrations</h1>
        <p>{errorRegistrations}</p>
         <Button variant="outline" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
      </div>
    )
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
          <CardTitle>Player List ({isLoadingRegistrations ? <Loader2 className="inline w-4 h-4 animate-spin"/> : currentRegistrations.length})</CardTitle>
          <CardDescription>
            Manage and view players registered for &quot;{tournament?.name}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRegistrations && currentRegistrations.length === 0 ? (
            <div className="space-y-2">
              {[...Array(5)].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !isLoadingRegistrations && currentRegistrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No players registered for this tournament yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>FIDE Rating</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead className="text-center">Fee Paid</TableHead>
                    <TableHead className="text-center">Screenshot</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.playerName}</TableCell>
                      <TableCell>{reg.playerEmail || 'N/A'}</TableCell>
                      <TableCell>{reg.gender || 'N/A'}</TableCell>
                      <TableCell>{reg.fideRating > 0 ? reg.fideRating : 'Unrated'}</TableCell>
                      <TableCell>{reg.organization || 'N/A'}</TableCell>
                      <TableCell>{reg.mobile || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleFeePaidStatus(reg)}
                          className={reg.feePaid ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                          disabled={isLoadingRegistrations}
                          title={reg.feePaid ? "Mark as Unpaid" : "Mark as Paid"}
                        >
                          {isLoadingRegistrations && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {reg.feePaid ? 
                            <CheckCircle className="w-5 h-5 mr-1" /> : 
                            <XCircle className="w-5 h-5 mr-1" />
                          }
                          {reg.feePaid ? 'Paid' : 'Unpaid'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {reg.paymentScreenshotUrl ? (
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="View Payment Screenshot"
                          >
                            <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(reg.registrationDate), 'PPp')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Registration" className="text-destructive hover:text-destructive/80" disabled={isLoadingRegistrations}>
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
