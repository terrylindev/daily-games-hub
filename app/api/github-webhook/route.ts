import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import { sendNotification } from '@/lib/email-utils';
import { addGameToDataFile } from '@/lib/game-utils';
import { getContactEmail, deleteContactEmail } from '@/lib/db';

// Initialize Octokit with GitHub token
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
  if (!process.env.GITHUB_WEBHOOK_SECRET) return false;
  
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// Extract tags from issue body
function extractTags(body: string): string[] {
  const tagsMatch = body.match(/\*\*Tags:\*\* (.*?)(\n|$)/);
  if (!tagsMatch) return [];
  
  // Split by commas, trim each tag, and convert to lowercase
  return tagsMatch[1].split(',').map((tag: string) => tag.trim().toLowerCase());
}

// Add a GET handler to respond to GitHub's webhook verification
export async function GET() {
  return NextResponse.json({ message: 'GitHub webhook endpoint is active' });
}

export async function POST(request: Request) {
  try {
    console.log('Webhook received:', new Date().toISOString());
    
    // Verify GitHub webhook signature
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    
    console.log('Headers received:', {
      event: request.headers.get('x-github-event'),
      delivery: request.headers.get('x-github-delivery'),
      hasSignature: !!signature
    });
    
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      console.error('GITHUB_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    if (!verifySignature(payload, signature)) {
      console.error('Invalid signature for webhook');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    console.log('Signature verified successfully');
    
    const event = request.headers.get('x-github-event');
    const data = JSON.parse(payload);
    
    // We're only interested in issue events
    if (event !== 'issues' || !data.issue) {
      console.log('Ignored event type:', event);
      return NextResponse.json({ message: 'Ignored event' });
    }
    
    // We only care about issues being closed
    if (data.action !== 'closed') {
      console.log('Not a close event, action was:', data.action);
      return NextResponse.json({ message: 'Not a close event' });
    }
    
    console.log('Processing closed issue:', data.issue.number, data.issue.title);
    
    // Check if this is a game suggestion issue
    const issueTitle = data.issue.title || '';
    if (!issueTitle.startsWith('Game Suggestion:')) {
      return NextResponse.json({ message: 'Not a game suggestion issue' });
    }
    
    // Extract game details from the issue body
    const issueBody = data.issue.body || '';
    const nameMatch = issueBody.match(/\*\*Name:\*\* (.*?)(\n|$)/);
    const urlMatch = issueBody.match(/\*\*URL:\*\* (.*?)(\n|$)/);
    const categoryMatch = issueBody.match(/\*\*Category:\*\* (.*?)(\n|$)/);
    const descriptionMatch = issueBody.match(/\*\*Description:\*\*\n([\s\S]*?)(\n\n|$)/);
    const tags = extractTags(issueBody);
    
    const gameName = nameMatch ? nameMatch[1].trim() : '';
    const gameUrl = urlMatch ? urlMatch[1].trim() : '';
    const gameCategory = categoryMatch ? categoryMatch[1].trim().toLowerCase().split(' ')[0] : '';
    const gameDescription = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Filter out any tags that match the category (redundant)
    const validTags = tags.filter((tag: string) => tag !== gameCategory);
    
    // Check if the issue has the "has-contact-info" label
    const hasContactInfo = data.issue.labels?.some((label: { name?: string }) => 
      label.name?.toLowerCase() === 'has-contact-info'
    );
    
    // Check if the issue was closed with a "completed" label
    const isCompleted = data.issue.labels?.some((label: { name?: string }) => 
      label.name?.toLowerCase() === 'completed' || 
      label.name?.toLowerCase() === 'approved'
    );
    
    // Check if the issue was closed with a "not planned" label
    const isRejected = data.issue.labels?.some((label: { name?: string }) => 
      label.name?.toLowerCase() === 'not planned' || 
      label.name?.toLowerCase() === 'rejected' ||
      label.name?.toLowerCase() === 'wontfix'
    );
    
    // Get the closing comment if any
    let closingComment = '';
    if (data.issue.comments > 0 && octokit) {
      const commentsResponse = await octokit.issues.listComments({
        owner: data.repository.owner.login,
        repo: data.repository.name,
        issue_number: data.issue.number,
        per_page: 1,
        sort: 'created',
        direction: 'desc'
      });
      
      if (commentsResponse.data.length > 0) {
        closingComment = commentsResponse.data[0].body || '';
      }
    }
    
    // Handle completed/approved suggestions
    if (isCompleted && gameName && gameUrl && gameCategory && gameDescription) {
      // Add the game to the data file
      const added = await addGameToDataFile(
        gameName, 
        gameUrl, 
        gameDescription, 
        gameCategory,
        validTags
      );
      
      // Send notification if contact info is available
      if (hasContactInfo && added) {
        // Get the email from the database
        const email = await getContactEmail(data.issue.number);
        
        if (email) {
          // Send notification email
          await sendNotification(
            email,
            gameName, 
            'added'
          );
          
          // Delete the contact email after it's been used
          await deleteContactEmail(data.issue.number);
        } else {
          console.log(`No email found for issue #${data.issue.number}`);
        }
      }
      
      return NextResponse.json({ 
        message: 'Game added successfully',
        game: { name: gameName, url: gameUrl, category: gameCategory }
      });
    }
    
    // Handle rejected suggestions
    if (isRejected && hasContactInfo) {
      // Get the email from the database
      const email = await getContactEmail(data.issue.number);
      
      if (email) {
        // Send notification email
        await sendNotification(
          email,
          gameName, 
          'rejected', 
          closingComment
        );
        
        // Delete the contact email after it's been used
        await deleteContactEmail(data.issue.number);
      } else {
        console.log(`No email found for issue #${data.issue.number}`);
      }
      
      return NextResponse.json({ 
        message: 'Rejection notification sent',
        game: { name: gameName }
      });
    }
    
    return NextResponse.json({ message: 'No action taken' });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 