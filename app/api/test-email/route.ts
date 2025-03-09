import { NextResponse } from 'next/server';
import { sendNotification, isEmailConfigured } from '@/lib/email-utils';

export async function GET(request: Request) {
  try {
    // Get the email from the query string
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email is not configured' },
        { status: 500 }
      );
    }
    
    // Send a test email
    const success = await sendNotification(
      email,
      'Test Game',
      'added'
    );
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 