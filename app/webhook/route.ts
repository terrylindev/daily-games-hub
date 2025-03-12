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

// Simple GET handler for testing
export async function GET() {
  return NextResponse.json({ message: 'GitHub webhook endpoint is active' });
}

// Trigger Vercel redeployment
async function triggerVercelRedeployment() {
  try {
    // Check if we have a deployment hook URL
    if (!process.env.VERCEL_DEPLOY_HOOK_URL) {
      console.log('No VERCEL_DEPLOY_HOOK_URL configured, skipping redeployment');
      return false;
    }
    
    console.log('Triggering Vercel redeployment...');
    
    // Call the Vercel deployment hook
    const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
      method: 'POST',
    });
    
    if (response.ok) {
      console.log('Vercel redeployment triggered successfully');
      return true;
    } else {
      console.error('Failed to trigger Vercel redeployment:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error triggering Vercel redeployment:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Webhook received at /webhook:', new Date().toISOString());
    console.log('Request URL:', request.url);
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    // Verify GitHub webhook signature
    const payload = await request.text();
    console.log('Payload length:', payload.length);
    console.log('Payload content:', payload.substring(0, 500) + '...');
    
    const signature = request.headers.get('x-hub-signature-256') || '';
    
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      console.error('GITHUB_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    if (!verifySignature(payload, signature)) {
      console.error('Invalid signature for webhook');
      console.error('Expected signature for payload:', crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET).update(payload).digest('hex'));
      console.error('Received signature:', signature);
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
      console.log('Not a game suggestion issue, title was:', issueTitle);
      return NextResponse.json({ message: 'Not a game suggestion issue' });
    }
    
    // Extract game details from the issue body
    const issueBody = data.issue.body || '';
    console.log('Issue body:', issueBody);
    
    const nameMatch = issueBody.match(/\*\*Name:\*\* (.*?)(\n|$)/);
    const urlMatch = issueBody.match(/\*\*URL:\*\* (.*?)(\n|$)/);
    const categoryMatch = issueBody.match(/\*\*Category:\*\* (.*?)(\n|$)/);
    const descriptionMatch = issueBody.match(/\*\*Description:\*\*\n([\s\S]*?)(\n\n|$)/);
    const tags = extractTags(issueBody);
    
    console.log('Extracted matches:', { 
      nameMatch: nameMatch ? nameMatch[1] : null,
      urlMatch: urlMatch ? urlMatch[1] : null,
      categoryMatch: categoryMatch ? categoryMatch[1] : null,
      descriptionMatch: descriptionMatch ? descriptionMatch[1] : null,
      tags
    });
    
    const gameName = nameMatch ? nameMatch[1].trim() : '';
    const gameUrl = urlMatch ? urlMatch[1].trim() : '';
    const gameCategory = categoryMatch ? categoryMatch[1].trim().toLowerCase().split(' ')[0] : '';
    const gameDescription = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    console.log('Extracted game details:', {
      gameName,
      gameUrl,
      gameCategory,
      gameDescription,
      tags
    });
    
    // Filter out any tags that match the category (redundant)
    const validTags = tags.filter((tag: string) => tag !== gameCategory);
    
    // Check if the issue has the "has-contact-info" label
    const hasContactInfo = data.issue.labels?.some((label: { name?: string }) => 
      label.name?.toLowerCase() === 'has-contact-info'
    );
    console.log('Has contact info label:', hasContactInfo);
    
    // Check the close reason (instead of looking for labels)
    const closeReason = data.issue.state_reason || '';
    console.log('Issue close reason:', closeReason);
    
    // Check if the issue was closed as "completed"
    const isCompleted = closeReason.toLowerCase() === 'completed';
    console.log('Is completed:', isCompleted);
    
    // Check if the issue was closed as "not planned"
    const isRejected = closeReason.toLowerCase() === 'not_planned';
    console.log('Is rejected:', isRejected);
    
    // Get the closing comment if any
    let closingComment = '';
    if (data.issue.comments > 0 && octokit) {
      try {
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
          console.log('Found closing comment:', closingComment);
        } else {
          console.log('No closing comments found');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
    
    // Handle completed/approved suggestions
    if (isCompleted && gameName && gameUrl && gameCategory && gameDescription) {
      console.log('Processing completed game suggestion');
      
      // Add the game to MongoDB
      try {
        const added = await addGameToDataFile(
          gameName, 
          gameUrl, 
          gameDescription, 
          gameCategory,
          validTags
        );
        console.log('Game added to MongoDB:', added);
        
        // Trigger a redeployment to reflect the new game
        // Always trigger redeployment even if the game already exists
        await triggerVercelRedeployment();
        
        // Send notification if contact info is available
        // Send email even if the game already exists (added is false)
        if (hasContactInfo) {
          try {
            // Get the email from the database
            const email = await getContactEmail(data.issue.number);
            console.log('Retrieved contact email:', email);
            
            if (email) {
              try {
                // Send notification email - use 'updated' status if game already exists
                const status = added ? 'added' : 'updated';
                const emailSent = await sendNotification(
                  email,
                  gameName, 
                  status
                );
                console.log(`Notification email sent (${status}):`, emailSent);
                
                // Delete the contact email after it's been used
                if (emailSent) {
                  const deleted = await deleteContactEmail(data.issue.number);
                  console.log('Contact email deleted:', deleted);
                }
                
                console.log(`Sent '${status}' notification to ${email} for game "${gameName}"`);
              } catch (error) {
                console.error('Error sending notification:', error);
              }
            } else {
              console.log(`No email found for issue #${data.issue.number}`);
            }
          } catch (error) {
            console.error('Error processing contact email:', error);
          }
        } else {
          console.log('No contact info available');
        }
        
        return NextResponse.json({ 
          message: added ? 'Game added successfully' : 'Game already exists',
          game: { name: gameName, url: gameUrl, category: gameCategory }
        });
      } catch (error) {
        console.error('Error adding game to MongoDB:', error);
        return NextResponse.json({ error: 'Failed to add game to MongoDB' }, { status: 500 });
      }
    } else {
      console.log('Not processing as completed game suggestion because:',
        !isCompleted ? 'Not marked as completed' : '',
        !gameName ? 'Missing game name' : '',
        !gameUrl ? 'Missing game URL' : '',
        !gameCategory ? 'Missing game category' : '',
        !gameDescription ? 'Missing game description' : ''
      );
    }
    
    // Handle rejected suggestions
    if (isRejected && hasContactInfo) {
      console.log('Processing rejected game suggestion');
      
      try {
        // Get the email from the database
        const email = await getContactEmail(data.issue.number);
        console.log('Retrieved contact email for rejected game:', email);
        
        if (email) {
          try {
            // Send notification email
            const emailSent = await sendNotification(
              email,
              gameName, 
              'rejected', 
              closingComment
            );
            console.log('Rejection notification email sent:', emailSent);
            
            // Delete the contact email after it's been used
            if (emailSent) {
              const deleted = await deleteContactEmail(data.issue.number);
              console.log('Contact email deleted after rejection:', deleted);
            }
            
            console.log(`Sent 'rejected' notification to ${email} for game "${gameName}"`);
          } catch (error) {
            console.error('Error sending rejection notification:', error);
          }
        } else {
          console.log(`No email found for rejected issue #${data.issue.number}`);
        }
        
        return NextResponse.json({ 
          message: 'Rejection notification sent',
          game: { name: gameName }
        });
      } catch (error) {
        console.error('Error processing rejected game:', error);
        return NextResponse.json({ error: 'Failed to process rejected game' }, { status: 500 });
      }
    }
    
    console.log('No action taken for this webhook');
    return NextResponse.json({ message: 'No action taken' });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 