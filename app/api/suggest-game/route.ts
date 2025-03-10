import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { storeContactEmail } from '@/lib/db';

// Initialize Octokit with GitHub token
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, url, description, category, categoryName, tags = [], email } = body;
    
    // Validate required fields
    if (!name || !url || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate description length (max 100 characters)
    if (description.length > 100) {
      return NextResponse.json(
        { error: 'Description is too long (max 100 characters)' },
        { status: 400 }
      );
    }
    
    // Ensure all tags are lowercase
    const lowerTags = tags.map((tag: string) => tag.toLowerCase());
    
    // Validate tag length (min 2, max 20 characters)
    const validLengthTags = lowerTags.filter((tag: string) => 
      tag.length >= 2 && tag.length <= 20
    );
    
    if (validLengthTags.length !== lowerTags.length) {
      return NextResponse.json(
        { error: 'Tags must be between 2 and 20 characters' },
        { status: 400 }
      );
    }
    
    // Validate tags (ensure they're not the same as the category)
    const validTags = validLengthTags.filter((tag: string) => tag !== category);
    
    // Ensure we have no more than 3 tags
    if (validTags.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 tags allowed' },
        { status: 400 }
      );
    }
    
    // If GitHub token is not configured, return a helpful error
    if (!octokit) {
      console.error('GitHub token not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later or submit directly on GitHub.' },
        { status: 500 }
      );
    }
    
    // Create GitHub issue
    const issueResponse = await octokit.issues.create({
      owner: 'liny18',
      repo: 'daily-games-hub',
      title: `Game Suggestion: ${name}`,
      body: `## Game Suggestion\n\n` +
        `**Name:** ${name}\n\n` +
        `**URL:** ${url}\n\n` +
        `**Category:** ${categoryName || category}\n\n` +
        (validTags.length > 0 ? `**Tags:** ${validTags.join(', ')}\n\n` : '') +
        `**Description:**\n${description}\n\n` +
        `---\n*Submitted via Daily Games Hub suggestion form*`
    });
    
    // If email is provided, store it securely in the database
    if (email) {
      // Add a label to indicate contact info is available
      await octokit.issues.addLabels({
        owner: 'liny18',
        repo: 'daily-games-hub',
        issue_number: issueResponse.data.number,
        labels: ['has-contact-info']
      });
      
      // Store the email in the database
      await storeContactEmail(issueResponse.data.number, email);
    }
    
    // Return success response with issue URL
    return NextResponse.json({
      success: true,
      message: 'Suggestion submitted successfully',
      issueUrl: issueResponse.data.html_url
    });
    
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return NextResponse.json(
      { error: 'Failed to submit suggestion. Please try again later.' },
      { status: 500 }
    );
  }
} 