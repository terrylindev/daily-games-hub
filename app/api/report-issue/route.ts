import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

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
    const { title, description, gameName, gameUrl, type } = data;
    
    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create issue body with more structured information
    const issueBody = `
## Issue Report

**Type:** ${type}
${gameName ? `**Game:** ${gameName}` : ''}
${gameUrl ? `**URL:** ${gameUrl}` : ''}

**Description:**
${description}

---
*Submitted via Daily Games Hub*
`;
    
    try {
      // Create GitHub issue with appropriate labels
      const response = await octokit.issues.create({
        owner: process.env.GITHUB_REPO_OWNER || 'owner',
        repo: process.env.GITHUB_REPO_NAME || 'repo',
        title: `${type}: ${title}`,
        body: issueBody,
        labels: ['user-report', type.toLowerCase()]
      });
      
      console.log('GitHub issue created:', response.data.number);
      
      return NextResponse.json({
        success: true,
        message: 'Issue reported successfully',
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
    console.error('Error processing issue report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process issue report' },
      { status: 500 }
    );
  }
} 