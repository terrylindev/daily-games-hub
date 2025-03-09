import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Initialize Octokit with GitHub token
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, url, description, category, categoryName, email } = body;
    
    // Validate required fields
    if (!name || !url || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        `**Description:**\n${description}\n\n` +
        (email ? `**Contact Email:** ${email}\n\n` : '') +
        `---\n*Submitted via Daily Games Hub suggestion form*`
    });
    
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