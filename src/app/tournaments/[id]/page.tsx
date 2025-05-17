// src/app/tournaments/[id]/page.tsx
"use client"; // Needs to be client component to use hooks like useTournaments

import Header from '@/components/layout/Header';
import { useTournaments } from '@/hooks/useTournaments';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Users, DollarSign, Trophy, Clock, Info, ListChecks, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';


export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
  const { getTournamentById, isLoadingTournaments } = useTournaments();
  const tournament = getTournamentById(params.id);

  if (isLoadingTournaments) {
    return (
       <>
        <Header />
        <main className="container mx-auto px-4 py-10">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!tournament) {
    notFound(); // Or redirect to a custom not found page
  }

  const getStatusVariant = (status: typeof tournament.status) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Upcoming': return 'secondary';
      case 'Completed': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow bg-gradient-to-br from-primary/5 to-accent/5 py-10">
        <div className="container mx-auto px-4">
          <Card className="shadow-xl overflow-hidden">
            <div className="relative h-64 md:h-96 w-full">
              <Image 
                src={`https://placehold.co/1200x400.png`} 
                alt={`${tournament.name} cover image`} 
                layout="fill"
                objectFit="cover"
                className="bg-muted"
                data-ai-hint="chess tournament"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8">
                <Badge variant={getStatusVariant(tournament.status)} className="absolute top-6 right-6 text-sm px-3 py-1">
                  {tournament.status}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-text">{tournament.name}</h1>
                <p className="text-xl text-primary-foreground/80 shadow-text flex items-center">
                  <MapPin className="w-5 h-5 mr-2" /> {tournament.location}
                </p>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <section>
                    <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                      <Info className="w-6 h-6 mr-2" /> About this Tournament
                    </h2>
                    <p className="text-lg text-foreground/90 whitespace-pre-line leading-relaxed">
                      {tournament.description}
                    </p>
                  </section>

                  <section>
                     <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                      <ListChecks className="w-6 h-6 mr-2" /> Registered Players
                    </h2>
                    <div className="bg-muted p-6 rounded-lg text-center">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Player registration details will be available soon.</p>
                        {tournament.status === 'Upcoming' && (
                             <Button className="mt-4">Register Now (Coming Soon)</Button>
                        )}
                    </div>
                  </section>

                  <section>
                     <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2" /> Results & Standings
                    </h2>
                     <div className="bg-muted p-6 rounded-lg text-center">
                        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Results will be published here after the tournament concludes.</p>
                    </div>
                  </section>
                </div>

                <aside className="space-y-6 md:sticky md:top-24"> {/* Adjust top based on header height */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl text-primary flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2" /> Tournament Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Start Date:</strong> {format(new Date(tournament.startDate), 'EEEE, MMMM dd, yyyy')}</p>
                      <p><strong>End Date:</strong> {format(new Date(tournament.endDate), 'EEEE, MMMM dd, yyyy')}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-md">
                    <CardHeader>
                       <CardTitle className="text-xl text-primary flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" /> Fees & Prizes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Entry Fee:</strong> ${tournament.entryFee.toLocaleString()}</p>
                      <p><strong>Prize Fund:</strong> ${tournament.prizeFund.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                   <Card className="shadow-md">
                    <CardHeader>
                       <CardTitle className="text-xl text-primary flex items-center">
                        <Clock className="w-5 h-5 mr-2" /> Time Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{tournament.timeControl}</p>
                    </CardContent>
                  </Card>

                  <Button className="w-full text-lg" size="lg" asChild>
                    <Link href="/">
                        Back to Home
                    </Link>
                  </Button>
                </aside>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
       <footer className="py-8 bg-card border-t border-border mt-auto">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
          </div>
        </footer>
    </>
  );
}
