// src/app/dashboard/page.tsx
"use client";

import TournamentCard from '@/components/cards/TournamentCard';
import { Button } from '@/components/ui/button';
import { useTournaments } from '@/hooks/useTournaments';
import type { Tournament } from '@/types/tournament';
import { PlusCircle, Swords } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { tournaments, isLoadingTournaments, updateTournamentStatus } = useTournaments();

  const upcomingTournaments = tournaments.filter(t => t.status === 'Upcoming');
  const activeTournaments = tournaments.filter(t => t.status === 'Active');
  const completedTournaments = tournaments.filter(t => t.status === 'Completed');
  const cancelledTournaments = tournaments.filter(t => t.status === 'Cancelled');

  const renderTournamentList = (list: Tournament[], title: string) => (
    <>
      {list.length === 0 ? (
        <p className="text-muted-foreground mt-4">No {title.toLowerCase()} tournaments.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {list.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} onUpdateStatus={updateTournamentStatus} />
          ))}
        </div>
      )}
    </>
  );
  
  if (isLoadingTournaments) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
          <Swords className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-primary" />
          Tournament Dashboard
        </h1>
        <Button asChild size="lg">
          <Link href="/dashboard/tournaments/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Tournament
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledTournaments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderTournamentList(upcomingTournaments, "Upcoming")}
        </TabsContent>
        <TabsContent value="active">
          {renderTournamentList(activeTournaments, "Active")}
        </TabsContent>
        <TabsContent value="completed">
          {renderTournamentList(completedTournaments, "Completed")}
        </TabsContent>
         <TabsContent value="cancelled">
          {renderTournamentList(cancelledTournaments, "Cancelled")}
        </TabsContent>
      </Tabs>

      {tournaments.length === 0 && !isLoadingTournaments && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">No tournaments found.</p>
          <Button asChild>
            <Link href="/dashboard/tournaments/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Tournament
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
