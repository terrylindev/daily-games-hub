import { Resend } from 'resend';

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Log Resend initialization status
console.log('Resend API initialized:', !!resend);

/**
 * Send an email notification about a game suggestion
 */
export async function sendNotification(
  email: string, 
  gameName: string, 
  status: 'added' | 'rejected',
  reason?: string
): Promise<boolean> {
  console.log(`Attempting to send ${status} notification to ${email} for game "${gameName}"`);
  
  if (!resend) {
    console.error('Resend API key not configured');
    return false;
  }
  
  try {
    const subject = status === 'added' 
      ? `Your game suggestion "${gameName}" has been added!` 
      : `Update on your game suggestion "${gameName}"`;
    
    const text = status === 'added'
      ? `Great news! Your game suggestion "${gameName}" has been reviewed and added to Daily Games Hub. Thank you for your contribution!`
      : `Thank you for your game suggestion "${gameName}". After review, we've decided not to add it at this time.\n\nReason: ${reason || 'No specific reason provided.'}\n\nWe appreciate your interest in Daily Games Hub.`;
    
    console.log('Sending email with Resend:', {
      from: process.env.EMAIL_FROM || 'Daily Games Hub <onboarding@resend.dev>',
      to: email,
      subject
    });
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Daily Games Hub <onboarding@resend.dev>',
      to: email,
      subject,
      text
    });
    
    if (error) {
      console.error('Error sending email via Resend:', error);
      return false;
    }
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
}

/**
 * Check if email functionality is configured
 */
export function isEmailConfigured(): boolean {
  return !!resend;
} 