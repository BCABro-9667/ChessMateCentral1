// src/app/api/registrations/by-tournament/[tournamentId]/route.ts
import { NextResponse } from 'next/server';
import { getPlayerRegistrationsCollection } from '@/lib/mongodb';
import type { PlayerRegistration } from '@/types/playerRegistration';

export async function GET(
  request: Request,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const { tournamentId } = params;
    if (!tournamentId) {
      return NextResponse.json({ message: 'Tournament ID is required' }, { status: 400 });
    }

    const registrationsCollection = await getPlayerRegistrationsCollection();
    const registrationsFromDb = await registrationsCollection.find({ tournamentId }).sort({ registrationDate: -1 }).toArray();

    const registrations = registrationsFromDb.map(reg => {
      const { _id, ...rest } = reg;
      return { ...rest, id: _id.toHexString() } as PlayerRegistration;
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error(`Failed to fetch registrations for tournament ${params.tournamentId}:`, error);
    return NextResponse.json({ message: 'Error fetching registrations', error: (error as Error).message }, { status: 500 });
  }
}
