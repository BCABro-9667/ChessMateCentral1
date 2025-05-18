// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import type { Tournament } from '@/types/tournament';

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
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
    // The MONGO_URI usually includes the database name if it's like /your_db_name?retryWrites...
    // If your URI doesn't specify a db name, or you want to be explicit:
    // db = client.db("your_database_name_here"); // e.g., client.db("chessMateCentral") or client.db("blog") as per your URI
    // For now, letting the URI handle the DB selection. If it's just the cluster URI, you MUST specify db name.
    // The URI provided is "mongodb+srv://Avdhesh1:ya4XYnQUEtYhv5kr@cluster0.0uojesi.mongodb.net/blog"
    // So, the database name is 'blog'.
    db = client.db("blog"); 
    console.log("Successfully connected to MongoDB and database: blog");
    return db;
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw e; // Rethrow or handle as appropriate for your application
  }
}

export async function getTournamentsCollection(): Promise<Collection<Tournament>> {
  const database = await connectToDatabase();
  return database.collection<Tournament>('tournaments');
}

// You can add more collection getters here, e.g., for playerRegistrations, news, etc.
// export async function getPlayerRegistrationsCollection(): Promise<Collection<PlayerRegistration>> {
//   const database = await connectToDatabase();
//   return database.collection<PlayerRegistration>('playerRegistrations');
// }

// Note: It's good practice to ensure the client eventually closes,
// but for serverless functions (like Next.js API routes),
// the connection is often managed per request or kept warm.
// For long-running apps, you'd handle client.close() on shutdown.
