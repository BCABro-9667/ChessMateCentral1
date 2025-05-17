// src/app/api/tournaments/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';

// Mock data store (replace with actual database logic)
let tournaments: Tournament[] = [
  {
    id: 'example-public-tournament',
    name: 'Grand Annual Chess Championship (API)',
    type: 'Swiss',
    location: 'Community Hall, Online',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    entryFee: 30,
    prizeFund: 1200,
    timeControl: 'G/90+30',
    totalRounds: 7,
    description: 'Fetched from API: Join us for the most anticipated chess event of the year!',
    status: 'Upcoming',
    imageUrl: 'https://placehold.co/1200x400.png?text=API+Tournament',
  },
];

export async function GET(request: Request) {
  // In a real app, you'd fetch this from MongoDB
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  try {
    const tournamentData = await request.json() as Omit<Tournament, 'id' | 'status'>;
    // In a real app, you'd save this to MongoDB and Cloudinary (for imageUrl)
    // Basic validation could happen here or with a library like Zod on the server
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tourn_api_${new Date().getTime()}`,
      status: 'Upcoming', // Default status for new tournaments
    };
    tournaments.push(newTournament);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error('Failed to create tournament:', error);
    return NextResponse.json({ message: 'Error creating tournament', error: (error as Error).message }, { status: 500 });
  }
}
