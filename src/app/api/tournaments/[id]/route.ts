// src/app/api/tournaments/[id]/route.ts
import { NextResponse } from 'next/server';
import type { Tournament } from '@/types/tournament';
import { getTournamentsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    const tournamentsCollection = await getTournamentsCollection();
    const tournamentFromDb = await tournamentsCollection.findOne({ _id: new ObjectId(params.id) });

    if (tournamentFromDb) {
      const { _id, ...rest } = tournamentFromDb;
      const tournament = { ...rest, id: _id.toHexString() };
      return NextResponse.json(tournament);
    } else {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    const updates = await request.json() as Partial<Omit<Tournament, 'id'>>; // Exclude 'id' from updatable fields via body

    // Prevent changing the ID via PUT request body
    if ('id' in updates) {
      delete (updates as any).id;
    }
    if ('_id' in updates) {
      delete (updates as any)._id;
    }

    const tournamentsCollection = await getTournamentsCollection();
    const result = await tournamentsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates },
      { returnDocument: 'after' } // Return the updated document
    );

    if (result) {
      const { _id, ...updatedTournamentData } = result;
      const updatedTournament = { ...updatedTournamentData, id: _id.toHexString() };
      return NextResponse.json(updatedTournament);
    } else {
      return NextResponse.json({ message: 'Tournament not found for update' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to update tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
    }
    const tournamentsCollection = await getTournamentsCollection();
    const result = await tournamentsCollection.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Tournament not found for deletion' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete tournament ${params.id}:`, error);
    return NextResponse.json({ message: 'Error deleting tournament', error: (error as Error).message }, { status: 500 });
  }
}
