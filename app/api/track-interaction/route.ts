import { NextRequest, NextResponse } from 'next/server';
import { trackGameInteraction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { gameId, type } = data;
    
    // Validate required fields
    if (!gameId || !type) {
      return NextResponse.json(
        { error: 'Missing gameId or type' },
        { status: 400 }
      );
    }
    
    // Validate interaction type
    if (!['click', 'favorite', 'unfavorite'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }
    
    // Get optional tracking data
    const sessionId = request.headers.get('x-session-id') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Track the interaction
    const success = await trackGameInteraction(gameId, type, sessionId, userAgent);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to track interaction' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-interaction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}