// src/components/cards/TournamentCard.tsx
import type { Tournament } from '@/types/tournament';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, Tag, DollarSign, Trophy, Swords, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
  onUpdateStatus?: (id: string, status: Tournament['status']) => void; // Optional: for admin actions
}

export default function TournamentCard({ tournament, onUpdateStatus }: TournamentCardProps) {
  const getStatusVariant = (status: Tournament['status']) => {
    switch (status) {
      case 'Active': return 'default'; // bg-primary
      case 'Upcoming': return 'secondary'; // bg-secondary
      case 'Completed': return 'outline'; // text-foreground
      case 'Cancelled': return 'destructive'; // bg-destructive
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
         <p className="text-sm text-muted-foreground line-clamp-2 pt-2">
          <Info className="w-4 h-4 mr-2 inline-block" />
          {tournament.description}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex justify-between w-full items-center">
          <Button asChild variant="default">
            <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
          </Button>
          {/* Placeholder for admin actions if onUpdateStatus is provided */}
          {onUpdateStatus && (
             <div className="flex gap-2">
                {/* Example admin action - could be a dropdown or more buttons */}
                {tournament.status === 'Upcoming' && (
                    <Button variant="outline" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Active')}>Set Active</Button>
                )}
                {tournament.status === 'Active' && (
                    <Button variant="outline" size="sm" onClick={() => onUpdateStatus(tournament.id, 'Completed')}>Set Completed</Button>
                )}
             </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
