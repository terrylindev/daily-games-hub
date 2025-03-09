import { NextResponse } from 'next/server';
import { addGameToDataFile } from '@/lib/game-utils;
import { sendNotification } from '@/lib/email-utils';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, url, description, category, email } = body;
    
    // Validate required fields
    if (!name || !url || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Simulate adding a game to the data file
    const added = await addGameToDataFile(name, url, description, category);
    
    // Send notification if email is provided
    if (email && added) {
      await sendNotification(email, name, 'added');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Game added successfully',
      game: { name, url, category }
    });
    
  } catch (error) {
    console.error('Error processing test webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process test webhook' },
      { status: 500 }
    );
  }
} 