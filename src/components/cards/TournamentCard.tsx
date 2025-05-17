// src/components/cards/TournamentCard.tsx
import type { Tournament } from '@/types/tournament';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, DollarSign, Trophy, Swords, Info, ListChecks, ClipboardList, Hash } from 'lucide-react'; // Added ClipboardList, Hash
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
  onUpdateStatus?: (id: string, status: Tournament['status']) => void; // Optional: for admin actions
}

export default function TournamentCard({ tournament, onUpdateStatus }: TournamentCardProps) {
  const getStatusVariant = (status: Tournament['status']) => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Upcoming': return 'secondary'; 
      case 'Completed': return 'outline'; 
      case 'Cancelled': return 'destructive'; 
      default: return 'default';
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl mb-1 leading-tight">{tournament.name}</CardTitle>
          <Badge variant={getStatusVariant(tournament.status)} className="ml-2 whitespace-nowrap">
            {tournament.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-sm">
          <Swords className="w-4 h-4 mr-2 text-muted-foreground" />
          {tournament.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
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
        {tournament.totalRounds && (
          <div className="flex items-center text-muted-foreground">
            <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Total Rounds: {tournament.totalRounds}</span>
          </div>
        )}
         <p className="text-sm text-muted-foreground line-clamp-2 pt-2">
          <Info className="w-4 h-4 mr-2 inline-block" />
          {tournament.description}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-2">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
          </Button>
          
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
            {(tournament.status === 'Active' || tournament.status === 'Upcoming') && onUpdateStatus && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/tournaments/${tournament.id}/register`}>
                  <Users className="mr-1 h-4 w-4" /> Register Player
                </Link>
              </Button>
            )}
             <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/tournaments/${tournament.id}/registrations`}>
                  <ListChecks className="mr-1 h-4 w-4" /> View Registrations
                </Link>
              </Button>
             {(tournament.status === 'Active' || tournament.status === 'Upcoming' || tournament.status === 'Completed') && tournament.totalRounds && tournament.totalRounds > 0 && (
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tournaments/${tournament.id}/results`}>
                        <ClipboardList className="mr-1 h-4 w-4" /> Manage Results
                    </Link>
                 </Button>
             )}
            {onUpdateStatus && tournament.status === 'Upcoming' && (
                <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Active')}>Set Active</Button>
            )}
            {onUpdateStatus && tournament.status === 'Active' && (
                <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Completed')}>Set Completed</Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
