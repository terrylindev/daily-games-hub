import { NextResponse } from 'next/server';
import { getGamesFromMongoDB } from '@/lib/game-utils';
import { Game } from '@/lib/games-data';

// Make the API route dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get games from MongoDB
    const mongoGames = await getGamesFromMongoDB();
    console.log(`API: Retrieved ${mongoGames.length} games from MongoDB`);
    
    // Convert MongoDB documents to Game type
    const games = mongoGames.map(game => game as unknown as Game);
    
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
} 