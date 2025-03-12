import { NextRequest, NextResponse } from 'next/server';
import { getFavoriteGamesFromDB } from '@/lib/game-utils';

export async function POST(request: NextRequest) {
  try {
    // Get favorite IDs from request body
    const { favoriteIds } = await request.json();
    
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return NextResponse.json({ games: [] });
    }
    
    // Get games from MongoDB
    const games = await getFavoriteGamesFromDB(favoriteIds);
    
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching favorite games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite games' },
      { status: 500 }
    );
  }
} 