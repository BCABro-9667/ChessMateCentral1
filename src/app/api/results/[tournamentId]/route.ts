// src/app/api/results/[tournamentId]/route.ts
import { NextResponse } from 'next/server';
import { getTournamentResultsCollection } from '@/lib/mongodb';
import type { TournamentResult } from '@/types/tournamentResult';
import { ObjectId } from 'mongodb'; // Not strictly needed for tournamentId if it's a string, but good for consistency if it were an ObjectId

export async function GET(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    if (!tournamentId) {
      return NextResponse.json({ message: 'Tournament ID is required' }, { status: 400 });
    }

    const resultsCollection = await getTournamentResultsCollection();
    // Assuming tournamentId in TournamentResult is a string matching Tournament.id
    const tournamentResultDoc = await resultsCollection.findOne({ tournamentId });

    if (tournamentResultDoc) {
      const { _id, ...rest } = tournamentResultDoc;
      // The TournamentResult type doesn't have its own 'id' field, it's identified by tournamentId
      return NextResponse.json(rest);
    } else {
      // It's okay if results are not found, means they haven't been created yet.
      // Return an empty structure or a specific "not found" that the frontend can interpret.
      return NextResponse.json({ tournamentId, playerScores: [] });
    }
  } catch (error) {
    console.error(`Failed to fetch results for tournament ${params.tournamentId}:`, error);
    return NextResponse.json({ message: 'Error fetching tournament results', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    if (!tournamentId) {
      return NextResponse.json({ message: 'Tournament ID is required' }, { status: 400 });
    }

    const resultsData = await request.json() as Omit<TournamentResult, '_id'>; // _id is managed by MongoDB

    if (resultsData.tournamentId !== tournamentId) {
        return NextResponse.json({ message: 'Tournament ID in body does not match URL parameter' }, { status: 400 });
    }
    
    const resultsCollection = await getTournamentResultsCollection();
    
    // Upsert: update if exists, insert if not
    const result = await resultsCollection.updateOne(
      { tournamentId: tournamentId },
      { $set: resultsData },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedId) {
      const savedResult = await resultsCollection.findOne({ tournamentId });
       if (savedResult) {
        const { _id, ...rest } = savedResult;
        return NextResponse.json(rest, { status: 200 }); // OK for update, 201 for new if tracking
      }
      return NextResponse.json({ message: 'Results saved, but failed to retrieve for confirmation.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to save tournament results' }, { status: 500 });
    }
  } catch (error) {
    console.error(`Failed to save results for tournament ${params.tournamentId}:`, error);
    return NextResponse.json({ message: 'Error saving tournament results', error: (error as Error).message }, { status: 500 });
  }
}
