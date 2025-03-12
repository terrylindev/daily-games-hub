import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { storeContactEmail, addPendingGameSuggestion } from '@/lib/db';
import { Game } from '@/lib/games-data';

// Initialize Octokit with GitHub token
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!octokit) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }
    
    // Get form data
    const data = await request.json();
    const { name, url, category, description, tags, email } = data;
    
    // Validate required fields
    if (!name || !url || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create issue body
    const issueBody = `
**Name:** ${name}
**URL:** ${url}
**Category:** ${category}
**Tags:** ${tags || ''}

**Description:**
${description}
`;
    
    try {
      // Create GitHub issue
      const response = await octokit.issues.create({
        owner: process.env.GITHUB_REPO_OWNER || 'owner',
        repo: process.env.GITHUB_REPO_NAME || 'repo',
        title: `Game Suggestion: ${name}`,
        body: issueBody,
        labels: email ? ['game-suggestion', 'has-contact-info'] : ['game-suggestion']
      });
      
      console.log('GitHub issue created:', response.data.number);
      
      // If email is provided, save it to the database
      if (email) {
        await storeContactEmail(response.data.number, email);
      }
      
      // Create a game object for the pending suggestion
      const gameData: Game = {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        description: description.trim().slice(0, 100),
        url,
        category,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim().toLowerCase()) : [],
        popularity: 1,
        createdAt: new Date()
      };
      
      // Add to pending games collection
      await addPendingGameSuggestion(
        response.data.number,
        gameData,
        email
      );
      
      return NextResponse.json({
        success: true,
        message: 'Game suggestion submitted successfully',
        issueNumber: response.data.number,
        issueUrl: response.data.html_url
      });
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create GitHub issue' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing game suggestion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process game suggestion' },
      { status: 500 }
    );
  }
} 