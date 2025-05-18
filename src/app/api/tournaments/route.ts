// src/app/api/tournaments/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';
import { getTournamentsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const tournamentsCollection = await getTournamentsCollection();
    const tournamentsFromDb = await tournamentsCollection.find({}).sort({ startDate: -1 }).toArray();
    
    // Map _id to id and convert ObjectId to string
    const tournaments = tournamentsFromDb.map(t => {
      const { _id, ...rest } = t;
      return { ...rest, id: _id.toHexString() };
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Failed to fetch tournaments:', error);
    return NextResponse.json({ message: 'Error fetching tournaments', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tournamentData = await request.json() as Omit<Tournament, 'id' | 'status'>;
    
    // Basic validation can be done here with Zod if needed, or rely on frontend validation
    if (!tournamentData.name || !tournamentData.startDate) {
        return NextResponse.json({ message: 'Missing required tournament data (name, startDate)' }, { status: 400 });
    }

    const newTournament: Omit<Tournament, 'id'> = {
      ...tournamentData,
      status: 'Upcoming', // Default status for new tournaments
    };

    const tournamentsCollection = await getTournamentsCollection();
    const result = await tournamentsCollection.insertOne(newTournament as any); // Cast to any to let MongoDB handle _id

    if (!result.insertedId) {
        return NextResponse.json({ message: 'Failed to insert tournament into database' }, { status: 500 });
    }
    
    const createdTournament: Tournament = {
        ...newTournament,
        id: result.insertedId.toHexString(),
    };

    return NextResponse.json(createdTournament, { status: 201 });
  } catch (error) {
    console.error('Failed to create tournament:', error);
    return NextResponse.json({ message: 'Error creating tournament', error: (error as Error).message }, { status: 500 });
  }
}
