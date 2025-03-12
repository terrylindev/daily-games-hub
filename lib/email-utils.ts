import { Resend } from 'resend';

// Initialize Resend API
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

console.log('Resend API initialized:', !!resend);

/**
 * Send a notification email to the user
 */
export async function sendNotification(
  email: string, 
  gameName: string, 
  status: 'added' | 'updated' | 'rejected', 
  comment?: string
): Promise<boolean> {
  try {
    console.log(`Sending ${status} notification to ${email} for game "${gameName}"`);
    
    // Determine the subject and content based on status
    let subject = '';
    let content = '';
    
    if (status === 'added') {
      subject = `Your game suggestion "${gameName}" has been added!`;
      content = `
        <p>Good news! Your game suggestion "${gameName}" has been added to Daily Games Hub.</p>
        <p>Thank you for contributing to our collection of daily games!</p>
        <p>You can see it on the website now: <a href="https://www.dailygameshub.com">Daily Games Hub</a></p>
      `;
    } else if (status === 'updated') {
      subject = `Your game suggestion "${gameName}" has been processed`;
      content = `
        <p>Your game suggestion "${gameName}" has been processed.</p>
        <p>This game was already in our database, but we've verified it and may have updated its information.</p>
        <p>Thank you for contributing to Daily Games Hub!</p>
        <p>You can see it on the website: <a href="https://www.dailygameshub.com">Daily Games Hub</a></p>
      `;
    } else if (status === 'rejected') {
      subject = `Update on your game suggestion "${gameName}"`;
      content = `
        <p>Thank you for your game suggestion "${gameName}" for Daily Games Hub.</p>
        <p>After review, we've decided not to add this game to our collection at this time.</p>
        ${comment ? `<p><strong>Feedback:</strong> ${comment}</p>` : ''}
        <p>We appreciate your contribution and encourage you to suggest other games in the future!</p>
      `;
    }
    
    if (!resend) {
      console.error('Resend API key not configured:', process.env.RESEND_API_KEY ? 'Key exists but may be invalid' : 'Key is missing');
      return false;
    }
    
    console.log('Sending email with Resend:', {
      from: 'Daily Games Hub <notifications@dailygameshub.com>',
      to: email,
      subject,
      html: content
    });
    
    const { data, error } = await resend.emails.send({
      from: 'Daily Games Hub <notifications@dailygameshub.com>',
      to: email,
      subject,
      html: content
    });
    
    if (error) {
      console.error('Error sending email with Resend:', error);
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