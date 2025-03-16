import { NextResponse } from 'next/server';
import { getCategoryCounts, recalculateCategoryCounts } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Check if we need to force a recalculation
    const url = new URL(request.url);
    const forceRecalculate = url.searchParams.get('recalculate') === 'true';
    
    // Get category counts (or recalculate if forced)
    const counts = forceRecalculate 
      ? await recalculateCategoryCounts()
      : await getCategoryCounts();
    
    return NextResponse.json({ counts }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving category counts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve category counts' },
      { status: 500 }
    );
  }
} 