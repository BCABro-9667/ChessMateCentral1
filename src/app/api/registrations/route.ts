// src/app/api/registrations/route.ts
import { NextResponse } from 'next/server';
import type { PlayerRegistration } from '@/types/playerRegistration';
import { getPlayerRegistrationsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const registrationData = await request.json() as Omit<PlayerRegistration, 'id' | 'registrationDate'>;

    if (!registrationData.tournamentId || !registrationData.playerName) {
      return NextResponse.json({ message: 'Missing required registration data (tournamentId, playerName)' }, { status: 400 });
    }

    const newRegistrationDocument: Omit<PlayerRegistration, 'id'> = {
      ...registrationData,
      registrationDate: new Date().toISOString(),
      // Ensure FIDE ID and Rating have defaults if not provided
      fideId: registrationData.fideId || '-',
      fideRating: registrationData.fideRating === undefined ? 0 : Number(registrationData.fideRating),
    };

    const registrationsCollection = await getPlayerRegistrationsCollection();
    const result = await registrationsCollection.insertOne(newRegistrationDocument as any);

    if (!result.insertedId) {
      return NextResponse.json({ message: 'Failed to insert registration into database' }, { status: 500 });
    }

    const createdRegistration: PlayerRegistration = {
      ...newRegistrationDocument,
      id: result.insertedId.toHexString(),
    };

    return NextResponse.json(createdRegistration, { status: 201 });
  } catch (error) {
    console.error('Failed to create registration:', error);
    return NextResponse.json({ message: 'Error creating registration', error: (error as Error).message }, { status: 500 });
  }
}
