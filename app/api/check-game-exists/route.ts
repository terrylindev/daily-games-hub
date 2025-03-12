import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Make the API route dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define types for MongoDB queries
type MongoRegex = { $regex: string; $options: string };
type MongoQuery = { 
  id?: string; 
  name?: MongoRegex;
  url?: MongoRegex;
};

export async function POST(request: NextRequest) {
  try {
    const { name, url } = await request.json();
    
    if (!name && !url) {
      return NextResponse.json(
        { error: 'Either name or URL is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    // Prepare query to check both collections
    const query: { $or: MongoQuery[] } = { $or: [] };
    
    if (name) {
      // Create a normalized ID from the name for comparison
      const normalizedId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      query.$or.push({ id: normalizedId });
      
      // Also check for exact name match (case insensitive)
      query.$or.push({ name: { $regex: `^${name}$`, $options: 'i' } });
    }
    
    if (url) {
      // Normalize URL for comparison (remove protocol, www, trailing slashes)
      const normalizedUrl = url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
      
      // Check for URL match (using regex to handle variations)
      query.$or.push({ 
        url: { 
          $regex: normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          $options: 'i'
        } 
      });
    }
    
    // Check if game exists in main games collection
    const existingGame = await collection.findOne(query);
    
    // Also check pending games collection
    const pendingCollection = db.collection('pending_games');
    const pendingGame = await pendingCollection.findOne({
      'gameData.id': name?.toLowerCase().replace(/[^a-z0-9]/g, '-')
    });
    
    return NextResponse.json({
      exists: !!(existingGame || pendingGame),
      existingGame: existingGame ? {
        id: existingGame.id,
        name: existingGame.name,
        url: existingGame.url
      } : null,
      pendingGame: pendingGame ? {
        id: pendingGame.gameData.id,
        name: pendingGame.gameData.name,
        status: pendingGame.status
      } : null
    });
  } catch (error) {
    console.error('Error checking if game exists:', error);
    return NextResponse.json(
      { error: 'Failed to check if game exists' },
      { status: 500 }
    );
  }
} 