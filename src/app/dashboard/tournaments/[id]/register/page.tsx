// src/app/dashboard/tournaments/[id]/register/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useTournaments } from '@/hooks/useTournaments';
import { usePlayerRegistrations } from '@/hooks/usePlayerRegistrations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, ArrowLeft, ShieldAlert, VenetianMask, Cake, Building, Phone, TargetIcon } from 'lucide-react';
import Link from 'next/link';
import type { Tournament } from '@/types/tournament';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const { getTournamentById, isLoadingTournaments } = useTournaments();
  const { addRegistration, isLoadingRegistrations } = usePlayerRegistrations();
  const { toast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [feePaid, setFeePaid] = useState(true);

  // New fields
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [organization, setOrganization] = useState('');
  const [mobile, setMobile] = useState('');
  const [fideRating, setFideRating] = useState<number | ''>(0);
  const [fideId, setFideId] = useState('-');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoadingTournaments && tournamentId) {
      const fetchedTournament = getTournamentById(tournamentId);
      setTournament(fetchedTournament);
    }
  }, [isLoadingTournaments, tournamentId, getTournamentById]);

  if (isLoadingTournaments || tournament === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
          <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
        </Card>
      </div>
    );
  }

  if (tournament === null) {
    notFound();
  }
  
  if (tournament && tournament.status !== 'Active' && tournament.status !== 'Upcoming') {
     return (
      <div className="space-y-6 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Registration Not Allowed</h1>
        <p className="text-muted-foreground">
          Player registration is only open for 'Active' or 'Upcoming' tournaments. This tournament is currently '{tournament.status}'.
        </p>
        <Button asChild variant="outline">
          <Link href={`/dashboard`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the player's name.",
        variant: "destructive",
      });
      return;
    }
    if (!tournament) return;

    setIsSubmitting(true);
    try {
      addRegistration({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        playerName,
        playerEmail,
        feePaid,
        gender,
        dob,
        organization,
        mobile,
        fideRating: Number(fideRating) || 0,
        fideId: fideId || '-',
      });
      toast({
        title: "Player Registered!",
        description: `${playerName} has been registered for "${tournament.name}".`,
      });
      // Clear form
      setPlayerName('');
      setPlayerEmail('');
      setFeePaid(true);
      setGender('');
      setDob('');
      setOrganization('');
      setMobile('');
      setFideRating(0);
      setFideId('-');
      // router.push(`/dashboard/tournaments/${tournament.id}/registrations`);
    } catch (error) {
      console.error("Failed to register player:", error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <UserPlus className="w-8 h-8 mr-3 text-primary" />
          Register Player for Tournament
        </h1>
        <Button variant="outline" asChild>
          <Link href={`/dashboard`}> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tournament: {tournament?.name}</CardTitle>
          <CardDescription>
            Organizer: Chessmate Central Admin <br />
            Entry Fee: ${tournament?.entryFee}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="playerName">Player Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="playerEmail">Player Email</Label>
                <Input
                  id="playerEmail"
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="player@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                     <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <Label htmlFor="organization">Organization/School/College</Label>
                <Input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g., City Chess Club"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g., +1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fideRating">FIDE Rating</Label>
                <Input
                  id="fideRating"
                  type="number"
                  value={fideRating}
                  onChange={(e) => setFideRating(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0 if unrated"
                />
              </div>
              <div>
                <Label htmlFor="fideId">FIDE ID</Label>
                <Input
                  id="fideId"
                  type="text"
                  value={fideId}
                  onChange={(e) => setFideId(e.target.value)}
                  placeholder="'-' if none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="feePaid" 
                checked={feePaid} 
                onCheckedChange={(checked) => setFeePaid(checked as boolean)}
              />
              <Label htmlFor="feePaid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Entry Fee Paid
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isLoadingRegistrations} className="w-full sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Register Player
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
