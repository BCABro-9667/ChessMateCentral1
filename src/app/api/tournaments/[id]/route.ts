// src/app/api/tournaments/[id]/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';

// Mock data store (should be consistent with /api/tournaments/route.ts or a real DB)
// This is simplified; in a real app, this would interact with the same DB as the collection route.
let tournaments_mock_db: Tournament[] = [
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


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In a real app, you'd fetch this from MongoDB by ID
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const tournament = tournaments_mock_db.find(t => t.id === params.id);
  if (tournament) {
    return NextResponse.json(tournament);
  } else {
    return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json() as Partial<Tournament>;
    // In a real app, you'd update this in MongoDB by ID
    const tournamentIndex = tournaments_mock_db.findIndex(t => t.id === params.id);
    if (tournamentIndex !== -1) {
      tournaments_mock_db[tournamentIndex] = { ...tournaments_mock_db[tournamentIndex], ...updates };
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return NextResponse.json(tournaments_mock_db[tournamentIndex]);
    } else {
      return NextResponse.json({ message: 'Tournament not found for update' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update tournament:', error);
    return NextResponse.json({ message: 'Error updating tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In a real app, you'd delete this from MongoDB by ID
  const tournamentIndex = tournaments_mock_db.findIndex(t => t.id === params.id);
  if (tournamentIndex !== -1) {
    tournaments_mock_db.splice(tournamentIndex, 1);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Tournament not found for deletion' }, { status: 404 });
  }
}
