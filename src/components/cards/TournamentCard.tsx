// src/components/cards/TournamentCard.tsx
import type { Tournament } from '@/types/tournament';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, DollarSign, Trophy, Swords, Info, ListChecks, ClipboardList, Hash, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
import { useTournaments } from '@/hooks/useTournaments'; // For delete action
import { useState } from 'react';

interface TournamentCardProps {
  tournament: Tournament;
  onUpdateStatus?: (id: string, status: Tournament['status']) => void; // For admin actions on dashboard
}

export default function TournamentCard({ tournament, onUpdateStatus }: TournamentCardProps) {
  const { toast } = useToast();
  const { deleteTournament: hookDeleteTournament, isLoadingTournaments } = useTournaments(); // Renamed to avoid conflict
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusVariant = (status: Tournament['status']) => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Upcoming': return 'secondary'; 
      case 'Completed': return 'outline'; 
      case 'Cancelled': return 'destructive'; 
      default: return 'default';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await hookDeleteTournament(tournament.id);
      toast({
        title: "Tournament Deleted",
        description: `"${tournament.name}" has been successfully deleted.`,
      });
      // The list will refresh via the useTournaments hook
    } catch (error) {
      toast({
        title: "Error Deleting Tournament",
        description: (error as Error).message || "Could not delete the tournament.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isDashboardContext = !!onUpdateStatus;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg sm:text-xl mb-1 leading-tight">{tournament.name}</CardTitle>
          <Badge variant={getStatusVariant(tournament.status)} className="ml-2 whitespace-nowrap text-xs">
            {tournament.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-xs sm:text-sm">
          <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-muted-foreground" />
          {tournament.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 flex-grow text-sm">
        <div className="flex items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{tournament.location}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {format(new Date(tournament.startDate), 'MMM dd, yyyy')} - {format(new Date(tournament.endDate), 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Entry Fee: ${tournament.entryFee}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Trophy className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Prize Fund: ${tournament.prizeFund}</span>
        </div>
        {tournament.totalRounds != null && tournament.totalRounds > 0 && (
          <div className="flex items-center text-muted-foreground">
            <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Total Rounds: {tournament.totalRounds}</span>
          </div>
        )}
         <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 pt-1 sm:pt-2">
          <Info className="w-4 h-4 mr-2 inline-block" />
          {tournament.description}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-3 sm:pt-4 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-2">
          <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
            <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
          </Button>
          
          {isDashboardContext && (
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
               <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                  <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive/90 hover:border-destructive/50" disabled={isDeleting || isLoadingTournaments}>
                    {isDeleting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1 h-3.5 w-3.5" />} Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the tournament &quot;{tournament.name}&quot; and all its associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      disabled={isDeleting || isLoadingTournaments}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {(tournament.status === 'Active' || tournament.status === 'Upcoming') && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/tournaments/${tournament.id}/register`}>
                    <Users className="mr-1 h-3.5 w-3.5" /> Register Player
                  </Link>
                </Button>
              )}
               <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/tournaments/${tournament.id}/registrations`}>
                    <ListChecks className="mr-1 h-3.5 w-3.5" /> View Registrations
                  </Link>
                </Button>
               {(tournament.status === 'Active' || tournament.status === 'Upcoming' || tournament.status === 'Completed') && tournament.totalRounds != null && tournament.totalRounds > 0 && (
                   <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/tournaments/${tournament.id}/results`}>
                          <ClipboardList className="mr-1 h-3.5 w-3.5" /> Manage Results
                      </Link>
                   </Button>
               )}
              {tournament.status === 'Upcoming' && (
                  <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Active')} disabled={isLoadingTournaments}>Set Active</Button>
              )}
              {tournament.status === 'Active' && (
                  <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Completed')} disabled={isLoadingTournaments}>Set Completed</Button>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
