import { NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection URI (from environment variables)
const uri = process.env.MONGODB_URI || '';

export async function GET() {
  try {
    if (!uri) {
      return NextResponse.json(
        { error: 'MongoDB URI not provided' },
        { status: 500 }
      );
    }

    // Create a MongoClient
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    // Connect to the MongoDB server
    await client.connect();
    
    // Get the database
    const db = client.db('daily-games-hub');
    
    // Create the contacts collection if it doesn't exist
    await db.createCollection('contacts');
    
    // Create an index on issueNumber for faster lookups
    await db.collection('contacts').createIndex({ issueNumber: 1 });
    
    // Close the connection
    await client.close();
    
    return NextResponse.json({ message: 'MongoDB connection successful and collections initialized' });
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to initialize MongoDB connection' },
      { status: 500 }
    );
  }
} 