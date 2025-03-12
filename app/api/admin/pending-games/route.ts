import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Make the API route dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('pending_games');
    
    // Get all pending games
    const pendingGames = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ pendingGames });
  } catch (error) {
    console.error('Error fetching pending games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending games' },
      { status: 500 }
    );
  }
} 