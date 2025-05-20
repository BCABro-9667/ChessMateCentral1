// src/app/dashboard/tournaments/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import TournamentForm from "@/components/forms/TournamentForm";
import { useTournaments } from "@/hooks/useTournaments";
import { useToast } from "@/hooks/use-toast";
import type { Tournament } from "@/types/tournament";
import { format, parseISO } from "date-fns";
import { Edit3, Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const { getTournamentById, updateTournament, isLoadingTournaments, refreshTournaments } = useTournaments();
  const { toast } = useToast();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<Tournament> | undefined>(undefined);

  useEffect(() => {
    refreshTournaments(); // Fetch latest data when page mounts
  }, [refreshTournaments]);
  
  useEffect(() => {
    if (tournamentId && !isLoadingTournaments) {
      const tournamentData = getTournamentById(tournamentId);
      if (tournamentData) {
        setInitialData(tournamentData);
      } else {
        // If tournament not found after loading, it might be an invalid ID
        setInitialData(null); // Special value to indicate not found
      }
      setIsLoadingPage(false);
    }
  }, [tournamentId, isLoadingTournaments, getTournamentById]);

  const handleSubmit = async (data: Omit<Tournament, 'id' | 'status' | 'startDate' | 'endDate'> & { startDate: Date, endDate: Date }) => {
    if (!tournamentId) return;
    setIsSubmitting(true);
    try {
      // Retain original status unless explicitly changed by another mechanism
      const currentTournament = getTournamentById(tournamentId);
      const tournamentPayload: Omit<Tournament, 'id' | 'status'> = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        endDate: format(data.endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      };
      
      await updateTournament(tournamentId, tournamentPayload);
      
      toast({
        title: "Tournament Updated!",
        description: `"${data.name}" has been successfully updated.`,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to update tournament:", error);
      toast({
        title: "Error Updating Tournament",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingPage || isLoadingTournaments && initialData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (initialData === null) {
    notFound(); // Or show a "Tournament not found" message
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Edit3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Edit Tournament</h1>
        </div>
         <Button variant="outline" asChild>
           <Link href="/dashboard">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
           </Link>
         </Button>
      </div>
      <p className="text-muted-foreground">
        Modify the details for &quot;{initialData?.name || 'Tournament'}&quot;.
      </p>
      {initialData && (
        <TournamentForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
