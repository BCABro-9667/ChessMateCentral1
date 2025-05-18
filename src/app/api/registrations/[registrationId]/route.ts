// src/app/api/registrations/[registrationId]/route.ts
import { NextResponse } from 'next/server';
import { getPlayerRegistrationsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { PlayerRegistration } from '@/types/playerRegistration';

export async function PUT(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    const { registrationId } = params;
    if (!ObjectId.isValid(registrationId)) {
      return NextResponse.json({ message: 'Invalid registration ID format' }, { status: 400 });
    }

    const updates = await request.json() as Partial<Omit<PlayerRegistration, 'id'>>;
    
    // Prevent changing the ID via PUT request body
    if ('id' in updates) delete (updates as any).id;
    if ('_id' in updates) delete (updates as any)._id;


    const registrationsCollection = await getPlayerRegistrationsCollection();
    const result = await registrationsCollection.findOneAndUpdate(
      { _id: new ObjectId(registrationId) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (result) {
      const { _id, ...updatedDoc } = result;
      const updatedRegistration = { ...updatedDoc, id: _id.toHexString() } as PlayerRegistration;
      return NextResponse.json(updatedRegistration);
    } else {
      return NextResponse.json({ message: 'Registration not found for update' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to update registration ${params.registrationId}:`, error);
    return NextResponse.json({ message: 'Error updating registration', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    const { registrationId } = params;
    if (!ObjectId.isValid(registrationId)) {
      return NextResponse.json({ message: 'Invalid registration ID format' }, { status: 400 });
    }

    const registrationsCollection = await getPlayerRegistrationsCollection();
    const result = await registrationsCollection.deleteOne({ _id: new ObjectId(registrationId) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Registration deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Registration not found for deletion' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to delete registration ${params.registrationId}:`, error);
    return NextResponse.json({ message: 'Error deleting registration', error: (error as Error).message }, { status: 500 });
  }
}
