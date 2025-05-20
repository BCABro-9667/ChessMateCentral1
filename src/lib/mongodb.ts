// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion, Db, Collection, WithId, Document } from 'mongodb';
import type { Tournament } from '@/types/tournament';
import type { PlayerRegistration } from '@/types/playerRegistration';
import type { TournamentResult } from '@/types/tournamentResult';
import type { BlogPost } from '@/types/blog';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local or your deployment environment.');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }
  try {
    await client.connect();
    // The MONGO_URI structure is: mongodb+srv://<username>:<password>@<cluster-url>/<databaseName>?<options>
    // We will use the database name specified in the URI.
    // If no database name is in the URI, client.db() without arguments uses the default 'test' db.
    // It's better practice to ensure your URI includes the database name.
    // Example: mongodb+srv://user:pass@host/myDatabase
    // If MONGO_URI is "mongodb+srv://Avdhesh1:ya4XYnQUEtYhv5kr@cluster0.0uojesi.mongodb.net/blog"
    // then the database name is 'blog'.
    // If your MONGO_URI doesn't specify a database, you must pass it to client.db() here.
    // For this project, assuming 'blog' is in the URI or is the desired default.
    const dbNameFromUri = new URL(uri.startsWith('mongodb+srv') ? uri.replace('mongodb+srv','mongodb') : uri).pathname.substring(1);
    db = client.db(dbNameFromUri || 'blog'); // Fallback to 'blog' if not in URI path
    console.log(`Successfully connected to MongoDB and database: ${db.databaseName}`);
    return db;
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw e;
  }
}

export async function getTournamentsCollection(): Promise<Collection<Tournament>> {
  const database = await connectToDatabase();
  return database.collection<Tournament>('tournaments');
}

export async function getPlayerRegistrationsCollection(): Promise<Collection<PlayerRegistration>> {
  const database = await connectToDatabase();
  // MongoDB stores documents, not the exact PlayerRegistration type which might have client-side 'id'.
  // We'll handle the _id vs id mapping in the API routes.
  return database.collection<Document & Omit<PlayerRegistration, 'id'>>('playerRegistrations') as Collection<PlayerRegistration>;
}

export async function getTournamentResultsCollection(): Promise<Collection<TournamentResult>> {
  const database = await connectToDatabase();
  return database.collection<Document & TournamentResult>('tournamentResults') as Collection<TournamentResult>;
}

export async function getBlogPostsCollection(): Promise<Collection<BlogPost>> {
  const database = await connectToDatabase();
  // MongoDB stores documents. We'll map _id to id in API routes.
  return database.collection<Document & Omit<BlogPost, 'id'>>('blogPosts') as Collection<BlogPost>;
}
